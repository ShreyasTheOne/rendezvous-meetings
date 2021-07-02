import React, { Component } from 'react'
import { connect } from "react-redux"
import {setParticipantsList} from "../../../actions/meeting"
import {apiWSVideoCall} from "../../../urls"
import {centerFullParent} from "../../../styles"
import {Loader} from "semantic-ui-react"
import {
    PARTICIPANT_LIST,
    PEER_CONNECTION_OFFER,
    ICE_CANDIDATE, PEER_CONNECTION_ANSWER, USER_LEFT
} from "../../../constants/websocketMessageTypes"
import VideoGrid from "./video_grid"
import MediaControls from "./media_controls"
import './index.css'

const pcConfig = {
    'iceServers': [
        {
            'urls': 'turn:turn.bistri.com:80',
            'credential': 'homeo',
            'username': 'homeo'
        },
        {
            'url': 'turn:turn.anyfirewall.com:443?transport=tcp',
            'credential': 'webrtc',
            'username': 'webrtc'
        }
    ]
}

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}

class VideoCall extends Component {

    constructor(props) {
        super(props)
        const { UserInformation, code } = this.props
        this.state = {
            loaded: false,
            me: UserInformation.user,
            streams: {},
            inputs: {
                'audio': false,
                'video': false,
                'screen': false
            }
        }

        this.peer_connections = {}
        this.videoSenders = {}
        this.IceCandidates = {}

        this.videoCallWebSocket = new WebSocket(apiWSVideoCall(code))
    }

    componentDidMount () {
        this.videoCallWebSocket.onmessage = this.handleVCWebSocketMessage.bind(this)
    }

    handleVCWebSocketMessage = event => {
        let message = JSON.parse(decodeURIComponent(event.data))
        const type = message.type
        message = message.message

        console.log("type", type)
        switch (type) {
            case PARTICIPANT_LIST:
                this.handleParticipantsList(message)
                this.callUsers(message)
                this.setState({loaded: true})
                break
            case ICE_CANDIDATE:
                this.handleIceCandidateMessage(message)
                break
            case PEER_CONNECTION_OFFER:
                this.handleOffer(message)
                break
            case PEER_CONNECTION_ANSWER:
                this.handleAnswer(message)
                break
            case USER_LEFT:
                this.handleUserLeft(message)
                break
            default:
                break
        }
    }

    emitThroughSocket = message => {
        this.videoCallWebSocket.send(encodeURIComponent(JSON.stringify(message)))
    }

    handleUserLeft (message) {
        const { uuid } = message
        let { streams } = this.state
        if (streams.hasOwnProperty(uuid)) {
            delete streams[uuid]
        }
        this.setState({
            streams
        })

        if (this.peer_connections[uuid]) {
            if (this.peer_connections[uuid].connectionState !== 'closed') {
                this.peer_connections[uuid].close()
            }
            delete this.peer_connections[uuid]
        }

        let { participants } = this.props.MeetingInformation
        if (participants.hasOwnProperty(uuid)) {
            delete participants[uuid]
        }
        this.props.SetParticipantsList(participants)
    }

    handleParticipantsList (participants_list) {
        let participants_dict = {}
        participants_list.forEach(p => {
            participants_dict[p['uuid']] = p
        })
        this.props.SetParticipantsList(participants_dict)
    }

    callUsers (users) {
        const { me } = this.state
        users.forEach(user => {
            if (me.uuid === user.uuid) return

            const sender_userID = me.uuid
            const target_userID = user.uuid

            this.peer_connections[user.uuid] = this.createPeerConnection(me.uuid, user.uuid)
            this.peer_connections[user.uuid]
                .createOffer(offerOptions)
                .then(offer => {
                    return this.peer_connections[user.uuid].setLocalDescription(offer)
                })
                .then(() => {
                    this.emitThroughSocket({
                        type: PEER_CONNECTION_OFFER,
                        message: {
                            sender_userID: sender_userID,
                            target_userID: target_userID,
                            sdp: this.peer_connections[user.uuid].localDescription
                        }
                    })
                })
                .catch(() => {
                    console.log("Error sending offer")
                })
        })
    }

    createPeerConnection (sender_userID, target_userID) {
        // let pc = new RTCPeerConnection({iceServers})
        let pc = new RTCPeerConnection(pcConfig)

        pc.onicecandidate = this.createIceCandidateHandler(sender_userID, target_userID).bind(this)
        pc.oniceconnectionstatechange = e => {
            console.log("new iceState", pc.iceConnectionState, e)
        }
        pc.onnegotiationneeded = this.createNegotiationNeededHandler(pc, sender_userID, target_userID).bind(this)
        pc.ontrack = this.createOnTrackHandler(target_userID).bind(this)

        pc.onremovestream = e => {
            this.setState({
            streams: {
                ...this.state.streams,
                [target_userID]: e.stream
            }
        })
        }

        return pc
    }

    createIceCandidateHandler (sender_userID, target_userID) {
        return event => {
            if (event.candidate) {
                this.emitThroughSocket({
                    type: ICE_CANDIDATE,
                    message: {
                        target_userID: target_userID,
                        sender_userID: sender_userID,
                        candidate: event.candidate
                    }
                })
            }
        }
    }

    createNegotiationNeededHandler (pc, sender_userID, target_userID) {
        return event => {
            console.log("negotiating")
            pc.createOffer(offerOptions)
                .then(offer => {
                    return pc.setLocalDescription(offer)
                })
                .then(() => {

                    this.emitThroughSocket({
                        type: PEER_CONNECTION_OFFER,
                        message: {
                            sender_userID: sender_userID,
                            target_userID: target_userID,
                            sdp: pc.localDescription
                        }
                    })
                })
                .catch(() => {
                    console.log("Error sending offer")
                })
        }
    }

