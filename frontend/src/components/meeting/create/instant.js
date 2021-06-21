import React, { Component } from 'react'
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core"
import axios from "axios";
import {apiCreateInstantMeetingUrl, routeMeeting} from "../../../urls";

class CreateInstantMeeting extends Component {

    handleInstantMeetingCreate = () => {
        let post_data = {}
        if (this.state.instant_meeting_title)
            post_data['title'] = this.state.instant_meeting_title

        axios({
            method: 'POST',
            url: apiCreateInstantMeetingUrl(),
            data: post_data
        }).then(res => {
            window.location = routeMeeting(res['data']['meeting_code'])
        }).catch(e => {

        })
    }

    render () {
        const { setDialogBoxOpenClose, INSTANT, open } = this.props
        return (
            <Dialog
                fullWidth
                maxWidth={'xs'}
                open={open}
                onClose={() => setDialogBoxOpenClose(INSTANT, false)}
            >
                <DialogTitle>
                    Create Instant Meeting
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin={'none'}
                        placeholder="Optional meeting title."
                        fullWidth
                        onChange={event => this.setState({instant_meeting_title: event.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogBoxOpenClose(INSTANT, false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => this.handleInstantMeetingCreate()}
                        color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default CreateInstantMeeting