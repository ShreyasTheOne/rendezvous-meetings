import React, {Component} from 'react'
import {connect} from "react-redux"

import {
    Grid,
    Container,
    Header,
    Loader,
    Button
} from "semantic-ui-react"

import {
    setMeetingInformation,
    changeMeetingAdmitted
} from "../../../actions/meeting"
import {
    PENDING_HOST_PERMISSION,
    PENDING_HOST_JOIN
} from "../../../constants/websocketMessageTypes"
import {centerFullPage, centerFullParent} from "../../../styles"

const moment = require('moment')

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

        if (status === 'assertingInteraction') {
            const { MeetingInformation } = this.props
            const { meeting } = MeetingInformation

            return (
                <div style={centerFullPage}>
                    <Container>
                        <Grid>
                            <Grid.Row columns={2}>
                                <Grid.Column>
                                    <Grid.Row>
                                        <Header
                                            as={'h1'}
                                            color={'grey'}
                                            inverted
                                            style={{
                                                fontSize: '5rem',
                                                marginBottom: '2rem'
                                            }}
                                        >
                                            {meeting.title || meeting.code}
                                        </Header>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Header
                                            as={'h1'}
                                            color={'grey'}
                                            size={'huge'}
                                            style={{
                                                marginTop: '0',
                                                marginBottom: '3rem'
                                            }}
                                        >
                                            {meeting.title ? meeting.code : ''} <br/>
                                            Started at {moment(meeting.start_time).format('LT')}
                                        </Header>
                                    </Grid.Row>
                                    <Grid.Row style={{color:'white'}}>
                                        {meeting.description || 'No description provided'}
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column>
                                    <div style={centerFullParent}>
                                        <Button
                                            inverted
                                            size={'huge'}
                                            onClick={this.props.callback}
                                        >
                                            Enter Meeting
                                        </Button>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
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
