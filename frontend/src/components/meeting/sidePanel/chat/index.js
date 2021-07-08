import React, {Component} from 'react'
import Scrollbars from 'react-custom-scrollbars'
import {
    Card,
    Segment,
    List,
    Image,
    Button,
    Input,
} from "semantic-ui-react"

import {apiWSChat} from "../../../../urls"
import {
    MESSAGES_LIST,
    NEW_MESSAGE,
    SEND_MESSAGE
} from "../../../../constants/websocketMessageTypes"
import './index.css'

const moment = require('moment')

const containerStyle = {
    width: '100%',
    height: '100%',

    display: 'flex',
    flexDirection: 'column',
}
const messageStyle = {
    borderRadius: '10px',
    backgroundColor: '#37352f',
}
const inputBoxStyle = {
    padding: '1rem',
    borderTop: '1px solid #37352f'
}

class MeetingChat extends Component {

    constructor(props) {
        super(props)
        const {code} = this.props
        this.chatWebSocket = new WebSocket(apiWSChat(code))

        this.state = {
            componentLoaded: false,
            messages: [],
            sendingMessage: false,
            inputMessage: '',
        }
    }

    componentDidMount() {
        this.initialiseChat()
    }

    initialiseChat() {
        this.chatWebSocket.onmessage = this.handleChatWebSocketMessage.bind(this)

        this.scrollToBottom()

        const input_field = document.getElementById('message-input-box')
        input_field.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                this.sendMessage()
            }
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.code !== prevProps.code) {
            this.chatWebSocket.close()
            const {code} = this.props
            this.chatWebSocket = new WebSocket(apiWSChat(code))
            this.initialiseChat()
        } else {
            this.scrollToBottom()
        }
    }

    scrollToBottom() {
        this.messagesEnd.scrollIntoView({behavior: "smooth"})
    }

    handleChatWebSocketMessage = event => {
        let message = JSON.parse(decodeURIComponent(event.data))
        const type = message.type
        message = message.message

        switch (type) {
            case MESSAGES_LIST:
                this.handleMessagesList(message)
                break
            case NEW_MESSAGE:
                this.handleNewMessage(message)
                break
            default:
                break
        }
    }

    emitThroughSocket = message => {
        this.chatWebSocket.send(JSON.stringify(message))
    }

    handleMessagesList = messages => {
        this.setState({messages})
    }

    handleNewMessage = message => {
        this.setState({
            messages: [...this.state.messages, message]
        })
    }

    updateMessage = inputMessage => {
        this.setState({inputMessage})
    }

    sendMessage = () => {
        const {inputMessage} = this.state
        if (!inputMessage) return

        document.getElementById('message-input-box').value = ''

        this.setState({
            sendingMessage: true,
            inputMessage: ''
        })

        this.emitThroughSocket({
            type: SEND_MESSAGE,
            message: inputMessage
        })

        this.setState({
            sendingMessage: false
        })
    }

    render() {
        const {messages, sendingMessage} = this.state
        const {onlyChat} = this.props
        const scrollbarHeight = onlyChat ? 'calc(100vh - 108px - 5rem)' : 'calc(100vh - 60px - 5rem)'
        return (
            <div style={containerStyle}>
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
                    style={{width: '100%', height: scrollbarHeight}}
                >
                    <Segment style={{backgroundColor: '#1b1a17'}}>
                        <List
                            inverted
                            size={'large'}
                            relaxed={'very'}
                        >
                            {messages.map((message, index) => {
                                return (
                                    <List.Item key={index}>
                                        <Image
                                            style={{marginTop: '0.5rem'}}
                                            avatar
                                            src={message['sender']['profile_picture']}
                                        />
                                        <List.Content>
                                            <Card style={messageStyle}>
                                                <Card.Content>
                                                    <Card.Header className={'message-header'}>
                                                        {message['sender']['full_name']}
                                                    </Card.Header>
                                                    <Card.Meta className={'message-send-time'}>
                                                        {moment(message['send_time']).format('LT')}
                                                    </Card.Meta>
                                                    <Card.Description className={'message-content'}>
                                                        {message['content']}
                                                    </Card.Description>
                                                </Card.Content>
                                            </Card>
                                        </List.Content>
                                    </List.Item>
                                )
                            })}
                        </List>
                        <div style={{float: "left", clear: "both", backgroundColor: '#1b1a17'}}
                             ref={(el) => {
                                 this.messagesEnd = el
                             }}>
                        </div>
                    </Segment>
                </Scrollbars>
                <div style={inputBoxStyle}>
                    <Input
                        fluid
                        transparent
                        size='small'
                        autoComplete='off'
                        id='message-input-box'
                        action={
                            <Button
                                inverted
                                color='black'
                                content='Send'
                                loading={sendingMessage}
                                disabled={sendingMessage}
                                onClick={() => {
                                    this.sendMessage()
                                }}
                            />
                        }
                        onChange={(e, d) => {
                            this.updateMessage(d.value)
                        }}
                        placeholder='Type your message...'
                    />
                </div>
            </div>
        )
    }
}

export default MeetingChat
