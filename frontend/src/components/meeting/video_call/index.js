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

import './index.css'
import MediaControls from "./media_controls";
import VideoGrid from "./video_grid";

import {
    createPeerObject,
    createTrackEventHandler,
    createRemoveTrackEventHandler,
    createIceCandidateEventHandler,
    createNegotiationNeededEventHandler
} from "./RTCConnectionFuctions"
import {
    callUsers,
    handleOffer,
    handleAnswer,
    handleIceCandidateMessage
} from "./signalingFunctions"
import {
    toggleAudio,
    toggleVideo
} from "./mediaControlFunctions"


class VideoCall extends Component {

    constructor(props) {
        super(props)

        this.callUsers = callUsers.bind(this)
        this.createPeerObject = createPeerObject.bind(this)
        this.createTrackEventHandler = createTrackEventHandler.bind(this)
        this.createRemoveTrackEventHandler = createRemoveTrackEventHandler.bind(this)
        this.createIceCandidateEventHandler = createIceCandidateEventHandler.bind(this)
        this.createNegotiationNeededEventHandler = createNegotiationNeededEventHandler.bind(this)

        this.handleOffer = handleOffer.bind(this)
        this.handleAnswer = handleAnswer.bind(this)
        this.handleIceCandidateMessage = handleIceCandidateMessage.bind(this)

        this.toggleVideo = toggleVideo.bind(this)
        this.toggleAudio = toggleAudio.bind(this)

        const { UserInformation, code } = this.props
        this.state = {
            me: UserInformation.user,
            loaded: false,
            audioInput: false,
            videoInput: false,
            screenShare: false,
            streams: {}
        }

        this.peer_connections = {}
        this.videoSenders = {}
        this.audioSenders = {}

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

        // console.log("receiving", type, "data", message)

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
            default:
                break
        }
    }

    emitThroughSocket = message => {
        // console.log("emitting", message.type, message.message)
        this.videoCallWebSocket.send(JSON.stringify(message))
    }

    handleParticipantsList = participants_list => {
        let participants_dict = {}
        participants_list.forEach(p => {
            participants_dict[p.uuid] = p
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
            'toggleVideo': this.toggleVideo.bind(this)
        }

        const { streams } = this.state

        return (
            <div id='video-call-container'>
                <div id='video-call-content'>
                    <VideoGrid
                        streams={streams}
                    />
                </div>
                <div id='video-call-controls'>
                    <MediaControls
                        mediaControlFunctions={mediaControlFunctions}
                        audioInput={this.state.audioInput}
                        videoInput={this.state.videoInput}
                        screenShare={this.state.screenShare}
                    />
                </div>
            </div>
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
