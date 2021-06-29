import React, { Component } from 'react'
import {connect} from "react-redux"
import {Card, Header, Image} from 'semantic-ui-react'

import './index.css'
import {getVideoGridDimensions} from "../../../../utils"


class VideoGrid extends Component {

    componentDidMount() {
        this.setStreams()
    }
    
    setStreams = () => {
        const { MeetingInformation, streams, UserInformation } = this.props
        const { participants } = MeetingInformation

        console.log("setStreams being called")
        Object.keys(streams).forEach( userID => {
            // console.log("Adding stream outside")
            console.log("streamExistence:", !!streams[userID], participants[userID].full_name)
            if (streams[userID]) {
                const videoTracks = streams[userID].getVideoTracks()
                const audioTracks = streams[userID].getAudioTracks()
                console.log("videoTracks", videoTracks.length)
                console.log("audioTracks", audioTracks.length)
                // console.log("videoTracks", videoTracks, videoTracks.length, userID)

                const videoElement = document.getElementById(`user-video-${userID}`)
                // console.log(videoElement)

                // console.log(videoTracks.length, !!videoElement)
                if ((videoTracks.length > 0 || audioTracks.length>0) && !!videoElement) {
                    console.log("Adding stream inside", participants[userID].full_name, streams[userID])
                    videoElement.srcObject = streams[userID]
                }
            }
        })
    }
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("component updating  ")
        this.setStreams()
    }


    render () {
        // console.log("rendering")
        const { MeetingInformation, streams, UserInformation } = this.props
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
                style={cardGroupStyle}
                centered
                stackable
                itemsPerRow={columns}
            >
                {
                    Object.keys(participants).map( uuid => {
                        const user = participants[uuid]
                        const videoExists = !!streams[uuid] && streams[uuid].getVideoTracks().length > 0
                        console.log("videoExists", videoExists, !!streams[uuid], streams[uuid])
                        if (!!streams[uuid]) console.log("len", streams[uuid].getVideoTracks().length, user['full_name'], me.full_name, videoExists)
                        const fadeExists = videoExists ? 'fade': ''
                        return (
                            <Card
                                raised
                                key={uuid}
                                style={cardStyle}
                            >
                                <video
                                    id={`user-video-${uuid}`}
                                    muted={uuid === me.uuid}
                                    autoPlay
                                    playsInline
                                    hidden={!videoExists}
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
                    })
                }
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

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoGrid)
