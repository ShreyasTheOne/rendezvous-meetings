import React, { Component } from 'react'
import axios from "axios"
import NavBar from "../nav"
import {
    Typography,
    Button,
    ButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@material-ui/core"
import {
    Add
} from "@material-ui/icons"
import './css/index.css'
import {apiCreateInstantMeetingUrl, routeMeeting} from "../../urls";

const INSTANT = 'instant'
const SCHEDULE = 'schedule'

class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            dialogBoxOpen: {
                [INSTANT]: false,
                [SCHEDULE]: false,
            }
        }
    }

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

    setDialogBoxOpenClose = (which_box, new_state) => {
        this.setState({
            dialogBoxOpen: {
                ...this.state.dialogBoxOpen,
                [which_box]: new_state
            }
        })
    }

    render () {
        return (
            <div id='home-parent'>
                <NavBar menu_item={'home'}/>
                <div id='home-container'>
                    <div id='home-content'>
                        <div id='home-heading'>
                            <div id='home-heading-left'>
                                <Typography variant={'h3'}>
                                    Dashboard
                                </Typography>
                            </div>
                            <div id='home-heading-right'>
                                <ButtonGroup>
                                    <Button
                                        style={{textTransform: 'none'}}
                                        startIcon={<Add/>}
                                        variant={'contained'}
                                        onClick={() => this.setDialogBoxOpenClose(INSTANT, true)}
                                    >
                                        Instant Meeting
                                    </Button>
                                    <Button
                                        style={{textTransform: 'none'}}
                                        startIcon={<Add/>}
                                        variant={'contained'}
                                        onClick={() => this.setDialogBoxOpenClose(SCHEDULE, true)}
                                    >
                                        Schedule Meeting
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>
                </div>
                <Dialog
                    open={this.state.dialogBoxOpen[INSTANT]}
                    onClose={() => this.setDialogBoxOpenClose(INSTANT, false)}
                >
                    <DialogTitle>
                        Create Instant Meeting
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Optional meeting title."
                            fullWidth
                            onChange={(e, d) => this.setState({instant_meeting_title: d.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => this.setDialogBoxOpenClose(INSTANT, false)}
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
            </div>
        )
    }
}

export default Home
