import React, {Component} from 'react'
import {connect} from 'react-redux'

import {
    Header,
    Dropdown
} from 'semantic-ui-react'

import NavBar from "../nav"
import AppBar from "../appBar"
import MeetingDetail from "./meetingDetail"
import MeetingsList from "./meetingsList"

import {getMyMeetings} from "../../utils"
import {routeMyMeetingsDetail} from "../../urls"

import './index.css'

const PAST = 'PAST'
const UPCOMING = 'UPCOMING'

const meetingTypeOptions = [
    {
        'key': PAST,
        'value': PAST,
        'text': 'Past Meetings',
    },
    {
        'key': UPCOMING,
        'value': UPCOMING,
        'text': 'Upcoming Meetings',
    }
]

class MyMeetings extends Component {

    constructor(props) {
        super(props)

        this.state = {
            meetings: {
                [UPCOMING]: null,
                [PAST]: null
            },
            loaded: 0,
            selectedMeetingInstance: null,
            selectedMeetingID: this.props.match.params.id,
            selectedMeetingType: meetingTypeOptions[1].value
        }
    }

    componentDidMount() {
        this.setMeetings(PAST)
        this.setMeetings(UPCOMING)
    }

    setMeetings(type) {
        getMyMeetings(type)
            .then(res => {
                if (res === 'Error') {
                    this.setState({
                        error: true
                    })
                } else {
                    let {
                        selectedMeetingInstance,
                        selectedMeetingID,
                        selectedMeetingType
                    } = this.state

                    res.forEach(m => {
                        if (m.id === selectedMeetingID) {
                            selectedMeetingID = m.id
                            selectedMeetingInstance = m
                            selectedMeetingType = type
                        }
                    })

                    this.setState({
                        meetings: {
                            ...this.state.meetings,
                            [type]: res
                        },
                        loaded: this.state.loaded + 1,
                        selectedMeetingID,
                        selectedMeetingInstance,
                        selectedMeetingType
                    })
                }
            })
    }

    handleMeetingTypeChange = (e, {value}) => {
        this.setState({
            selectedMeetingType: value
        })
        this.onMeetingItemClick('')
    }

    showMeetingDetails = id => {
        const {meetings, selectedMeetingType} = this.state

        let meeting = meetings[selectedMeetingType].filter(m => m.id === id)
        meeting = meeting.length > 0 ? meeting[0] : null

        this.setState({
            selectedMeetingInstance: meeting,
            selectedMeetingID: id
        })
    }

    onMeetingItemClick = id => {
        // Update URL without reloading

        window.history.replaceState(
            {},
            '',
            routeMyMeetingsDetail(id)
        )
        this.showMeetingDetails(id)
    }

    render() {
        const {UserInformation} = this.props
        const me = UserInformation.user
        const {
            meetings,
            selectedMeetingType,
            selectedMeetingInstance,
            selectedMeetingID,
            loaded
        } = this.state

        return (
            <>
                <AppBar/>
                <div id='my-meetings-parent'>
                    <NavBar menu_item={'myMeetings'}/>
                    <div id='my-meetings-container'>
                        {loaded === 2 && (
                            <>
                                <div id='my-meetings-list'>
                                    <div id='type-selector'>
                                        <Header
                                            inverted
                                            color={'grey'}
                                            textAlign={'left'}
                                            style={{
                                                fontSize: '2rem'
                                            }}
                                        >
                                            <Dropdown
                                                inline
                                                options={meetingTypeOptions}
                                                value={selectedMeetingType}
                                                onChange={this.handleMeetingTypeChange.bind(this)}
                                            />
                                        </Header>
                                    </div>
                                    <MeetingsList
                                        selectedMeetingID={selectedMeetingID}
                                        meetingTimeType={selectedMeetingType}
                                        meetings={meetings[selectedMeetingType]}
                                        onMeetingItemClick={this.onMeetingItemClick.bind(this)}
                                    />
                                </div>
                                <div id='my-meetings-detail'>
                                    <MeetingDetail
                                        meeting={selectedMeetingInstance}
                                        meetingTimeType={selectedMeetingType}
                                    />
                                </div>
                            </>
                        )}
                    </div>
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

export default connect(mapStateToProps, null)(MyMeetings)
