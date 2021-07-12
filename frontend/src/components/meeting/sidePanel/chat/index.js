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

    scrollBarThumb = (style, ...props) => {
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
    }

    senseEnterKeyPress = () => {
        const input_field = document.getElementById('message-input-box')

        if (input_field) {
            input_field.addEventListener("keyup", (e) => {
                if (e.key === "Enter") {
                    this.props.sendMessage()
                }
            })
        }
    }

    componentDidMount() {
        this.senseEnterKeyPress()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.senseEnterKeyPress()
    }

    render() {
        const {
            onlyChat,
            sendingMessage,
            messages,
            sendMessage,
            updateMessage
        } = this.props

        const scrollbarHeight = onlyChat ? 'calc(100vh - 108px - 5rem)' : 'calc(100vh - 60px - 5rem)'

        return (
            <div style={containerStyle}>
                <Scrollbars
                    autoHide
                    renderThumbVertical={this.scrollBarThumb}
                    style={{width: '100%', height: scrollbarHeight}}
                >
                    <Segment style={{backgroundColor: 'transparent'}}>
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

                        {/* INVISIBLE DIV TO SCROLL TO BOTTOM TO */}
                        <div
                            id={'invisible-div'}
                            style={{
                                float: "left",
                                clear: "both",
                                backgroundColor: 'transparent'
                            }}
                        />

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
                                onClick={() => {sendMessage()}}
                            />
                        }
                        onChange={(e, d) => {
                            updateMessage(d.value)
                        }}
                        placeholder='Type your message...'
                    />
                </div>
            </div>
        )
    }
}

export default MeetingChat
