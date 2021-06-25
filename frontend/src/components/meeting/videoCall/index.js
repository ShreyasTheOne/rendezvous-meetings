import React, { Component } from 'react'
import {connect} from "react-redux"
import {apiWSVideoCall} from "../../../urls"
import {
    Loader,
    Button,
    Icon,
    Popup,
    Header,
    Card
} from "semantic-ui-react"

import {
    MEETING_INFORMATION,
    PARTICIPANT_LIST,
    ICE_CANDIDATE,
    PEER_CONNECTION_OFFER,
    PEER_CONNECTION_ANSWER,
    USER_JOINED
} from "../../../constants/websocketMessageTypes"
import {
    addStream,
    setMeetingInformation,
    setParticipantsList,
    changeMeetingLoaded
} from "../../../actions/meeting"

import './css/index.css'
import {centerFullPage} from "../../../styles"
import VideoGrid from "./videoGrid"
import {fitText} from "../../../utils";


const iceServers = [
    {
        urls: 'stun:stun.l.google.com:19302'
    },
]


class VideoCall extends Component {

    constructor(props) {
        super(props)
        const { code, UserInformation } = this.props
        this.state = {
            meeting_code: code,
            me: UserInformation.user
        }
        this.websocketClient = new WebSocket(apiWSVideoCall(code))
    }

    componentDidMount() {
        this.websocketClient.onmessage = event => {
            const message = JSON.parse(event.data)
            const type = message.type
            const data = message.message

            console.log("receiving", type)

            switch (type) {
                case MEETING_INFORMATION:
                    this.props.SetMeetingInformation(data)
                    break
                case USER_JOINED:
                    this.handleUserJoin(data)
                    break
                case PARTICIPANT_LIST:
                    this.createPeerConnections(data)
                    break
                case PEER_CONNECTION_OFFER:
                    this.receiveCall(data)
                    break
                case PEER_CONNECTION_ANSWER:
                    this.handleAnswer(data)
                    break
                case ICE_CANDIDATE:
                    this.handleIceCandidateMessage(data)
                    break
                default:
                    break
            }
        }
    }

    emitThroughSocket = message => {
        this.websocketClient.send(JSON.stringify(message))
    }

    handleUserJoin = user => {
        const { participants } = this.props.MeetingInformation
        participants[user.uuid] = user
        this.props.SetParticipantsList(participants)
    }

    createPeerConnections = users => {
        console.log("Creating peer connections")
        const { me } = this.state


        // Store my stream

        let participants = {}
        let myStream
        new Promise((resolve, reject) => {
            users.forEach(user => {
                if (user.uuid === me.uuid) {
                    console.log("Found myself!")
                    participants[user.uuid] = user
                    navigator.mediaDevices
                        .getUserMedia({
                            audio: true,
                            video: true
                        })
                        .then(stream => {
                            console.log("navigator streams", stream)
                            myStream = stream
                            this.props.AddStream(stream, me.uuid)
                            resolve()
                        })
                        .catch(e => {console.log("Error getting my own stream", e)})
                }
            })
        }).then(() => {
            console.log("My stream", myStream)
            this.props.SetParticipantsList(participants)
            new Promise((resolve, reject) => {
                users.forEach(user => {
                    /*
                        I am a participant, but I will not create a peer connection
                        with myself
                    */
                    if (user.uuid === me.uuid) {
                        if (users[users.length-1].uuid === user.uuid) resolve()
                        return
                    }

                    participants[user.uuid] = user

                    // Call user
                    let pc = new RTCPeerConnection({iceServers})
                    myStream.getTracks().forEach(
                        track => pc.addTrack(track, myStream)
                    )

                    // Handle IceCandidate Event
                    pc.onicecandidate = this.createIceCandidateEventHandler(user.uuid, me.uuid)

                    // Handle case when other peer adds a track
                    pc.ontrack = this.createTrackEventHandler(user.uuid)

                    // This function is called first, that creates the offer
                    pc.onnegotiationneeded = this.createNegotiationNeededEventHandler(pc, user.uuid, me.uuid)

                    participants[user.uuid]['pc'] = pc

                    // Set props every time (In case someone's response comes back quickly)
                    this.props.SetParticipantsList(participants)
                    if (users[users.length-1].uuid === user.uuid) resolve()
                })
            }).then(() => this.props.ChangeMeetingLoaded(true))
        })
    }

