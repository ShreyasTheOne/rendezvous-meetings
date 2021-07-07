import React, { Component } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import {Button, Card, Header, Icon, Image, Popup, Segment} from "semantic-ui-react"

const moment = require('moment')

class MeetingsList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            copyPopupOpen: {}
        }
    }

    handleCodeCopy = (code, meetingID) => {
        navigator.clipboard.writeText(code)
        this.setCopyPopupState(meetingID, true)
    }

    onCopyPopupOpen = meetingID => {
        this.timeout = setTimeout(
            () => this.setCopyPopupState(meetingID, false),
            1000
        )
    }

    onCopyPopupClose = (meetingID) => {
        this.setCopyPopupState(meetingID, false)
        clearTimeout(this.timeout)
    }

    setCopyPopupState = (meetingID, state) => {
        this.setState({
            copyPopupOpen: {
                ...this.state.copyPopupOpen,
                [meetingID]: state
            }
        })
    }

    render () {

        const { meetings } = this.props
        const { copyPopupOpen } = this.state

        if (meetings.length === 0) {
            return (
                <Header
                    style={{ fontWeight: 'lighter' }}
                    inverted
                    color={'grey'}
                    content={'No upcoming meetings'}
                />
            )
        }

        return (
            <Scrollbars autoHide style={{ width: '100%' }} >
                <Segment
                    style={{
                        backgroundColor: '#1b1a17',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '1rem',
                    }}
                >
                {meetings.map(meeting => {
                return (
                <Card
                    link
                    fluid
                    key={meeting['code']}
                    style={{
                        width: '90%',
                        alignSelf: 'center',
                        marginTop: '1rem',
                        backgroundColor: '#2C2A26',
                        borderRadius: '5px',
                        border: '1px solid #37352f',
                        padding: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end'
                        }}
                    > {/* first horizontal */}
                        <Header
                            inverted
                            color={'grey'}
                            as={'h1'}
                            textAlign={'left'}
                            style={{
                                fontWeight: 'normal',
                                fontSize: '1.6rem',
                                marginBottom: '0px',
                                textAlign: 'bottom'
                            }}
                        >
                            {meeting['title']}
                        </Header>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            marginTop: '0.5rem'
                        }}
                    > {/* time horizontal */}
                        <Icon
                            inverted
                            style={{ color: '#ffffff' }}
                            name='clock outline'
                        />
                        <span style={{
                            color:'#DCDDDE',
                            marginLeft: '0.5rem'
                        }}>
                            {moment(meeting['scheduled_start_time']).format('LLL')}
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '2rem'
                        }}
                    > {/* users horizontal */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            <Image
                                avatar
                                size={'big'}
                                src={meeting['host']['profile_picture']}
                            />
                            {meeting['invitees'].map(user =>
                                <Image
                                    key={user['uuid']}
                                    avatar
                                    size={'big'}
                                    src={user['profile_picture']}
                                />
                            )}
                        </div>
                        <div>
                            <Popup
                                trigger={
                                  <Button
                                      icon
                                      inverted
                                      labelPosition={'left'}
                                      color={'blue'}
                                      onClick={() => {this.handleCodeCopy(meeting.joining_link, meeting.id)}}
                                  >
                                    <Icon link name={'copy'} />
                                    Copy Joining Link
                                </Button>
                                }
                                onOpen = {() => this.onCopyPopupOpen(meeting.id)}
                                onClose = {() => this.onCopyPopupClose(meeting.id)}
                                open={copyPopupOpen[meeting.id]}
                                size={'small'}
                                content='Copied!'
                                basic
                                inverted
                                on='click'
                                position='top right'
                            />
                        </div>
                    </div>
                </Card>
                )})}
                </Segment>
        </Scrollbars>
        )
    }
}

export default MeetingsList
