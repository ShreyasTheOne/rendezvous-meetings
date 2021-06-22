import axios from "axios"
import React, { Component } from 'react'
import {apiCreateCustomMeetingUrl, apiUserSearchUrl} from "../../../urls"

import { DateTimeInput } from "semantic-ui-calendar-react"
import {
    Form,
    Button,
    Checkbox,
    Modal,
    Message
} from "semantic-ui-react"
import { get_new_results } from "../../../utils"

const moment = require('moment')

class CreateCustomMeeting extends Component {

    constructor(props) {
        super(props)
        this.state = {
            'inputs': {
                'title': '',
                'description': '',
                'invitees_selected': [],
                'scheduled_start_time': '',
                'start_now': false,
            },
            'errors': {
                'title': false,
                'description': false,
                'invitees_selected': false,
                'scheduled_start_time': false,
                'start_now': false,
            },
            'invitee_options': [],
            'loading': false,
            'meeting_created': false,
            'meeting_details': {}
        }
    }

    handleCustomMeetingInputChange = (event, {name, value}) => {
        console.log(value)
        this.setState({
            'inputs': {
                ...this.state.inputs,
                [name]: value,
            },
            'errors': {
                ...this.state.errors,
                [name]: false,
            }
        })
    }

    handleStartNowCheckboxChange = (event, {checked}) => {
        this.setState({
            'inputs': {
                ...this.state.inputs,
                'start_now': checked,
            },
            'errors': {
                ...this.state.inputs,
                'start_now': false,
            }
        })
    }

    handleInviteeSearch = (event, {searchQuery} ) => {
        this.setState({
            inviteeSearching: true
        })

        axios({
            url: apiUserSearchUrl(searchQuery, true)
        }).then(res => {
            this.setState({
                'invitee_options': get_new_results(res.data, this.state.inputs.invitees_selected),
                inviteeSearching: false
            })
        }).catch(e => {
            this.setState({
                'invitee_options': [],
                inviteeSearching: false,
            })
        })
    }

    handleCustomMeetingCreate = () => {
        const {inputs} = this.state
        if (inputs.scheduled_start_time === '' && !inputs.start_now) {
            this.setState({
                'errors': {
                    ...this.state.errors,
                    'start_now': true,
                    'scheduled_start_time': true,
                }
            })
            return
        }

        this.setState({
            loading: true,
        })
        axios({
            method: 'POST',
            url: apiCreateCustomMeetingUrl(),
            data: inputs,
        }).then(res => {
            this.setState({
                loading: false,
                meeting_created: true,
                meeting_details: res.data.meeting
            })
        }).catch(e => {

        })
    }

    render () {
        const { setDialogBoxOpenClose, open, CUSTOM } = this.props
        const { meeting_created, meeting_details, inputs } = this.state

        return (
            <Modal
                closeOnEscape={false}
                open={open}
                onClose={() => setDialogBoxOpenClose(CUSTOM, false)}
            >
                <Modal.Header>
                    Custom Meeting
                </Modal.Header>
                <Modal.Content>
                    <Form success={meeting_created}>
                        {
                            meeting_created &&
                            (
                                <>
                                <Message
                                    success
                                    header='Meeting Created!'
                                    content="Here are the meeting details"
                                />
                                <Form.Input
                                    name={'code'}
                                    label={'Meeting Code'}
                                    value={meeting_details.code}
                                    transparent
                                    readOnly
                                />
                                </>
                            )
                        }
                        <Form.Input
                            name={'title'}
                            label={'Title'}
                            value = {meeting_created ? meeting_details.title : inputs.title}
                            readOnly={meeting_created}
                            fluid
                            placeholder="Optional meeting title."
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                        />
                        <Form.TextArea
                            name={'description'}
                            label={'Description'}
                            value = {meeting_created ? meeting_details.description : inputs.description}
                            readOnly={meeting_created}
                            placeholder="Optional meeting description."
                            fluid
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                        />
                        <Form.Dropdown
                            fluid selection multiple search
                            name={'invitees_selected'}
                            label={'Invite Users'}
                            value={inputs.invitees_selected}
                            readOnly={meeting_created}
                            loading={this.state.inviteeSearching}
                            options={this.state.invitee_options}
                            placeholder='Invite users to your meeting'
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                            onSearchChange={this.handleInviteeSearch.bind(this)}
                            renderLabel={label =>
                                ({
                                    basic: true,
                                    color: "black",
                                    content: `${label.text} - ${label.value}`,
                                    image: {
                                        src: label.img,
                                        size: 'tiny',
                                        avatar: true,
                                        spaced: 'right'
                                    }
                                })
                            }
                        />
                        <Form.Group inline>
                            {
                                (!inputs.start_now || meeting_created) &&
                                <DateTimeInput
                                    name="scheduled_start_time"
                                    placeholder="Scheduled start time"
                                    value={meeting_created ? meeting_details.scheduled_start_time : inputs.scheduled_start_time}
                                    minDate = {moment().format('DD-MM-YYYY HH:MM')}
                                    iconPosition="left"
                                    onChange={this.handleCustomMeetingInputChange.bind(this)}
                                />
                            }
                            {   !meeting_created &&
                                <Checkbox
                                    name='start_now'
                                    label={'Start now'}
                                    error={this.state.errors.start_now.toString()}
                                    checked={this.state.inputs.start_now}
                                    onChange={this.handleStartNowCheckboxChange.bind(this)}
                                />
                            }
                        </Form.Group>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={this.state.loading}
                        onClick={() => setDialogBoxOpenClose(CUSTOM, false)}
                        secondary
                        basic
                    >
                        Cancel
                    </Button>
                    <Button
                        loading={this.state.loading}
                        onClick={() => this.handleCustomMeetingCreate()}
                        color="red"
                    >
                        Create
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default CreateCustomMeeting
