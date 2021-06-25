import React, { Component } from 'react'
import {connect} from "react-redux"
import { Card } from 'semantic-ui-react'

import './css/index.css'
import {getVideoGridDimensions} from "./dimensions"


class VideoGrid extends Component {

    constructor(props) {
        super(props)
        const { streams } = this.props.MeetingInformation

        this.videoRefs = {}
        Object.keys(streams).forEach(uuid => {
            this.videoRefs[uuid] = React.createRef()
        })
    }

    componentDidMount() {
        const { streams } = this.props.MeetingInformation
        // console.log("MY ID", this.props.UserInformation.user.uuid)
        Object.keys(streams).forEach( userID => {
            // console.log("Adding stream outside")
            // console.log("videoRef", this.videoRefs, userID)
            if (streams[userID] && this.videoRefs[userID].current) {
                // console.log(streams[userID], this.videoRefs[userID].current)
                // console.log("Adding stream inside")
                this.videoRefs[userID].current.srcObject = streams[userID]
            }
        })
    }


    render () {
        const { MeetingInformation } = this.props
        const { meeting, participants, streams } = MeetingInformation

        // const n = 13
        // let participants = {}
        // for (let i=0; i<n; i++) {
        //     participants[`${i}`] = i;
        // }
        //
        // console.log(Object.keys(participants).length)
        // console.log("rendering video grid with number of participants:", Object.keys(participants).length)
        const dimensions = getVideoGridDimensions(Object.keys(participants).length)
        // console.log("Obtained dimensions:", dimensions)
        const rows = dimensions[0]
        const columns = dimensions[1]
        const cardGroupStyle = rows === 1 ?
                                {
                                    justifySelf: 'center',
                                    alignSelf: 'center',
                                    height: '50%',
                                    width: '100%'
                                }
                                :
                                {
                                    justifySelf: 'center',
                                    alignSelf: 'center',
                                    height: '100%',
                                    width: '100%'
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
                        return (
                            <Card
                                raised
                                key={uuid}
                            >
                                <video
                                    style={{
                                        zIndex: 5,
                                        // width: '100%',
                                        // height: '100%'
                                    }}
                                    muted
                                    id={uuid}
                                    className={`attendee-video`}
                                    ref={this.videoRefs[uuid]}
                                    playsInline
                                    autoPlay
                                />
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
