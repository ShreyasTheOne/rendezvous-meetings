import React, { Component } from 'react'
import {connect} from "react-redux"
import {
    Icon,
    Popup,
    Button,
    Card,
    Header
} from 'semantic-ui-react'
import {setParticipantsList} from "../../../../actions/meeting"
import {fitText} from "../../../../utils"
import './index.css'

class MediaControls extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { audioInput, videoInput, screenShare } = this.props
        const { MeetingInformation } = this.props
        const { meeting } = MeetingInformation

        const handle = this.props.mediaControlFunctions

        return (
            <>
            <div id='media-controls'>
                <Icon.Group>
                    <Icon
                        link
                        color={audioInput ? 'green' : 'red'}
                        inverted
                        size={'big'}
                        name='microphone'
                        onClick={handle['toggleAudio']}
                    />
                </Icon.Group>

                <Icon.Group>
                    <Icon
                        link
                        color={videoInput ? 'green' : 'red'}
                        inverted
                        size={'big'}
                        name='camera'
                        onClick={handle['toggleVideo']}
                    />
                </Icon.Group>

                <Icon.Group>
                    <Icon
                        link
                        color={screenShare ? 'green' : 'red'}
                        inverted
                        size={'big'}
                        name='desktop'
                        onClick={handle['toggleScreenShare']}
                    />
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
                        />
                    }
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
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(MediaControls)
