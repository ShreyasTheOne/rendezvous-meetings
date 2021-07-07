import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import NavBar from "../nav"
import {
    Header,
    Loader,
    Image,
} from 'semantic-ui-react'

import CreateCustomMeeting from "../meeting/create/custom"
import CreateInstantMeeting from "../meeting/create/instant"

import './css/index.css'
import JoinMeeting from "../meeting/join"
import ActionButton from "./actionButton"
import MeetingsList from "./meetingsList"
import {apiGetUpcomingMeetingsUrl} from "../../urls"
import AppBar from "../appBar";

const INSTANT = 'instant'
const CUSTOM = 'custom'
const JOIN = 'join'

const actionButtons = [
    {
        'key': INSTANT,
        'icon': 'add',
        'header': 'Instant',
        'meta': 'Creating meeting with one click',
        'bgColor': '#E8998D',
    },
    {
        'key': CUSTOM,
        'icon': 'time',
        'header': 'Schedule',
        'meta': 'Set time and invite members',
        'bgColor': '#F8E16C',
    },
    {
        'key': JOIN,
        'icon': 'sign-in',
        'header': 'Join',
        'meta': 'Enter with a code',
        'bgColor': '#C3D9E9',
    }
]

class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            dialogBoxOpen: {
                [INSTANT]: false,
                [CUSTOM]: false,
                [JOIN]: false,
            },
            upcomingMeetings: null,
            upcomingMeetingsError: false
        }
    }

    componentDidMount () {
        this.setUpcomingMeetings()
    }

    setUpcomingMeetings = () => {
        axios({
            url: apiGetUpcomingMeetingsUrl(),
            method: 'get',
        }).then(res => {
            this.setState({
                upcomingMeetings: res.data['upcoming_meetings']
            })
        }).catch(() => {
            this.setState({
                upcomingMeetingsError: true
            })
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
        const {upcomingMeetings, upcomingMeetingsError} = this.state
        const { UserInformation } = this.props
        const me = UserInformation.user
        return (
            <>
            <AppBar/>
            <div id='home-parent'>
                <NavBar menu_item={'home'}/>
                <div id='home-container'>
                    <div id='home-dashboard'>
                        <div id='quick-access-container'>
                            <Header
                                inverted
                                color={'grey'}
                                as={'h1'}
                                textAlign={'center'}
                                style={{ fontSize: '2rem' }}
                            >
                                Quick Access
                            </Header>
                            <div id={'actions-grid'}>
                                {actionButtons.map(action => {
                                    return (
                                        <ActionButton
                                            action={action}
                                            setDialogBoxOpenClose={this.setDialogBoxOpenClose.bind(this)}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        <div id='meetings-list'>
                            <Header
                                inverted
                                color={'grey'}
                                as={'h1'}
                                style={{ fontSize: '2rem' }}
                            >
                                Upcoming Meetings
                            </Header>
                            {
                                upcomingMeetingsError ?
                                    <Header inverted content={'Unable to fetch meetings'}/>
                                    :
                                        upcomingMeetings === null ?
                                            <Loader
                                                inline={'centered'}
                                                inverted
                                                active
                                                style={{ marginTop: '1rem' }}
                                            />
                                        :
                                            <MeetingsList meetings={upcomingMeetings}/>
                            }
                        </div>
                        <div id={'user-info'}>
                            <Image
                                src={me.profile_picture}
                                size={'small'}
                                circular
                            />
                            <Header
                                inverted
                                color={'grey'}
                                as={'h1'}
                                textAlign={'center'}
                                style={{
                                    marginBottom: '0',
                                    fontSize: '1.6rem'
                                }}
                            >
                                {me.full_name}
                            </Header>
                            <Header
                                inverted
                                color={'grey'}
                                as={'h1'}
                                textAlign={'center'}
                                style={{
                                    fontWeight: 'lighter',
                                    fontSize: '1rem'
                                }}>
                                {me.email}
                            </Header>
                        </div>
                    </div>
                </div>



                {/* DIALOG BOXES */}

                {/* JOIN MEETING */}
                <JoinMeeting
                    open={this.state.dialogBoxOpen[JOIN]}
                    JOIN={JOIN}
                    setDialogBoxOpenClose={this.setDialogBoxOpenClose.bind(this)}
                />

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
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation
    }
}

export default connect(mapStateToProps, null)(Home)
