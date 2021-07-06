import {connect} from "react-redux"
import React, { Component } from 'react'
import { Loader } from "semantic-ui-react"

import Lobby from "../lobby"
import {
    BAN_USER,
    MEETING_INFORMATION,
    PENDING_HOST_JOIN,
    PENDING_HOST_PERMISSION, REMOVE_USER,
    USER_JOINED, USER_LEFT,
} from "../../../constants/websocketMessageTypes"
import {
    changeMeetingLoaded,
    changeMeetingAdmitted,
    setMeetingInformation, addParticipant
} from "../../../actions/meeting"

import {apiWSRoom, route404} from "../../../urls"
import './index.css'
import VideoCall from "../video_call";
import JoinRequestPortal from "./joinRequestPortal";
import MeetingSidePanel from "../sidePanel";
import MeetingInfoScreen from "../infoScreen"

class Meeting extends Component {

    constructor(props) {
        super(props)

        this.state = {
            lobbyStatus: 'loading',
            assertedInteraction: false,
            join_requests: [],
            errorCode: null
        }
    }

    componentDidMount () {
        const { code } = this.props.match.params
        const me = this.props.UserInformation.user

        this.roomWebSocket = new WebSocket(apiWSRoom(code))

        this.roomWebSocket.addEventListener('message', this.handleSocketMessage.bind(this))

        this.roomWebSocket.onopen = event => {
            this.props.ChangeMeetingLoaded(true)
        }

        this.roomWebSocket.onclose = event => {
            this.setState({
                errorCode: event.code
            })
        }
    }

    handleSocketMessage = event => {
        const message = JSON.parse(event.data)
        const type = message.type
        const data = message.message

        console.log("receiving", type, "message", data)

        switch (type) {
            case MEETING_INFORMATION:
                this.props.SetMeetingInformation(data)
                this.props.ChangeMeetingAdmitted(true)
                break
            case PENDING_HOST_JOIN:
                this.setState({
                    lobbyStatus: PENDING_HOST_JOIN
                })
                break
            case PENDING_HOST_PERMISSION:
                this.handlePermissionRequest(data)
                break
            case USER_JOINED:
                this.props.AddParticipant(data)
                break
            default:
                break
        }
    }

    emitThroughSocket = message => {
        this.roomWebSocket.send(JSON.stringify(message))
    }

    handlePermissionRequest = data => {
        const {
            UserInformation,
            MeetingInformation
        } = this.props
        const { user } = UserInformation
        const { meeting } = MeetingInformation

        if (meeting['host'] && user['uuid'] === meeting['host']['uuid']) {
            let new_data = this.state.join_requests
            new_data.push(...data)
            this.setState({
                join_requests: new_data
            })
        } else {
            this.setState({
                lobbyStatus: PENDING_HOST_PERMISSION
            })
        }
    }

    handleJoinRequest = (userID, action) => {
        this.emitThroughSocket({
            type: action,
            message: userID
        })

        // Remove request
        let updated_requests = this.state.join_requests.filter(
            user => { return user['uuid'] !== userID }
        )
        this.setState({
            join_requests: updated_requests
        })
    }

    assertInteraction = () => {
        this.setState({
            assertedInteraction: true
        })
    }

    toggleBanUser = userID => {
        this.emitThroughSocket({
            type: BAN_USER,
            message: userID
        })
    }

    toggleRemoveUser = userID => {
        this.emitThroughSocket({
            type: REMOVE_USER,
            message: userID
        })
    }

    toggleMuteUser = userID => {

    }

    toggleCameraUser = userID => {

    }

    render () {
        const { MeetingInformation } = this.props
        const { loaded } = MeetingInformation
        const { errorCode } = this.state

        if (errorCode) {
            return (
                <MeetingInfoScreen code={errorCode}/>
            )
        }

        if (!loaded) {
            return (
                <div id='meeting-container'>
                    <Loader active/>
                </div>
            )
        }

        const { admitted } = MeetingInformation
        if (!admitted) {
            return (
                <div id='meeting-container'>
                    <Lobby status={this.state.lobbyStatus}/>
                </div>
            )
        }

        const { assertedInteraction } = this.state
        if (!assertedInteraction) {
            return (
                <div id='meeting-container'>
                    <Lobby
                        status='assertingInteraction'
                        callback={this.assertInteraction.bind(this)}
                    />
                </div>
            )
        }

        const participantControlFunctions = {
            'ban': this.toggleBanUser.bind(this),
            'remove': this.toggleRemoveUser.bind(this)
        }

        return (
            <div id='meeting-container'>
                <div id='meeting-content'>
                    <VideoCall
                        code={this.props.match.params.code}
                    />
                    <MeetingSidePanel
                        code={this.props.match.params.code}
                        participantControlFunctions={participantControlFunctions}
                    />
                </div>

                <JoinRequestPortal
                    open={this.state.join_requests.length > 0}
                    requests={this.state.join_requests}
                    handleAction={this.handleJoinRequest.bind(this)}
                />
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation,
        MeetingInformation: state.meetingInformation,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        ChangeMeetingLoaded: newState => {
            dispatch(changeMeetingLoaded(newState))
        },
        SetMeetingInformation: newState => {
            dispatch(setMeetingInformation(newState))
        },
        ChangeMeetingAdmitted: newState => {
            dispatch(changeMeetingAdmitted(newState))
        },
        AddParticipant: participant => {
            dispatch(addParticipant(participant))
        },

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Meeting)
