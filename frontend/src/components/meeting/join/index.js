import React, { Component } from 'react'
import {
    Modal,
    Button,
    Input
} from 'semantic-ui-react'
import {routeMeeting} from "../../../urls"

class JoinMeeting extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            meeting_code: '',
            meeting_code_valid: false
        }
    }

    handleMeetingJoin = () => {
        const { meeting_code_valid, meeting_code } = this.state
        if (meeting_code_valid) {
            window.location = routeMeeting(meeting_code)
        }
    }

    handleMeetingCodeChange = code => {
        const pattern = new RegExp('^[a-z]{3}-[a-z]{3}-[a-z]{3}$')
        this.setState({
            meeting_code_valid: pattern.test(code),
            meeting_code: code
        })
    }

    render () {
        const { setDialogBoxOpenClose, JOIN, open } = this.props
        return (
            <Modal
                size={'mini'}
                open={open}
                onClose={() => setDialogBoxOpenClose(JOIN, false)}
            >
                <Modal.Header>
                    Join Meeting
                </Modal.Header>
                <Modal.Content>
                    <Input
                        placeholder='Meeting code'
                        transparent
                        fluid
                        onChange={(e, d) => this.handleMeetingCodeChange(d.value)}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={this.state.loading}
                        onClick={() => setDialogBoxOpenClose(JOIN, false)}
                        color="black"
                        basic
                    >
                        Cancel
                    </Button>
                    <Button
                        loading={this.state.loading}
                        disabled={this.state.loading || !this.state.meeting_code_valid}
                        onClick={() => this.handleMeetingJoin()}
                        color="blue"
                    >
                        Join
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default JoinMeeting
