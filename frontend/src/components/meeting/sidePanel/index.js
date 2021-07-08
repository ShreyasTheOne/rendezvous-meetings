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
        const { onlyChat } = this.props
        this.state = {
            activeTab: onlyChat ? 'meeting_chat' : 'participants'
        }
    }

    handleMenuItemClick = (e, {name}) => {
        this.setState({
            activeTab: name
        })
    }

    render () {
        const { activeTab } = this.state
        const { onlyChat } = this.props

        return (
            <div style={containerStyle}>
                <div style={menuBarStyle}>
                    <Menu
                        inverted
                        secondary
                    >
                        {!onlyChat &&
                        <Menu.Item
                            name={'participants'}
                            active={activeTab==='participants'}
                            onClick={this.handleMenuItemClick.bind(this)}
                        >
                            Participants
                        </Menu.Item>}
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
                    {!onlyChat && activeTab === 'participants' &&
                        <ParticipantControls
                            code={this.props.code}
                            participantControlFunctions={this.props.participantControlFunctions}
                        />
                    }
                    {
                        console.log("In meeting side panel", this.props.code)
                    }
                    {activeTab === 'meeting_chat' &&
                        <MeetingChat onlyChat={onlyChat} code={this.props.code}/>
                    }
                </div>
            </div>
        )
    }
}

export default MeetingSidePanel
