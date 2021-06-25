import React, { Component } from 'react'

import VideoCall from "../videoCall"
import MeetingSidePanel from "../sidePanel"

import './css/index.css'

class Meeting extends Component {

    render () {
        const meeting_code = this.props.match.params.code
        console.log("meeting parent", meeting_code)
        return (
            <div id='meeting-container'>
                <div id='meeting-content'>
                    <VideoCall code={meeting_code}/>
                    <MeetingSidePanel code={meeting_code}/>
                </div>
            </div>
        )
    }
}

export default Meeting