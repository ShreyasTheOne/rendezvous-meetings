import React, { Component } from "react"
import {connect} from "react-redux"

import {
    Icon,
    Popup,
    Button,
    Card,
    Header
} from 'semantic-ui-react'
import { fitText } from "../../../../utils"
import './index.css'

class MediaControls extends Component {

    render () {

        const{
            inputs,
            mediaControlFunctions,

            MeetingInformation
        } = this.props

        const { meeting } = MeetingInformation

        return (
            <>
            <div id='media-controls'>
                <Icon.Group>
                    <Icon
                        link
                        color={inputs['audio'] ? 'green' : 'red'}
                        inverted
                        size={'big'}
                        name='microphone'
                        onClick={mediaControlFunctions['toggleAudio']}
                    />
                </Icon.Group>

                <Icon.Group>
                    <Icon
                        link
                        color={inputs['video'] ? 'green' : 'red'}
                        inverted
                        size={'big'}
                        name='camera'
                        onClick={mediaControlFunctions['toggleVideo']}
                    />
                </Icon.Group>

                <Icon.Group>
                    <Icon
                        link
                        color={inputs['screen'] ? 'green' : 'red'}
                        inverted
                        size={'big'}
                        name='desktop'
                        onClick={mediaControlFunctions['toggleScreenShare']}
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
        MeetingInformation: state.meetingInformation,
    }
}

export default connect(mapStateToProps, null)(MediaControls)