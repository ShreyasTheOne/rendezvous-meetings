import {connect} from "react-redux"
import React, { Component } from 'react'
import {
    Loader,
    Header,
    Card,
    TransitionablePortal,
    List,
    Button,
    Image
} from "semantic-ui-react"

import Lobby from "../lobby"
import {
    ADMIT_USER,
    MEETING_INFORMATION,
    PENDING_HOST_JOIN,
    PENDING_HOST_PERMISSION,
    REJECT_USER,
} from "../../../constants/websocketMessageTypes"
import {
    changeMeetingLoaded,
    changeMeetingAdmitted,
    setMeetingInformation
} from "../../../actions/meeting"

import {apiWSRoom, route404} from "../../../urls"
import './index.css'

class Meeting extends Component {

    constructor(props) {
        super(props)

        this.state = {
            lobbyStatus: 'loading',
            join_requests: [],
        }
    }

    componentDidMount () {
        const { code } = this.props.match.params
        this.roomWebSocket = new WebSocket(apiWSRoom(code))

        this.roomWebSocket.addEventListener('message', this.handleSocketMessage.bind(this))

        this.roomWebSocket.onopen = event => {
            this.props.ChangeMeetingLoaded(true)
        }

        this.roomWebSocket.onclose = event => {
            window.location = route404()
        }
    }

    handleSocketMessage = event => {
        const message = JSON.parse(event.data)
        const type = message.type
        const data = message.message

        console.log("receiving", type, "message", message)

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

    render () {
        const { MeetingInformation } = this.props
        const { loaded } = MeetingInformation

        if (!loaded)  {
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

        return (
            <div id='meeting-container'>
                <Header inverted> You are in! </Header>

                <TransitionablePortal
                    open={this.state.join_requests.length > 0}
                >
                    <Card
                        style={{
                            left: '30%',
                            top: '40%',
                            width: '40%',
                            position: 'fixed',
                            zIndex: 1000
                        }}
                    >
                        <Card.Content header={'The following users request permission to be admitted to the meeting'}/>
                        <Card.Content>
                            {
                                this.state.join_requests.map(user => {
                                    return (
                                        <List
                                            key={user.uuid}
                                            animated
                                            divided
                                            verticalAlign='middle'
                                        >
                                            <List.Item>
                                                <List.Content floated='right'>
                                                    <Button
                                                        onClick={
                                                            () => {
                                                                this.handleJoinRequest(user['uuid'], ADMIT_USER)
                                                            }
                                                        }
                                                        positive
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        onClick={
                                                            () => {
                                                                this.handleJoinRequest(user['uuid'], REJECT_USER)
                                                            }
                                                        }
                                                        negative
                                                    >
                                                        Reject
                                                    </Button>
                                                </List.Content>
                                                <Image avatar src={user['profile_picture']}/>
                                                <List.Content>{user['full_name']} - {user['email']}</List.Content>
                                            </List.Item>
                                        </List>
                                    )
                                })
                            }
                        </Card.Content>
                    </Card>
                </TransitionablePortal>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Meeting)
