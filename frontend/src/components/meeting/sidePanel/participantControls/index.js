import React, { Component } from 'react'
import {connect} from "react-redux"
import {
    List,
    Image,
    Segment,
    Icon,
    Popup, Loader,
} from 'semantic-ui-react'
import { Slider } from 'react-semantic-ui-range'
import {changeUserVolume} from "../../../../actions/meeting"
import AdminControls from "./adminControls"
import {iAmTheMeetingHost} from "../../../../utils"
import {centerFullParent} from "../../../../styles"

const horizontalDiv = {
    display: 'flex',
    flexDirection:  'row',
    alignItems: 'center',
    height: '100%',
    padding: '0.5rem'
}

const popupStyle = {
    borderRadius: '10px',
    backgroundColor: '#37352f',
    paddingTop: '3px',
    paddingLeft: '3px',
    paddingRight: '3px',
    paddingBottom: '5px'
}


const volume_scale = 20

class ParticipantControls extends Component {

    constructor(props) {
        super(props)
        this.state = {
            iAmHost: null,
        }
    }

    componentDidMount () {
        const { MeetingInformation } = this.props
        const { code } = MeetingInformation.meeting
        iAmTheMeetingHost(code).then(iAmHost => {
            this.setState({iAmHost})
        })
    }

    changeUserVolume = (value, uuid) => {
        console.log(value)
        const volume = value / volume_scale
        this.props.ChangeUserVolume(volume, uuid)
    }

    render () {
        const { iAmHost } = this.state

        if (iAmHost === null) {
            return (
                <div style={centerFullParent}>
                    <Loader active />
                </div>
            )
        }

        const {
            MeetingInformation,
            UserInformation,
            participantControlFunctions
        } = this.props
        const { participants } = MeetingInformation
        const me = UserInformation.user


        return (
            <Segment inverted style={{backgroundColor: '#1b1a17'}}>
                <List
                    divided
                    inverted
                    size='large'
                    relaxed='very'
                    verticalAlign='middle'
                >

                    {/*SHOW SELF IN PARTICIPANTS FIRST*/}
                    <List.Item>
                        <Image avatar src={me['profile_picture']}/>
                        <List.Content>
                            <List.Header>
                                {me['full_name']}
                            </List.Header>
                        </List.Content>
                    </List.Item>

                    {/*SHOW REST AFTER SELF*/}
                    {Object.keys(participants).map(uuid => {
                        // DON'T SHOW SELF AGAIN
                        if (me.uuid === uuid) return <></>

                        const user = participants[uuid]

                        const sliderSettings = {
                            min: 0,
                            max: volume_scale,
                            step: 1,
                            onChange: value => this.changeUserVolume(value, uuid)
                        }

                        let volumeLevelIcon = 'volume '
                        if (user['volume'] === 0) {
                            volumeLevelIcon += 'off'
                        } else if (user['volume'] < 0.5) {
                            volumeLevelIcon += 'down'
                        } else {
                            volumeLevelIcon += 'up'
                        }

                        return (
                                <List.Item>
                                    <Image avatar src={user['profile_picture']}/>
                                    <List.Content>
                                        <List.Header>
                                            {user['full_name']}
                                        </List.Header>
                                    </List.Content>
                                    <List.Content floated={'right'}>
                                        <div style={horizontalDiv}>
                                            <Popup
                                                wide
                                                basic
                                                on='click'
                                                position='left center'
                                                style={popupStyle}
                                                trigger={
                                                    <Icon
                                                        name='setting'
                                                        style={{
                                                            marginRight: '0.5rem',
                                                            alignSelf: 'center',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                }
                                            >
                                                <Popup.Content style={{backgroundColor: '#37352f'}}>
                                                    <div style={horizontalDiv}>
                                                        <Icon name={volumeLevelIcon} inverted/>
                                                        <Slider
                                                            discrete
                                                            value={user['volume'] * volume_scale}
                                                            style={{
                                                                width: '120px',
                                                                alignSelf: 'center',
                                                                marginTop: '0.5rem'
                                                            }}
                                                            color='blue'
                                                            settings={sliderSettings}
                                                        />
                                                    </div>
                                                    <div style={horizontalDiv}>
                                                        <AdminControls
                                                            user={user}
                                                            iAmHost={iAmHost}
                                                            participantControlFunctions={participantControlFunctions}
                                                        />
                                                    </div>
                                                </Popup.Content>
                                            </Popup>
                                        </div>
                                    </List.Content>
                                </List.Item>
                        )
                    })}
                </List>
            </Segment>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation,
        MeetingInformation: state.meetingInformation,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        ChangeUserVolume: (volume, uuid) => {
            return dispatch(changeUserVolume(volume, uuid))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ParticipantControls)
