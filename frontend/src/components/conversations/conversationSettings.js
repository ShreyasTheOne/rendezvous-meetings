import React, {Component} from "react"
import axios from "axios"

import {
    Button,
    List
} from 'semantic-ui-react'

import EditConversation from "./editConversation"

import {
    apiConversationLeaveUrl,
    apiCreateCustomMeetingUrl,
    routeMeeting
} from "../../urls"

import './index.css'

class ConversationSettings extends Component {

    constructor(props) {
        super(props)

        this.state = {
            openEditConversationModal: false
        }
    }

    /**
     * Starting the meeting from the conversations,
     * invite all users from the conversation and set the
     * conversation name as the meeting title
     */
    startInstantMeeting = () => {
        const {
            selectedConversation,
            informLiveMeetingStart,
            selectedConversationID
        } = this.props

        let invitee_emails = []

        selectedConversation.participants.forEach(c => {
            invitee_emails.push(c.email)
        })

        this.setState({
            loading: true,
            startLoading: true,
        })

        axios({
            method: 'POST',
            url: apiCreateCustomMeetingUrl(),
            data: {
                'start_now': true,
                'title': selectedConversation.title,
                'invitees_selected': invitee_emails,
                'conversation': selectedConversationID
            },
        }).then(res => {
            informLiveMeetingStart()
            window.location = routeMeeting(res.data['meeting']['code'])
        }).catch(e => {})
    }

    joinInstantMeeting = () => {
        const {live_meeting_code} = this.props
        window.location = routeMeeting(live_meeting_code)
    }

    editMeeting = initialState => {
        this.setState({
            editConversationInitialState: initialState,
            openEditConversationModal: true
        })
    }

    leaveMeeting = () => {
        this.setState({
            loading: true,
            removeLoading: true
        })

        const {selectedConversationID} = this.props

        axios({
            url: apiConversationLeaveUrl(),
            method: 'post',
            data: {
                'conversation': selectedConversationID
            }
        }).then(res => {
            window.location.reload()
        }).catch(() => {})
    }

    openCloseEditConversationModal  = state => {
        this.setState({
            openEditConversationModal: state
        })
    }

    render () {
        const {
            live_meeting_code,
            selectedConversationID,
            selectedConversation
        } = this.props

        const {openEditConversationModal} = this.state

        return (
            <div id='conversation-settings'>
                <div id='conversation-actions'>
                    <List style={{width: '100%'}}>
                        <List.Item>
                            {live_meeting_code ?
                                <Button
                                    disabled={this.state.loading}
                                    size={'large'}
                                    color={'green'}
                                    fluid
                                    onClick={() => this.joinInstantMeeting()}
                                >
                                    Join Ongoing Meeting
                                </Button>
                                :
                                <Button
                                    disabled={this.state.loading}
                                    loading={this.state.startLoading}
                                    size={'large'}
                                    color={'blue'}
                                    fluid
                                    onClick={() => this.startInstantMeeting()}
                                >
                                    Start Instant Meeting
                                </Button>
                            }
                        </List.Item>
                        <List.Item style={{marginTop: '2rem'}}>
                            <Button
                                fluid
                                size={'large'}
                                color={'blue'}
                                disabled={this.state.loading}
                                onClick={() => this.editMeeting()}
                            >
                                Edit Conversation
                            </Button>
                        </List.Item>
                        <List.Item style={{marginTop: '2rem'}}>
                            <Button
                                fluid
                                color={'red'}
                                size={'large'}
                                disabled={this.state.loading}
                                loading={this.state.removeLoading}
                                onClick={() => this.leaveMeeting()}
                            >
                                Leave Conversation
                            </Button>
                        </List.Item>
                    </List>
                </div>

                <EditConversation
                    open={openEditConversationModal}
                    openCloseEditConversationModal={this.openCloseEditConversationModal.bind(this)}
                    conversation={selectedConversation}
                    conversationID={selectedConversationID}
                />
            </div>
        )
    }
}

export default ConversationSettings
