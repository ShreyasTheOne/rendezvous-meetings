import React, {Component} from "react"
import {centerFullParent} from "../../styles"
import {
    Header,
    Icon,
    List,
    Button,
    Image,
    Card, Label
} from "semantic-ui-react"
import Scrollbars from 'react-custom-scrollbars'
import MeetingSidePanel from "../meeting/sidePanel"

const moment = require('moment')

const containerStyle = {
    ...centerFullParent,
    height: '100%',
    width: '100%',

    display: 'grid',
    gridTemplateColumns: '4fr 2fr',
    backgroundImage: "url(/doda_blue.jpg)"
}

const horizontalDiv = {
    display: 'flex',
    flexDirection: 'row'
}

const UPCOMING = 'UPCOMING'

class MeetingDetail extends Component {

    startMeeting = link => {
        window.location = link
    }

    render() {
        const {meeting, meetingTimeType} = this.props
        if (!meeting) {
            return (
                <div style={centerFullParent}>
                    <Header as={'h2'} inverted>
                        Select a meeting to see details
                    </Header>
                </div>
            )
        }

        return (
            <div style={containerStyle}>
                <div
                    style={{
                        padding: '3rem 5rem',
                        gridColumn: '1/1',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <Scrollbars
                        autoHide
                        renderThumbVertical={(style, ...props) => {
                            return (
                                <div
                                    {...props}
                                    style={{
                                        ...style,
                                        backgroundColor: 'rgba(244, 242, 243, 0.7)',
                                        borderRadius: '5px'
                                    }}
                                />
                            )
                        }}
                        style={{width: '100%'}}
                    >
                        <List
                            divided
                            inverted
                            size='large'
                            relaxed='very'
                            verticalAlign='middle'
                        >
                            <List.Item>
                                <div style={{
                                    ...horizontalDiv,
                                    marginBottom: '1rem'
                                }}> {/* first horizontal */}
                                    {meeting['title'] ?
                                        <Header
                                            inverted
                                            color={'grey'}
                                            as={'h1'}
                                            textAlign={'left'}
                                            style={{
                                                fontSize: '1.6rem',
                                                marginBottom: '0px',
                                                textAlign: 'bottom'
                                            }}
                                        >
                                            {meeting['title']}
                                        </Header>
                                        :
                                        <Label style={{
                                            backgroundColor: '#232528',
                                            color: '#DCDDDE'
                                        }}>
                                            No Title provided
                                        </Label>
                                    }
                                </div>
                                <div
                                    style={{
                                        ...horizontalDiv,
                                        justifyContent: 'flex-start',
                                        alignItems: 'flex-start'
                                    }}
                                > {/* time horizontal */}
                                    <Icon
                                        inverted
                                        style={{color: '#ffffff'}}
                                        name='clock outline'
                                    />
                                    <span style={{
                                        color: '#DCDDDE',
                                        marginLeft: '0.5rem'
                                    }}>
                                        {
                                            meetingTimeType === UPCOMING ?
                                                moment(meeting['scheduled_start_time']).format('LLL')
                                                :
                                                (moment(meeting['start_time']).format('LLL') + ' - ' +
                                                    moment(meeting['end_time']).format('LLL')
                                                )
                                        }
                                    </span>
                                </div>
                            </List.Item>
                            <List.Item>
                                <div style={{...horizontalDiv, padding: '1rem 0'}}>
                                    <Button
                                        primary
                                        onClick={() => this.startMeeting(meeting['joining_link'])}
                                    >
                                        Start
                                    </Button>
                                </div>
                            </List.Item>
                            <List.Item>
                                <div
                                    style={{
                                        ...centerFullParent,
                                        color: 'white',
                                        padding: '2rem 0',
                                    }}>
                                    {meeting['description'] || 'No description provided'}
                                </div>
                            </List.Item>
                            <List.Item>
                                <div style={{
                                    ...centerFullParent,
                                    padding: '2rem 0'
                                }}>
                                    <Header
                                        as={'h1'}
                                        color={'grey'}
                                        style={{
                                            fontSize: '1.5rem',
                                            marginBottom: '0'
                                        }}
                                    >
                                        Meeting code:
                                    </Header>
                                    <Header
                                        as={'h1'}
                                        color={'grey'}
                                        inverted
                                        size={'huge'}
                                        style={{
                                            marginTop: '0',
                                            fontSize: '2.5rem',
                                        }}
                                    >
                                        {meeting['code']}
                                    </Header>
                                </div>
                            </List.Item>
                            <List.Item>
                                <div style={{
                                    ...centerFullParent,
                                    alignItems: 'flexStart',
                                    padding: '2rem 0'
                                }}>
                                    <Header as={'h3'}>
                                        <Icon name={'users'}/>
                                        Participants
                                    </Header>
                                </div>
                                <div style={{width: 'calc(100% - 4rem)', padding: '5px'}}>
                                    <Card.Group itemsPerRow={2}>
                                        {
                                            meeting['participants'].map(user => {
                                                return (
                                                    <Card
                                                        style={{
                                                            border: '1px solid black',
                                                            backgroundColor: '#232528'
                                                        }}
                                                    >
                                                        <Card.Content>
                                                            <Header
                                                                textAlign={'left'}
                                                                as='h4'
                                                                inverted
                                                                color={'grey'}
                                                            >
                                                                <Image
                                                                    circular
                                                                    src={user['profile_picture']}
                                                                />
                                                                {user['full_name']}
                                                            </Header>
                                                                </Card.Content>
                                                    </Card>
                                                )
                                            })
                                        }
                                    </Card.Group>
                                </div>
                            </List.Item>
                        </List>
                    </Scrollbars>
                </div>
                <MeetingSidePanel onlyChat code={meeting['code']}/>
            </div>
        )
    }
}

export default MeetingDetail
