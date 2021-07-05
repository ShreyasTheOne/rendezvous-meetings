import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'
import ParticipantControls from "./participantControls"
import MeetingChat from "./chat"

const containerStyle = {
    width: '100%',
    height: '100%',
    gridColumn: '2/2',
    display: 'flex',
    flexDirection: 'column',

    borderLeft: '1px solid #37352f'
}

const menuBarStyle = {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    alignSelf: 'center',
    height: '60px'
}

class MeetingSidePanel extends Component {

    constructor(props) {
        super(props)

        this.state = {
            activeTab: 'participants'
        }
    }

    handleMenuItemClick = (e, {name}) => {
        this.setState({
            activeTab: name
        })
    }

    render () {
        const { activeTab } = this.state

        return (
            <div style={containerStyle}>
                <div style={menuBarStyle}>
                    <Menu
                        inverted
                        secondary
                    >
                        <Menu.Item
                            name={'participants'}
                            active={activeTab==='participants'}
                            onClick={this.handleMenuItemClick.bind(this)}
                        >
                            Participants
                        </Menu.Item>
                        <Menu.Item
                            name={'meeting_chat'}
                            active={activeTab==='meeting_chat'}
                            onClick={this.handleMenuItemClick.bind(this)}
                        >
                            Chat
                        </Menu.Item>
                    </Menu>
                </div>
                <div>
                    {activeTab === 'participants' &&
                        <ParticipantControls code={this.props.code}/>
                    }
                    {activeTab === 'meeting_chat' &&
                        <MeetingChat code={this.props.code}/>
                    }
                </div>
            </div>
        )
    }
}

export default MeetingSidePanel
