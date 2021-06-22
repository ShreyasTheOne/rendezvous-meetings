import React, { Component } from 'react'
import NavBar from "../nav"
import {
    Header,
    Button
} from 'semantic-ui-react'

import CreateCustomMeeting from "../meeting/create/custom"
import CreateInstantMeeting from "../meeting/create/instant"

import './css/index.css'

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
                                <Header as={'h1'} style={{fontSize: '3rem'}}>
                                    Dashboard
                                </Header>
                            </div>
                            <div id='home-heading-right'>
                                <Button.Group
                                    style={{marginBottom: '12px'}}
                                >
                                    <Button
                                        color={'red'}
                                        content={'Instant Meeting'}
                                        icon={'add'}
                                        labelPosition={'left'}
                                        onClick={() => this.setDialogBoxOpenClose(INSTANT, true)}
                                    />
                                    <Button
                                        color={'black'}
                                        content={'Custom Meeting'}
                                        icon={'add'}
                                        labelPosition={'left'}
                                        onClick={() => this.setDialogBoxOpenClose(CUSTOM, true)}
                                    />
                                </Button.Group>
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
