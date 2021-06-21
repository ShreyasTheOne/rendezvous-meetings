import React, { Component } from 'react'
import NavBar from "../nav"
import {
    Button,
    ButtonGroup,
    Typography,
} from "@material-ui/core"
import {
    Add
} from "@material-ui/icons"
import CreateCustomMeeting from "../meeting/create/custom"
import './css/index.css'
import CreateInstantMeeting from "../meeting/create/instant";


const INSTANT = 'instant'
const CUSTOM = 'custom'

class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            dialogBoxOpen: {
                [INSTANT]: false,
                [CUSTOM]: false,
            },
        }
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
                                        color={'primary'}
                                        startIcon={<Add/>}
                                        variant={'contained'}
                                        onClick={() => this.setDialogBoxOpenClose(INSTANT, true)}
                                    >
                                        Instant Meeting
                                    </Button>
                                    <Button
                                        color={'secondary'}
                                        startIcon={<Add/>}
                                        variant={'contained'}
                                        onClick={() => this.setDialogBoxOpenClose(CUSTOM, true)}
                                    >
                                        Custom Meeting
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>
                </div>



                {/* DIALOG BOXES */}

                {/* INSTANT MEETING CREATION */}
                <CreateInstantMeeting
                    open={this.state.dialogBoxOpen[INSTANT]}
                    INSTANT={INSTANT}
                    setDialogBoxOpenClose={this.setDialogBoxOpenClose.bind(this)}
                />

                {/* CUSTOM MEETING CREATION */}
                <CreateCustomMeeting
                    open={this.state.dialogBoxOpen[CUSTOM]}
                    CUSTOM={CUSTOM}
                    setDialogBoxOpenClose={this.setDialogBoxOpenClose.bind(this)}
                />

            </div>
        )
    }
}

export default Home
