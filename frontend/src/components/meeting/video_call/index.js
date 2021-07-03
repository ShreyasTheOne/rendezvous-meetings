import React, { Component } from 'react'
import { connect } from "react-redux"
import {Loader} from "semantic-ui-react"

import {
    PARTICIPANT_LIST,
    PEER_CONNECTION_OFFER,
    ICE_CANDIDATE, PEER_CONNECTION_ANSWER, USER_LEFT
} from "../../../constants/websocketMessageTypes"

import {apiWSVideoCall} from "../../../urls"
import {centerFullParent} from "../../../styles"

import {setParticipantsList} from "../../../actions/meeting"

import {
    callUsers,
    handleAnswer,
    handleIceCandidateMessage,
    handleOffer
} from "./signalingFunctions"
import {
    createIceCandidateHandler,
    createNegotiationNeededHandler,
    createOnTrackHandler,
    createPeerConnection
} from "./RTCConnectionFuctions"
import {
    toggleAudio,
    toggleScreenShare,
    toggleVideo
} from "./mediaControlFunctions"

import VideoGrid from "./video_grid"
import MediaControls from "./media_controls"

import './index.css'

class VideoCall extends Component {

    constructor(props) {
        super(props)

        // Set imported functions as class functions
        this.callUsers = callUsers.bind(this)
        this.createPeerConnection = createPeerConnection.bind(this)
        this.createOnTrackHandler = createOnTrackHandler.bind(this)
        // this.createRemoveTrackEventHandler = createRemoveTrackEventHandler.bind(this)
        this.createIceCandidateHandler = createIceCandidateHandler.bind(this)
        this.createNegotiationNeededHandler = createNegotiationNeededHandler.bind(this)

        this.handleOffer = handleOffer.bind(this)
        this.handleAnswer = handleAnswer.bind(this)
        this.handleIceCandidateMessage = handleIceCandidateMessage.bind(this)

        this.toggleVideo = toggleVideo.bind(this)
        this.toggleAudio = toggleAudio.bind(this)
        this.toggleScreenShare = toggleScreenShare.bind(this)

        const { UserInformation, code } = this.props

        this.state = {
            loaded: false, // Meeting loaded state
            me: UserInformation.user,
            streams: {},
            inputs: {
                'audio': false,
                'video': false,
                'screen': false
            }
        }

        this.IceCandidates = {}

        this.peer_connections = {}
        this.videoSenders = {}

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

    /**
     * Delete the peer connection and stream for the user that left, and remove the user
     * from the list of participants
     * @param  {Object<User>} message   The user which just left the meeting
     */
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

    /**
     * Convert the list of participants into a dictionary where each key is a uuid associated
     * with the participant object
     * @param  {Array<User>} participants_list   The list of participants currently in the meeting
     */
    handleParticipantsList (participants_list) {
        let participants_dict = {}
        participants_list.forEach(p => {
            participants_dict[p['uuid']] = p
        })
        this.props.SetParticipantsList(participants_dict)
    }

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
