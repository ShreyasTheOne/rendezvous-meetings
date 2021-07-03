import React, { Component } from 'react'
import {connect} from "react-redux"
import {
    Card,
    Image,
    Header
} from 'semantic-ui-react'

import {setParticipantsList} from "../../../../actions/meeting"
import {getVideoGridDimensions} from "../../../../utils"

import './index.css'

class VideoGrid extends Component {

    componentDidMount() {
        this.setStreams()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.setStreams()
    }

    setStreams () {
        const { streams } = this.props
        Object.keys(streams).forEach(uuid => {
            if (streams[uuid]) {
                const audioTracks = streams[uuid].getAudioTracks()
                const videoTracks = streams[uuid].getVideoTracks()

                if (audioTracks.length>0 || videoTracks.length>0) {
                    let videoElement = document.getElementById(`user-video-${uuid}`)
                    if (videoElement) {
                        videoElement.onloadedmetadata = function(e) {
                            videoElement.play()
                        }
                        try {
                            videoElement.srcObject = streams[uuid]
                        } catch (err) {
                            console.log("Error in setting video Source", err);
                        }
                    }
                }
            }
        })
    }

    render () {
        const { MeetingInformation, streams } = this.props
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
                    const streamExists = streams[uuid] && streams[uuid].getVideoTracks().length > 0
                    const fadeExists = streamExists ? 'fade' : ''

                    return (
                        <Card
                            raised
                            key={uuid}
                            style={cardStyle}
                        >
                            <video
                                id={`user-video-${uuid}`}
                                // muted={uuid === me.uuid}
                                muted
                                hidden={!streamExists}
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

export default connect(mapStateToProps, mapDispatchToProps)(VideoGrid)
