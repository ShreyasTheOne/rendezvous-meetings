import axios from "axios"
import React, { Component } from 'react'
import {apiCreateCustomMeetingUrl, apiUserSearchUrl, routeMeeting} from "../../../urls"

import { DateTimeInput } from "semantic-ui-calendar-react"
import {
    Form,
    Button,
    Checkbox,
    Modal,
    Popup,
    Message,
    Icon
} from "semantic-ui-react"

const moment = require('moment')

const initialState = {
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
            'error_message': false,
            'meeting_details': {},
            'form_loading': true,
            'copyPopupOpen': false
        }

class CreateCustomMeeting extends Component {

    constructor(props) {
        super(props)
        this.state = initialState
    }

    componentDidMount() {
        this.setInviteeOptions()
    }

    setInviteeOptions = () => {
        this.setState({
            inviteeSearching: true,
            error_message: false
        })
        axios({
            url: apiUserSearchUrl('', true, true)
        }).then(res => {
            this.setState({
                'invitee_options': res.data,
                inviteeSearching: false
            })
        }).catch(e => {
            this.setState({
                'invitee_options': [],
                inviteeSearching: false,
            })
        })
    }

    handleCustomMeetingInputChange = (event, {name, value}) => {
        this.setState({
            'inputs': {
                ...this.state.inputs,
                [name]: value,
            },
            'errors': {
                ...this.state.errors,
                [name]: false,
            },
            error_message: false
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
            },
            error_message: false
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
                },
                error_message: false
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
                meeting_details: res.data.meeting,
                error_message: false
            })
        }).catch(e => {
            this.setState({
                loading: false,
                meeting_error: true,
                error_message: e.response.data.error
            })
        })
    }

    handleModalClose = () => {
        this.setState(initialState)
        this.setInviteeOptions()
        const { setDialogBoxOpenClose, CUSTOM } = this.props
        setDialogBoxOpenClose(CUSTOM, false)
    }

    render () {
        const { open } = this.props
        const { meeting_created, meeting_error, meeting_details, inputs } = this.state

        return (
            <Modal
                open={open}
                onClose={this.handleModalClose.bind(this)}
            >
                <Modal.Header>
                    Custom Meeting
                </Modal.Header>
                <Modal.Content>
                    <Form
                        success={meeting_created}
                        error={meeting_error}
                    >
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
                                    fluid={false}
                                />
                                <Form.Input
                                    name={'start_time'}
                                    label={'Scheduled start time'}
                                    value={moment(meeting_details.scheduled_start_time).calendar()}
                                    transparent
                                    readOnly
                                />
                                </>
                            )
                        }
                        <Form.Input
                            name={'title'}
                            label={'Title'}
                            value = {meeting_created ? (meeting_details.title || 'Not provided') : inputs.title}
                            readOnly={meeting_created}
                            transparent={meeting_created}
                            fluid
                            placeholder="Optional meeting title."
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                        />
                        <Form.TextArea
                            name={'description'}
                            label={'Description'}
                            value = {meeting_created ? (meeting_details.description || 'Not provided') : inputs.description}
                            readOnly={meeting_created}
                            transparent={meeting_created}
                            placeholder="Optional meeting description."
                            fluid
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                        />
                        <Form.Dropdown
                            fluid selection multiple search
                            name={'invitees_selected'}
                            label={'Invited Users'}
                            value={inputs.invitees_selected}
                            loading={this.state.inviteeSearching}
                            options={this.state.invitee_options}
                            placeholder='Invite users to your meeting'
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                            renderLabel={label =>
                                ({
                                    basic: true,
                                    color: "black",
                                    content: `${label.text} - ${label.value}`,
                                    image: {
                                        src: label.image.src,
                                        size: 'tiny',
                                        avatar: true,
                                        spaced: 'right'
                                    }
                                })
                            }
                        />
                        {
                            (!inputs.start_now && !meeting_created) &&
                            <>
                                <label>Scheduled Start time:</label>
                                <DateTimeInput
                                    name="scheduled_start_time"
                                    placeholder="Scheduled start time"
                                    minDate = {moment().format('DD-MM-YYYY HH:MM')}
                                    value={inputs.scheduled_start_time}
                                    onChange={this.handleCustomMeetingInputChange.bind(this)}

                                    hideMobileKeyboard
                                    animation={'scale'}
                                    iconPosition="left"

                                />
                            </>
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
                        {
                            meeting_error &&
                                <Message
                                    error
                                    header='Error'
                                    content={this.state.error_message}
                                />
                        }
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    {!meeting_created &&
                    <Button
                        disabled={this.state.loading}
                        onClick={this.handleModalClose.bind(this)}
                        secondary
                        basic
                    >
                        Cancel
                    </Button>}
                    {meeting_created &&
                        <Popup
                            trigger={
                              <Button
                                  icon
                                  primary
                                  labelPosition={'right'}
                                  onClick={
                                      () => {
                                          navigator.clipboard.writeText(
                                              routeMeeting(meeting_details.code)
                                          )
                                          this.setState({
                                              copyPopupOpen: true
                                          })
                                      }
                                  }
                              >
                                <Icon link name={'copy'} />
                                Copy Joining Link
                            </Button>
                            }
                            onOpen = {() => {
                                this.timeout = setTimeout(() => {
                                this.setState({ copyPopupOpen: false })
                                }, 1000)
                            }}
                            onClose={() => {
                                this.setState({ copyPopupOpen: false })
                                clearTimeout(this.timeout)
                            }}
                            open={this.state.copyPopupOpen}

                            size={'small'}
                            content='Copied!'
                            on='click'
                            basic
                            inverted
                            position='top right'
                        />
                    }
                    <Button
                        loading={this.state.loading}
                        onClick={() => {
                            if (!meeting_created)
                                this.handleCustomMeetingCreate()
                            else
                                this.handleModalClose()
                        }}
                        color="yellow"
                    >
                        { meeting_created ? 'Close' : 'Create' }
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default CreateCustomMeeting
