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

    constructor(props) {
        super(props)
        this.videoRefs = {}

    }

    componentDidMount() {
        // const { participants } = this.props.MeetingInformation
        // console.log("participants", participants)
        // Object.keys(participants).forEach(uuid => {
        //     if (!this.videoRefs.hasOwnProperty(uuid))
        //         this.videoRefs[uuid] = React.createRef()
        // })
        this.setStreams()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // const { participants } = this.props.MeetingInformation
        // console.log("participants", participants)
        // Object.keys(participants).forEach(uuid => {
        //     if (!this.videoRefs.hasOwnProperty(uuid))
        //         this.videoRefs[uuid] = React.createRef()
        // })
        this.setStreams()
    }

    setStreams () {
        const { streams, MeetingInformation } = this.props
        const {participants} = MeetingInformation
        console.log("participants", participants)
        Object.keys(streams).forEach(uuid => {
            if (streams[uuid]) {
                const audioTracks = streams[uuid].getAudioTracks()
                const videoTracks = streams[uuid].getVideoTracks()

                if (audioTracks.length>0 || videoTracks.length>0) {
                    console.log("Got a track from the stream", participants[uuid].full_name)
                    let videoElement = document.getElementById(`user-video-${uuid}`)
                    // let videoElement = this.videoRefs[uuid].current
                    if (videoElement) {
                        videoElement.onloadedmetadata = function(e) {
                            videoElement.play()
                        }
                        console.log(streams[uuid] instanceof MediaStream)
                        if ('srcObject' in videoElement) {
                            // videoElement.srcObject = streams[uuid];
                            try {
                                videoElement.srcObject = streams[uuid]
                                console.log("Stream set as source object to video element", participants[uuid].full_name, videoElement.id)
                            } catch (err) {
                                console.log("Error in setting video Source", err);
                            }
                        } else {
                            // Avoid using this in new browsers, as it is going away.
                            videoElement.src = URL.createObjectURL(streams[uuid]);
                            console.log("Stream set as url object to video element", participants[uuid].full_name)
                        }

                        console.log("src-object", videoElement.srcObject, videoElement.srcObject.getVideoTracks())
                    }
                }
            }
        })
    }

    render () {
        const { MeetingInformation, UserInformation, streams } = this.props
        const { participants } = MeetingInformation
        const me = UserInformation.user

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
