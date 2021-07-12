import React, {Component} from "react"
import axios from 'axios'

import {
    Modal,
    Form,
    Button,
    Header,
    List,
    Image
} from 'semantic-ui-react'
import {getAllUsers} from "../../utils"
import {apiCreateConversationUrl} from "../../urls"
import {Scrollbars} from "react-custom-scrollbars"

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

class CreateConversation extends Component {

    constructor() {
        super()
        this.state = initialState
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
        this.setState(initialState)
        this.setUserOptions()

        const {openCloseCreateConversationModal} = this.props
        openCloseCreateConversationModal(false)
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

    handleConversationCreate = () => {
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

        axios({
            url: apiCreateConversationUrl(),
            method: 'post',
            data: this.state.inputs
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
            openCloseCreateConversationModal
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
                        {created ?
                            <>
                            <Header>
                                Participants
                            </Header>
                            <Scrollbars style={{width: '100%', height: '100px'}}>
                                <List
                                    divided
                                    verticalAlign='middle'
                                >
                                    {
                                        inputs.participants_selected.map(email => {
                                            const user = this.state.participant_options.filter(user => {
                                                return user['email'] === email
                                            })[0]
                                            return (
                                                <List.Item key={user.uuid}>
                                                    <Image avatar src={user['profile_picture']}/>
                                                    <List.Content>{user['full_name']} - {user['email']}</List.Content>
                                                </List.Item>
                                            )
                                        })
                                    }
                                </List>
                            </Scrollbars>
                            </>
                            :
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
                                        content: `${label.text}`,
                                        image: {
                                            src: label.image.src,
                                            size: 'tiny',
                                            avatar: true,
                                            spaced: 'right'
                                        }
                                    })
                                }
                            />
                        }
                        {inputs.participants_selected.length > 1 && <Form.Input
                            fluid
                            name={'title'}
                            label={'Title'}
                            value = {created ? inputs.title || 'Not provided' : inputs.title}
                            readOnly={created}
                            transparent={created}
                            placeholder="Group title."
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                        />}
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={this.state.loading}
                        onClick={() => openCloseCreateConversationModal(false)}
                        color="black"
                        basic
                    >
                        Cancel
                    </Button>
                    <Button
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        onClick={() => this.handleConversationCreate()}
                        primary
                    >
                        Create
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default CreateConversation
