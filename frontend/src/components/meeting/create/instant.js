import React, { Component } from 'react'
import {
    Modal,
    Button,
    Input
} from 'semantic-ui-react'
import axios from "axios"
import {apiCreateInstantMeetingUrl, routeMeeting} from "../../../urls"

class CreateInstantMeeting extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
        }
    }

    handleInstantMeetingCreate = () => {
        this.setState({
            loading: true,
        })
        let post_data = {}
        if (this.state.instant_meeting_title)
            post_data['title'] = this.state.instant_meeting_title

        axios({
            method: 'POST',
            url: apiCreateInstantMeetingUrl(),
            data: post_data
        }).then(res => {
            this.setState({
                loading: false,
            })
            window.location = routeMeeting(res['data']['meeting_code'])
        }).catch(e => {})
    }

    render () {
        const { setDialogBoxOpenClose, INSTANT, open } = this.props
        return (
            <Modal
                size={'mini'}
                open={open}
                onClose={() => setDialogBoxOpenClose(INSTANT, false)}
            >
                <Modal.Header>
                    Create Instant Meeting
                </Modal.Header>
                <Modal.Content>
                    <Input
                        placeholder='Optional meeting title'
                        transparent
                        fluid
                        onChange={(e, d) => this.setState({instant_meeting_title: d.value})}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={this.state.loading}
                        onClick={() => setDialogBoxOpenClose(INSTANT, false)}
                        color="black"
                        basic
                    >
                        Cancel
                    </Button>
                    <Button
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        onClick={() => this.handleInstantMeetingCreate()}
                        primary
                    >
                        Create
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default CreateInstantMeeting
