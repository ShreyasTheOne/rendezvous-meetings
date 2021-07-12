import React, { Component } from 'react'
import { Menu, Label } from 'semantic-ui-react'

import ParticipantControls from "./participantControls"
import MeetingChat from "./chat"
import {apiWSChat} from "../../../urls";
import {websocketMessageTypes} from "../../../constants/websocketMessageTypes";

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
        const { onlyChat, code} = this.props
        this.chatWebSocket = new WebSocket(apiWSChat(code))
        this.state = {
            chatLoaded: false,
            messages: [],
            sendingMessage: false,
            inputMessage: '',
            activeTab: onlyChat ? 'meeting_chat' : 'participants',
            newChatMessageNotification: false
        }
    }

    componentDidMount() {
        this.initialiseChat()
    }

    initialiseChat() {
        this.chatWebSocket.onmessage = this.handleChatWebSocketMessage.bind(this)
        this.scrollToBottomOfChat()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.code !== prevProps.code) {
            this.chatWebSocket.close()
            const {code} = this.props
            this.chatWebSocket = new WebSocket(apiWSChat(code))
            this.initialiseChat()
        } else {
            this.scrollToBottomOfChat()
        }
    }

    handleMenuItemClick = (e, {name}) => {
        this.setState({
            activeTab: name,
            newChatMessageNotification: false
        })
    }

    notifyNewChatMessage = () => {
        this.setState({
            newChatMessageNotification: true
        })
    }

    scrollToBottomOfChat() {
        let invisibleDiv = document.getElementById('invisible-div')
        if (invisibleDiv)
            invisibleDiv.scrollIntoView({behavior: 'smooth'})
    }

    handleChatWebSocketMessage = event => {
        let message = JSON.parse(decodeURIComponent(event.data))
        const type = message.type
        message = message.message

        switch (type) {
            case websocketMessageTypes.MESSAGES_LIST:
                this.handleMessagesList(message)
                break
            case websocketMessageTypes.NEW_MESSAGE:
                this.handleNewMessage(message)
                break
            default:
                break
        }
    }

    emitThroughChatSocket = message => {
        this.chatWebSocket.send(JSON.stringify(message))
    }

    handleMessagesList = messages => {
        const showNotification = (this.state.activeTab === 'participants' && messages.length > 0)
        this.setState({
            messages,
            newChatMessageNotification: showNotification
        })
    }

    handleNewMessage = message => {
        this.setState({
            messages: [...this.state.messages, message],
            newChatMessageNotification: this.state.activeTab === 'participants'
        })

        this.notifyNewChatMessage()
    }

    updateMessage = inputMessage => {
        this.setState({
            inputMessage,
            newChatMessageNotification: false,
        })
    }

    sendMessage = () => {
        const {inputMessage} = this.state
        if (!inputMessage) return

        document.getElementById('message-input-box').value = ''

        this.setState({
            sendingMessage: true,
            inputMessage: '',
            newChatMessageNotification: false,
        })

        this.emitThroughChatSocket({
            type: websocketMessageTypes.SEND_MESSAGE,
            message: inputMessage
        })

        this.setState({
            sendingMessage: false
        })
    }

    render () {
        const { activeTab, newChatMessageNotification } = this.state
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
                            {newChatMessageNotification &&
                            <Label
                                color='teal'
                                floating
                                size={'mini'}
                                circular
                            />}
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
                    {activeTab === 'meeting_chat' &&
                        <MeetingChat
                            onlyChat={onlyChat}

                            sendingMessage={this.state.sendingMessage}
                            messages={this.state.messages}

                            updateMessage={this.updateMessage.bind(this)}
                            sendMessage={this.sendMessage.bind(this)}
                        />
                    }
                </div>
            </div>
        )
    }
}

export default MeetingSidePanel
