import React, {Component} from "react"
import axios from 'axios'

import {
    Modal,
    Form,
    Button
} from 'semantic-ui-react'
import {getAllUsers} from "../../utils"
import {apiConversationEditUrl} from "../../urls"

const initialState = {
    participant_options: null,
    participant_searching: false,
    inputs: {
        title: '',
        participants_selected: '',
    },
    errors: {
        title: '',
        participants_selected: '',
    },
    loading: false,
    error_message: false
}

class EditConversation extends Component {

    constructor(props) {
        super(props)
        const {conversation} = this.props

        this.initialState = {...initialState}
        let participantsEmails = []

        conversation.participants.forEach(p => {
            participantsEmails.push(p.email)
        })

        this.initialState['inputs']['title'] = conversation.title
        this.initialState['inputs']['participants_selected'] = participantsEmails

        this.state = this.initialState
    }

    componentDidMount() {
        this.setUserOptions()
    }

    setUserOptions = () => {
        this.setState({
            participant_searching: true
        })

        getAllUsers()
            .then(res => {
                this.setState({
                    participant_options: res,
                    participant_searching: false,
                })
            })
    }

    handleModalClose = () => {
        this.setUserOptions()

        const {openCloseEditConversationModal} = this.props
        openCloseEditConversationModal(false)
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

    handleConversationSave = () => {
        const {participants_selected, title} = this.state.inputs

        if (participants_selected.length > 1 && !title) {
            this.setState({
                errors: {
                    ...this.state,
                    title: true
                }
            })
            return
        }

        if (participants_selected.length === 0) {
            this.setState({
                errors: {
                    ...this.state,
                    participants_selected: true
                }
            })
            return
        }

        this.setState({
            loading: true
        })

        const {conversationID} = this.props

        axios({
            url: apiConversationEditUrl(),
            method: 'post',
            data: {
                'inputs': this.state.inputs,
                'conversation': conversationID
            }
        }).then(res => {
            this.setState({
                loading: false,
                created: true,
                error_message: false
            })
            window.location.reload()
        }).catch(e => {
            this.setState({
                loading: false,
                created: false,
                meeting_error: true,
                error_message: e.response.data.error
            })
        })
    }

    render () {
        const {
            open,
            openCloseEditConversationModal
        } = this.props

        const {
            created,
            error,
            inputs
        } = this.state

        return (
            <Modal
                open={open}
                size={'small'}
                onClose={() => this.handleModalClose()}
            >
                <Modal.Header>
                    New Conversation
                </Modal.Header>
                <Modal.Content>
                    <Form
                        success={created}
                        error={error}
                    >
                        <Form.Dropdown
                            fluid selection multiple search
                            name={'participants_selected'}
                            label={'Add users to your conversation'}
                            value={inputs.participants_selected}
                            loading={this.state.participant_searching}
                            options={this.state.participant_options}
                            placeholder='Select at least one'
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
                        {inputs.participants_selected.length > 1 &&
                        <Form.Input
                            fluid
                            name={'title'}
                            label={'Title'}
                            readOnly={created}
                            transparent={created}
                            placeholder="Group title."
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                            value = {created ? inputs.title || 'Not provided' : inputs.title}
                        />}
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={this.state.loading}
                        onClick={() => openCloseEditConversationModal(false)}
                        color="black"
                        basic
                    >
                        Cancel
                    </Button>
                    <Button
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        onClick={() => this.handleConversationSave()}
                        primary
                    >
                        Save
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default EditConversation