    createOnTrackHandler (target_userID) {
        return event => {
            let stream = this.state.streams[target_userID]
            if (!stream) stream = new MediaStream()
            stream.addTrack(event.track)

            console.log(event.track)
            console.log("Received track and setting stream aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", stream)
            this.setState({
                streams: {
                    ...this.state.streams,
                    [target_userID]: stream
                }
            })
        }
    }

    handleOffer (message) {
        const { me } = this.state
        const { target_userID, sender_userID } = message
        console.log("Offer received")
        if (target_userID !== me.uuid) return

        console.log("Offer verified")
        const { sdp } = message
        const desc = new RTCSessionDescription(sdp)

        this.peer_connections[sender_userID] = this.createPeerConnection(me.uuid, sender_userID)
        this.peer_connections[sender_userID]
            .setRemoteDescription(desc)
            .then(() => {
                // this.setState({
                //     remoteDescriptionSet: true
                // })
                return this.peer_connections[sender_userID].createAnswer()
            })
            .then(answer => {
                return this.peer_connections[sender_userID].setLocalDescription(answer)
            })
            .then(() => {
                this.emitThroughSocket({
                    type: PEER_CONNECTION_ANSWER,
                    message: {
                        sender_userID: me.uuid,
                        target_userID: sender_userID,
                        sdp: this.peer_connections[sender_userID].localDescription
                    }
                })
            })
            .catch(e => {console.log("Error sending answer", e)})
    }

    handleAnswer (message) {
        const { me } = this.state
        const { target_userID, sender_userID } = message
        if (target_userID !== me.uuid) return

        const { sdp } = message
        const desc = new RTCSessionDescription(sdp)

        this.peer_connections[sender_userID]
            .setRemoteDescription(desc)
            .then(() => {console.log("Remote desc set")})
            .catch(() => {})
    }

    handleIceCandidateMessage (message) {
        const { me } = this.state
        const { target_userID, sender_userID } = message
        if (target_userID !== me.uuid) return

        if (!this.IceCandidates[sender_userID]) {
            this.IceCandidates[sender_userID] = [message.candidate]
        } else {
            this.IceCandidates[sender_userID].push(message.candidate)
        }

        if (this.peer_connections[sender_userID].currentRemoteDescription) {
            this.IceCandidates[sender_userID].forEach(c => {
                const candidate = new RTCIceCandidate(c)
                this.peer_connections[sender_userID]
                    .addIceCandidate(candidate)
                    .then(() => {console.log("Added Ice Candidate")})
            })
            this.IceCandidates[sender_userID] = []
        } else {
            console.log("No remote description set")
        }
    }

    toggleAudio () {}
    toggleVideo () {
        const video_currently_on = this.state.inputs['video']
        const {me} = this.state
        const {participants} = this.props.MeetingInformation

        if (video_currently_on) {
            let stream = this.state.streams[me.uuid]
            if (stream) {
                Object.keys(this.peer_connections).forEach( uuid => {
                    if (uuid === me.uuid) return
                    console.log(this.videoSenders[uuid])
                    this.peer_connections[uuid].removeTrack(this.videoSenders[uuid])
                    delete this.videoSenders[uuid]
                    console.log("removed track from " + participants[uuid].full_name)
                })
                let videoTracks = stream.getVideoTracks()
                videoTracks.forEach(track => {
                    track.stop()
                    stream.removeTrack(track)
                })
            }
            console.log("setting state stream", stream)
            this.setState({
                streams: {
                    ...this.state.streams,
                    [me.uuid]: stream
                },
                inputs: {
                    ...this.state.inputs,
                    'video': false
                }
            })
        } else {
            navigator.mediaDevices.getUserMedia({video: true})
                .then( new_stream => {
                    let videoTracks = new_stream.getVideoTracks()
                    let stream = this.state.streams[me.uuid]
                    if (!stream) stream = new MediaStream()

                    stream.addTrack(videoTracks[0])
                    videoTracks = stream.getVideoTracks()

                    Object.keys(this.peer_connections).forEach(uuid => {
                        if (!!this.peer_connections[uuid]) {
                            console.log("Sending track to", this.props.MeetingInformation.participants[uuid].full_name)
                            if (!this.videoSenders[uuid]) {
                                this.videoSenders[uuid] = this.peer_connections[uuid].addTrack(videoTracks[0], stream)
                            }
                        }
                    })
                    this.setState({
                        streams: {
                            ...this.state.streams,
                            [me.uuid]: stream
                        },
                        inputs: {
                            ...this.state.inputs,
                            'video': true
                        }
                    })
                })
                .catch(e => {console.log("Error getting stream")})
        }
    }
    toggleScreenShare () {}

    render () {
        const { loaded } = this.state

        if (!loaded) {
            return (
                <div style={centerFullParent}>
                    <Loader active/>
                </div>
            )
        }

        const mediaControlFunctions = {
            'toggleAudio': this.toggleAudio.bind(this),
            'toggleVideo': this.toggleVideo.bind(this),
            'toggleScreenShare': this.toggleScreenShare.bind(this),
        }

        return (
            <div id='video-call-container'>
                <div id='video-call-content'>
                    <VideoGrid
                        streams={this.state.streams}
                    />
                </div>
                <div id='video-call-controls'>
                    <MediaControls
                        mediaControlFunctions={mediaControlFunctions}
                        inputs={this.state.inputs}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation,
        MeetingInformation: state.meetingInformation
    }
}

const mapDispatchToProps = dispatch => {
    return {
        SetParticipantsList: data => {
            return dispatch(setParticipantsList(data))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoCall)
