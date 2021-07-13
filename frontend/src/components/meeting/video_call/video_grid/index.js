import React, { Component } from 'react'
import {connect} from "react-redux"
import {
    Card,
    Image,
    Header, Icon
} from 'semantic-ui-react'

import {setParticipantsList} from "../../../../actions/meeting"
import {getVideoGridDimensions} from "../../../../utils"

import './index.css'

class VideoGrid extends Component {

    constructor(props) {
        super(props)

        this.new_streams = []
        this.new_participants = []
    }


    componentDidMount() {
        this.setStreams()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.new_streams = []
        this.new_participants = []

        const newStreams = nextProps.streams
        const newParticipants = nextProps.MeetingInformation.participants

        const {streams, MeetingInformation} = this.props
        const {participants} = MeetingInformation

        Object.keys(newStreams).forEach(uuid => {
            const stream = streams[uuid]
            const newStream = newStreams[uuid]

            if (
                (!newStream && stream) ||
                (newStream && stream && newStream.getAudioTracks().length !== stream.getAudioTracks().length) ||
                (newStream && stream && newStream.getVideoTracks().length !== stream.getVideoTracks().length)
            )
            {
                this.setStream(newStream, uuid, participants[uuid].volume)
            }

            if (newStream && !stream) {
                this.new_streams.push(uuid)
            }
        })

        Object.keys(newParticipants).forEach(uuid => {
            const newUser = newParticipants[uuid]
            const user = participants[uuid]

            if (newUser && user) {
                if (newUser.volume !== user.volume) {
                    let videoElement = document.getElementById(`user-video-${uuid}`)
                    videoElement.volume = newUser.volume
                }
            }

            if (newUser && !user) {
                this.new_participants.push(uuid)
            }
        })

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { MeetingInformation, streams } = this.props
        const { participants } = MeetingInformation

        this.new_participants.forEach(uuid => {
            const user = participants[uuid]

            if (user) {
                let videoElement = document.getElementById(`user-video-${uuid}`)
                videoElement.volume = user.volume
            }
        })

        this.new_streams.forEach(uuid => {
            this.setStream(streams[uuid], uuid, participants[uuid].volume)
        })

    }

    setStream (stream, uuid, volume) {
        const audioTracks = stream.getAudioTracks()
        const videoTracks = stream.getVideoTracks()

        let videoElement = document.getElementById(`user-video-${uuid}`)
        if (videoElement) {
            if (audioTracks.length>0 || videoTracks.length>0) {
                videoElement.onloadedmetadata = function(e) {
                    videoElement.play()
                }
                try {
                    videoElement.srcObject = stream
                    videoElement.volume = volume
                } catch (err) {
                    console.log("Error in setting video Source", err);
                }
            }
        }
    }

    setStreams () {
        const { streams, MeetingInformation } = this.props
        const { participants } = MeetingInformation
        Object.keys(streams).forEach(uuid => {
            if (streams[uuid]) {
                const audioTracks = streams[uuid].getAudioTracks()
                const videoTracks = streams[uuid].getVideoTracks()

                let videoElement = document.getElementById(`user-video-${uuid}`)
                if (videoElement) {
                    if (audioTracks.length>0 || videoTracks.length>0) {
                        videoElement.onloadedmetadata = function(e) {
                            videoElement.play()
                        }
                        try {
                            videoElement.srcObject = streams[uuid]
                            videoElement.volume = participants[uuid]['volume']
                        } catch (err) {
                            console.log("Error in setting video Source", err)
                        }
                    }
                }
            }
        })
    }

    render () {
        const { MeetingInformation, streams, UserInformation } = this.props
        const me = UserInformation.user
        const { participants } = MeetingInformation

        const dimensions = getVideoGridDimensions(Object.keys(participants).length)
        const rows = dimensions[0]
        const columns = dimensions[1]

        const cardGroupStyle = {
            justifySelf: 'center',
            alignSelf: 'center',
            width: '100%'
        }
        cardGroupStyle['height'] = rows === 1 ? '50%' : '100%'

        const cardStyle = {
            position: 'relative',
            zIndex: '0',
            backgroundColor: '#161513'
        }

        return (
            <Card.Group
                centered
                stackable
                style={cardGroupStyle}
                itemsPerRow={columns}
            >
                {Object.keys(participants).map(uuid => {
                    const user = participants[uuid]
                    const videoExists = (
                        streams[uuid]
                        && streams[uuid].getVideoTracks().length > 0
                        && streams[uuid].getVideoTracks()[0].enabled
                    )
                    const audioExists = streams[uuid] && streams[uuid].getAudioTracks().length > 0
                    const fadeExists = videoExists ? 'fade' : ''

                    return (
                        <Card
                            raised
                            key={uuid}
                            style={cardStyle}
                        >
                            <video
                                id={`user-video-${uuid}`}
                                muted={me.uuid === uuid}
                                hidden={!videoExists}
                                autoPlay
                                playsInline
                                className={`user-video`}
                            />

                            <div className={'user-picture'}>
                                <Image
                                    avatar
                                    size={'huge'}
                                    src={user['profile_picture']}
                                />
                            </div>

                            <div className={`user-name`}>
                                <span className={fadeExists}>
                                    <Header inverted>
                                        {user['full_name']}
                                    </Header>
                                </span>
                            </div>

                            {!audioExists &&
                            <div className={`user-mic`}>
                                <Icon
                                    name='microphone slash'
                                    circular
                                    inverted
                                    color='grey'
                                />
                            </div>}

                        </Card>
                    )
                })}
            </Card.Group>
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
        SetParticipantsList: data => {
            return dispatch(setParticipantsList(data))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoGrid)