    createTrackEventHandler = userID => {
        console.log("createTrackEventHandler")
        return event => {
            console.log("Getting stream from", userID)
            this.props.AddStream(event.streams[0], userID)
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
            }
        }
    }

    handleIceCandidateMessage = message => {
        if (message.targetID !== this.state.me.uuid) return

        const { MeetingInformation } = this.props
        const { participants } = MeetingInformation

        const candidate = new RTCIceCandidate(message.candidate)
        participants[message.senderID]['pc']
            .addIceCandidate(candidate)
            .then(() => {
                console.log("received Ice Candidate Message")
                this.props.SetParticipantsList(participants)
            })
    }

    createNegotiationNeededEventHandler = (pc, targetID, senderID) => {
        console.log("createNegotiationNeededEventHandler")
        return () => {
            pc.createOffer().then(offer => {
                return pc.setLocalDescription(offer)
            }).then(() => {
                console.log("Sending call")
                this.emitThroughSocket({
                    type: PEER_CONNECTION_OFFER,
                    message: {
                        targetID,
                        senderID,
                        sdp: pc.localDescription
                    }
                })
            }).catch(e => {})
        }
    }

    receiveCall = message => {
        // If I am not the target, return
        console.log("Received call")
        if (message.targetID !== this.state.me.uuid) return

        const { senderID, targetID, sdp } = message
        const { streams } = this.props.MeetingInformation

        const myStream = streams[targetID]
        let pc = new RTCPeerConnection({iceServers})
        myStream.getTracks().forEach(
            track => pc.addTrack(track, myStream)
        )
        console.log("My stream in receive call", myStream)

        pc.onicecandidate = this.createIceCandidateEventHandler(
            senderID, // The sender is the target for our response
            targetID  // We are the sender of this response
        )

        pc.ontrack = this.createTrackEventHandler(senderID)

        const remoteDescription = new RTCSessionDescription(sdp)
        pc.setRemoteDescription(remoteDescription)
            .then(() => {
                return pc.createAnswer()
            })
            .then(answer => {
                console.log("Setting answer as local description")
                return pc.setLocalDescription(answer)
            }).then(() => {
                console.log("Sending answer")
                this.emitThroughSocket({
                    type: PEER_CONNECTION_ANSWER,
                    message: {
                        targetID: senderID, // The sender is the target for our response
                        senderID: targetID, // We are the sender of this response
                    }
                })
            })
    }

    handleAnswer = message => {
        if (message.targetID !== this.state.me.uuid) return

        const { MeetingInformation } = this.props
        const { participants } = MeetingInformation

        const desc = new RTCSessionDescription(message.sdp)
        participants[message.senderID]['pc'].setRemoteDescription(desc).catch(e => {})

        this.props.SetParticipantsList(participants)
    }

    render () {
        const { MeetingInformation } = this.props
        const { loaded } = MeetingInformation
        console.log("video call loaded state:", loaded)
        if (!loaded)  {
            console.log("video call loaded state inside:", loaded)
            return (
                <div style={centerFullPage}>
                    <Loader active/>
                </div>
            )
        }
        const { meeting } = MeetingInformation

        console.log("video call loaded state about to render videogrid:", loaded)

        return (
            <div id='video-call-container'>
                <div id='video-call-content'>
                    <VideoGrid/>
                </div>
                <div id='video-call-controls'>
                    <div id='media-controls'>
                        <Icon.Group>
                            <Icon
                                link
                                color={'green'}
                                inverted
                                size={'big'}
                                name='microphone'
                            />
                            {/*<Icon size='huge' color='red' name='dont' />*/}
                        </Icon.Group>

                        <Icon.Group>
                            <Icon
                                link
                                color={'green'}
                                inverted
                                size={'big'}
                                name='microphone'
                            />
                            {/*<Icon size='huge' color='red' name='dont' />*/}
                        </Icon.Group>

                        <Icon.Group>
                            <Icon
                                link
                                color={'green'}
                                inverted
                                size={'big'}
                                name='microphone'
                            />
                            {/*<Icon size='huge' color='red' name='dont' />*/}
                        </Icon.Group>
                    </div>
                    <div id='end-meeting'>
                        <Button
                            size={'big'}
                            color='google plus'
                        >
                            <Icon name='sign-out' />
                            Leave Meeting
                        </Button>
                    </div>
                    <div id='meta-buttons'>
                        <Popup
                            style={{
                                padding: 0
                            }}
                            on='click'
                            trigger={
                                <Icon
                                    link
                                    inverted
                                    size={'big'}
                                    name='info circle'
                                />}
                        >
                            <Card raised>
                                <Card.Content>
                                    <Card.Header>
                                        { meeting.title || meeting.code }
                                    </Card.Header>
                                    <Card.Meta>
                                        {
                                            meeting.title ?
                                                '' :
                                                meeting.code
                                        }
                                    </Card.Meta>
                                    <Card.Description>
                                        {
                                            meeting.description ||
                                                'No Description provided'
                                        }
                                    </Card.Description>
                                </Card.Content>
                            </Card>
                        </Popup>
                        <Header
                            as={'h2'}
                            inverted
                            style={{
                                marginLeft: '1rem',
                                marginTop: 0,
                                alignSelf: 'center'
                            }}
                        >
                            {
                                meeting.title ?
                                    fitText(meeting.title) :
                                    meeting.code
                            }
                        </Header>
                    </div>
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
        SetMeetingInformation: data => {
            return dispatch(setMeetingInformation(data))
        },
        SetParticipantsList: participants => {
            return dispatch(setParticipantsList(participants))
        },
        AddStream: (stream, userID) => {
            return dispatch(addStream(stream, userID))
        },
        ChangeMeetingLoaded: newState => {
            return dispatch(changeMeetingLoaded(newState))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoCall)
