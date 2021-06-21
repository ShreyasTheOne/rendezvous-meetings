import axios from "axios"
import React, { Component } from 'react'
import {Autocomplete} from "@material-ui/lab"
import {apiCreateCustomMeetingUrl, apiUserSearchUrl} from "../../../urls"
import {
    Button,
    LoadingButton,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControlLabel
} from "@material-ui/core"
import { get_new_results } from "../../../utils"

const startTimeStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
}

const moment = require('moment');

class CreateCustomMeeting extends Component {

    constructor(props) {
        super(props)
        this.state = {
            'inputs': {
                'title': '',
                'description': '',
                'invitees': [],
                'scheduled_start_time': '',
                'start_now': false,
            },
            'errors': {
                'title': false,
                'description': false,
                'invitees': false,
                'scheduled_start_time': false,
                'start_now': false,
            },
            'invitee_options': [],
            'loading': false,
        }
    }

    handleCustomMeetingInputChange = event => {
        if (event.target.name === 'start_now') {
            this.setState({
                'inputs': {
                    ...this.state.inputs,
                    [event.target.name]: event.target.checked,
                },
                'errors': {
                    ...this.state.inputs,
                    [event.target.name]: false,
                }
            })
        } else {
            this.setState({
                'inputs': {
                    ...this.state.inputs,
                    [event.target.name]: event.target.value,
                },
                'errors': {
                    ...this.state.inputs,
                    [event.target.name]: false,
                }
            })
        }
    }

    handleInviteeInputChange = (event, value, reason) => {
        this.setState({
            'inputs': {
                ...this.state.inputs,
                'invitees': value,
            }
        })
    }

    handleInviteeSearch = event => {
        const search = event.target.value
        if (!search) {
            this.setState({
                'invitee_options': []
            })
            return
        }

        axios({
            url: apiUserSearchUrl(event.target.value)
        }).then(res => {
            this.setState({
                'invitee_options': get_new_results(res.data, this.state.inputs.invitees)
            })
        }).catch(e => {
            this.setState({
                'invitee_options': []
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

        }).catch(e => {

        })
    }

    render () {
        const { setDialogBoxOpenClose, open, CUSTOM } = this.props
        return (
            <Dialog
                fullWidth
                maxWidth={'sm'}
                open={open}
                onClose={() => setDialogBoxOpenClose(CUSTOM, false)}
            >
                <DialogTitle>
                    Custom Meeting
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        name={'title'}
                        label={'Title'}
                        margin={'dense'}
                        placeholder="Optional meeting title."
                        fullWidth
                        onChange={this.handleCustomMeetingInputChange.bind(this)}
                    />
                    <TextField
                        name={'description'}
                        label={'Description'}
                        margin={'dense'}
                        placeholder="Optional meeting description."
                        fullWidth
                        multiline
                        onChange={this.handleCustomMeetingInputChange.bind(this)}
                    />
                    <Autocomplete
                        multiple
                        filterSelectedOptions
                        options={this.state.invitee_options}
                        getOptionLabel={user => `${user.full_name} - ${user.email}`}
                        onChange={this.handleInviteeInputChange.bind(this)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Invite Users"
                                helperText="To invite teams from your organisation, go to your organisation's page."
                                placeholder="Search by name or email"
                                onChange={this.handleInviteeSearch.bind(this)}
                            />
                        )}
                    />
                    <div
                        style={startTimeStyle}
                    >
                        <TextField
                            name={'scheduled_start_time'}
                            label="Scheduled start time"
                            type="datetime-local"
                            error={this.state.errors.scheduled_start_time}
                            disabled={this.state.inputs.start_now}
                            styles={{marginTop: '2rem'}}
                            fullWidth={false}
                            onChange={this.handleCustomMeetingInputChange.bind(this)}
                            inputProps={{ min: moment().format('YYYY-MM-DDTHH:MM') }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='start_now'
                                    error={this.state.errors.start_now}
                                    checked={this.state.inputs.start_now}
                                    onChange={this.handleCustomMeetingInputChange.bind(this)}
                                />
                            }
                            label="Start now"
                            labelPlacement="end"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={this.state.loading}
                        onClick={() => setDialogBoxOpenClose(CUSTOM, false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    {
                        this.state.loading ?
                            <LoadingButton/>
                            :
                            <Button
                                onClick={() => this.handleCustomMeetingCreate()}
                                color="primary"
                            >
                                Create
                            </Button>
                    }
                </DialogActions>
            </Dialog>
        )
    }
}

export default CreateCustomMeeting