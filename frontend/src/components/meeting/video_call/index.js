import React, { Component } from 'react'
import { connect } from "react-redux"
import {setParticipantsList} from "../../../actions/meeting"
import {apiWSVideoCall} from "../../../urls"
import {centerFullParent} from "../../../styles"
import {Loader} from "semantic-ui-react"
import {
    PARTICIPANT_LIST,
    PEER_CONNECTION_OFFER,
    ICE_CANDIDATE, PEER_CONNECTION_ANSWER
} from "../../../constants/websocketMessageTypes"

const iceServers = [
    {
        urls: 'stun:stun.l.google.com:19302'
    },
]

class VideoCall extends Component {

    constructor(props) {
        super(props)
        const { UserInformation, code } = this.props
        this.state = {
            me: UserInformation.user
        }

        this.peer_connections = {}

        this.videoCallWebSocket = new WebSocket(apiWSVideoCall(code))

        this.videoCallWebSocket.onopen = event => {
            console.log(event)
        }
    }

    componentDidMount () {
        this.videoCallWebSocket.onmessage = this.handleVCWebSocketMessage.bind(this)
    }

    handleVCWebSocketMessage = event => {
        let message = JSON.parse(event.data)
        const type = message.type
        message = message.message

        console.log("receiving", type, "data", message)

        switch (type) {
            case PARTICIPANT_LIST:
                this.handleParticipantsList(message)
                this.callUsers(message)
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
            default:
                break
        }
    }

    emitThroughSocket = message => {
        console.log("emitting", message.type, message.message)
        this.videoCallWebSocket.send(JSON.stringify(message))
    }

    handleParticipantsList = participants_list => {
        let participants_dict = {}
        participants_list.forEach(p => {
            participants_dict[p.uuid] = p
        })
        this.props.SetParticipantsList(participants_dict)
    }

    callUsers = users => {
        const { me } = this.state
        users.forEach(user => {
            if (user.uuid === me.uuid) return
            console.log("calling user")

            this.peer_connections[user.uuid] = new RTCPeerConnection({iceServers})

            this.peer_connections[user.uuid].onicecandidate = this.createIceCandidateEventHandler(user.uuid, me.uuid).bind(this)
            this.peer_connections[user.uuid].onnegotiationneeded = e => {console.log("negotiation needed")}
            this.peer_connections[user.uuid]
                .createOffer()
                .then(offer => {
                    console.log("Setting the offer as the local description")
                    return this.peer_connections[user.uuid].setLocalDescription(offer)
                }).then(() => {
                    console.log("About to send offer")
                    this.emitThroughSocket({
                        type: PEER_CONNECTION_OFFER,
                        message: {
                            targetID: user.uuid,
                            senderID: me.uuid,
                            sdp: this.peer_connections[user.uuid].localDescription
                        }
                    })
            console.log(`Offer sent to ${user.uuid}`)
            }).catch(e => {})
            console.log("Created pc with user", user.uuid)
        })
    }

    createPeerConnection = targetID => {
        const { me } = this.state

        let pc = new RTCPeerConnection({iceServers})
        // pc.onnegotiationneeded = this.createNegotiationNeededEventHandler(pc, targetID, me.uuid).bind(this)
    }

    createNegotiationNeededEventHandler = (pc, targetID, senderID) => {
        // console.log("createNegotiationNeededEventHandler")
        return event => {
            // console.log("About to create the offer")
            // pc.createOffer()
            //     .then(offer => {
            //         console.log("Setting the offer as the local description")
            //         return pc.setLocalDescription(offer)
            //     }).then(() => {
            //         this.props.SetOrCreatePeerConnection(targetID, pc)
            //         this.emitThroughSocket({
            //             type: PEER_CONNECTION_OFFER,
            //             message: {
            //                 targetID,
            //                 senderID,
            //                 sdp: pc.localDescription
            //             }
            //         })
            //     console.log(`Offer sent to ${targetID}`)
            //     }).catch(e => {})
        }
    }

    createIceCandidateEventHandler = (targetID, senderID) => {
        console.log("createIceCandidateEventHandler")
        return event => {
            if (event.candidate) {
                this.emitThroughSocket({
                    type: ICE_CANDIDATE,
                    message: {
                        targetID,
                        senderID,
                        candidate: event.candidate,
                    }
                })
                console.log(`Sending ice-candidate message to ${targetID}`)
            }
        }
    }

    handleIceCandidateMessage = message => {
        // Already checked at backend for security, but also
        // check at frontend for security

        if (message.targetID !== this.state.me.uuid) return

        console.log(`Received ice-candidate message from ${message.senderID}`)

        const candidate = new RTCIceCandidate(message.candidate)
        this.peer_connections[message.senderID]
            .addIceCandidate(candidate)
            .then(() => {
                console.log(`Received ice-candidate mentioned by ${message.senderID}`)
            })
    }

    handleOffer = message => {
        // Already checked at backend, but still check at frontend
        const { me } = this.state
        const {targetID, senderID, sdp} = message
        if (targetID !== me.uuid) return

        console.log(`Offer received from ${senderID}`)

        const desc = new RTCSessionDescription(sdp)
        this.peer_connections[senderID] = new RTCPeerConnection({iceServers})
        this.peer_connections[senderID]
            .setRemoteDescription(desc)
            .then(() => {
                return this.peer_connections[senderID].createAnswer()
            })
            .then(answer => {
                return this.peer_connections[senderID].setLocalDescription(answer)
            }).then(() => {
                this.emitThroughSocket({
                    type: PEER_CONNECTION_ANSWER,
                    message: {
                        senderID: targetID,
                        targetID: senderID,
                        sdp: this.peer_connections[senderID].localDescription
                    }
                })
            console.log(`Answer sent to ${senderID}`)
            })
    }

    handleAnswer = message => {
        const { me } = this.state
        const { targetID, senderID, sdp } = message

        // Already checked at backend, but still check at frontend
        if (targetID !== me.uuid) return

        console.log(`Answer received from ${senderID}`)

        const desc = new RTCSessionDescription(sdp)
        this.peer_connections[senderID]
            .setRemoteDescription(desc)
            .then(() => {
                console.log(`Answer remoteDesc set for ${senderID}`)
            })
    }


    render () {
        const { VideoCallInformation } = this.props
        const { loaded } = VideoCallInformation

        if (!loaded) {
            return (
                <div style={centerFullParent}>
                    <Loader active/>
                </div>
            )
        }

        return (
            <div/>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation,
        VideoCallInformation: state.videoCallInformation
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
