import React, {Component} from 'react'
import {Container, Header, Loader} from "semantic-ui-react"
import {connect} from "react-redux"

import {
    setMeetingInformation,
    changeMeetingAdmitted
} from "../../../actions/meeting"
import {
    PENDING_HOST_PERMISSION,
    PENDING_HOST_JOIN
} from "../../../constants/websocketMessageTypes"
import {centerFullPage} from "../../../styles"

class Lobby extends Component {

    render () {

        const { status } = this.props

        if (status === 'loading') {
            return (
                <div style={centerFullPage}>
                    <Loader active/>
                </div>
            )
        }

        let message = "Waiting for the host to "
        if (status === PENDING_HOST_PERMISSION)
            message += "let you in..."
        else if (status === PENDING_HOST_JOIN)
            message += "join..."

        return(
            <div style={centerFullPage}>
                <Loader inverted active>
                    {message}
                </Loader>
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
        SetMeetingInformation: data => {
            return dispatch(setMeetingInformation(data))
        },
        ChangeMeetingAdmitted: newState => {
            return dispatch(changeMeetingAdmitted(newState))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)
