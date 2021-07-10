import React, {Component} from "react";
import Scrollbars from "react-custom-scrollbars"
import {
    Button,
    Card,
    Header,
    Image,
    Input,
    List,
    Segment
} from "semantic-ui-react"

const moment = require('moment')

const containerStyle = {
    width: '100%',
    height: '100%',

    display: 'flex',
    flexDirection: 'column',
    paddingTop: '1rem'
}
const messageStyle = {
    borderRadius: '10px',
    backgroundColor: '#37352f',
    width: '100%'
}
const inputBoxStyle = {
    padding: '1rem',
    backgroundColor: 'transparent',
    borderTop: '1px solid #37352f'

}


class MessagesList extends Component {

    constructor(props) {
        super(props)

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
        this.scrollToBottom()

        const input_field = document.getElementById('message-input-box')
        input_field.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                this.sendMessage()
            }
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.initialiseChat()
    }

    scrollToBottom() {
        let invisibleDiv = document.getElementById('invisible-div')
        if (invisibleDiv)
            invisibleDiv.scrollIntoView({behavior: 'smooth'})
    }

    updateMessage = inputMessage => {
        this.setState({inputMessage})
    }

    sendMessage = () => {
        const {inputMessage} = this.state
        if (!inputMessage) return

        document.getElementById('message-input-box').value = ''

        this.setState({
            inputMessage: ''
        })
        this.props.sendMessage(inputMessage)
    }

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

    render() {

        const {messages, sendingMessage} = this.props

        return(
            <div style={containerStyle}>
                <Scrollbars
                    autoHide
                    renderThumbVertical={this.scrollBarThumb}
                    style={{width: '100%'}}
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
                                                    <Card.Description
                                                        className={'message-content'}
                                                        style={{
                                                            wordWrap: 'word-break'
                                                        }}
                                                    >
                                                        {message['content']}
                                                    </Card.Description>
                                                </Card.Content>
                                            </Card>
                                        </List.Content>
                                    </List.Item>
                                )
                            })}

                            {messages.length === 0 &&
                                <Header
                                    style={{fontWeight: 'lighter'}}
                                    inverted
                                    as={'h3'}
                                    textAlign={'center'}
                                    color={'grey'}
                                    content={`This is the beginning of your conversation`}
                                />
                            }
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
                                onClick={() => {this.sendMessage()}}
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

export default MessagesList
