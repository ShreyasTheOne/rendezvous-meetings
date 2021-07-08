import React, {Component} from "react"
import {centerFullParent} from "../../styles"
import {Header, Icon, List, Button} from "semantic-ui-react"
import Scrollbars from 'react-custom-scrollbars'
import MeetingSidePanel from "../meeting/sidePanel"

const moment = require('moment')

const containerStyle = {
    ...centerFullParent,
    height: '100%',
    width: '100%',

    display: 'grid',
    gridTemplateColumns: '4fr 2fr',
}

const horizontalDiv = {
    display: 'flex',
    flexDirection: 'row'
}


class MeetingDetail extends Component {
    render() {
        const {meeting} = this.props
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
                                    <Header
                                        inverted
                                        color={'grey'}
                                        as={'h1'}
                                        textAlign={'left'}
                                        style={{
                                            fontSize: '4rem',
                                            textAlign: 'bottom'
                                        }}
                                    >
                                        {meeting['title']}
                                    </Header>
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
                                {moment(meeting['scheduled_start_time']).format('LLL')}
                            </span>
                                </div>
                            </List.Item>
                            <List.Item>
                                <div style={{...horizontalDiv, padding: '1rem 0'}}>
                                    <Button
                                        primary
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
