import React, {Component} from "react"
import {connect} from "react-redux"

import Scrollbars from "react-custom-scrollbars"
import {Header, Image, Label} from "semantic-ui-react"

import {
    websocketMessageTypes
} from "../../constants/websocketMessageTypes"

import {
    CONVERSATION_ID_INVALID
} from "../../constants/websocketCloseCodes"

import ConversationSettings from "./conversationSettings"
import MessagesList from "./messagesList"

import {centerFullParent} from "../../styles"
import {apiWSConversation, route404} from "../../urls"

const containerStyle = {
    ...centerFullParent,
    height: '100%',
    width: '100%',

    display: 'grid',
    gridTemplateColumns: '4fr 2fr',
    backgroundImage: "url(/doda_blue.jpg)"
}

const contentStyle = {
    padding: '2rem 5rem',
    gridColumn: '1/1',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
}

const avatarStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}

const labelAvatarStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '65px',
    height: '65px',
    marginRight: '1rem',
    fontSize: '2rem',
    backgroundColor: '#88B2D3'
}

const settingsContainerStyle = {
    gridColumn: '2/2',
    width: '100%',
    height: '100%',
    borderLeft: '1px solid #37352f'
}

class ConversationDetail extends Component {

    constructor(props) {
        super(props)
        const {
            selectedConversationID
        } = this.props
        this.conversationWebsocket = new WebSocket(apiWSConversation(selectedConversationID))
        this.conversationWebsocket.onclose = event => {
            if (event.code === CONVERSATION_ID_INVALID.code) {
                window.location = route404()
            }
        }

        this.state = {
            sendingMessages: null,
            messages: [],
            showSettings: true,
            live_meeting_code: ''
        }
    }

    componentDidMount() {
        this.conversationWebsocket.onmessage = this.handleConversationWebSocketMessage
    }

    createWebsocketConnection() {
        const { selectedConversationID } = this.props

        let ws = new WebSocket(apiWSConversation(selectedConversationID))
        ws.onmessage = this.handleConversationWebSocketMessage
        ws.onclose = event => {
            if (event.code === CONVERSATION_ID_INVALID.code) {
                window.location = route404()
            }
        }

        return ws
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.selectedConversationID !== prevProps.selectedConversationID) {
            this.conversationWebsocket.close()
            this.conversationWebsocket = this.createWebsocketConnection()
        }
    }

    handleConversationWebSocketMessage = event => {
        let message = JSON.parse(decodeURIComponent(event.data))
        const type = message.type
        message = message.message

        switch (type) {
            case websocketMessageTypes.CONVERSATION_INFO:
                this.handleConversationInfo(message)
                break
            case websocketMessageTypes.CONVERSATION_MEETING_LIVE:
                this.handleLiveMeetingStart(message)
                break
            case websocketMessageTypes.NEW_MESSAGE:
                this.handleNewMessage(message)
                break
            default:
                break
        }
    }

    emitThroughSocket = message => {
        this.conversationWebsocket.send(encodeURIComponent(JSON.stringify(message)))
    }

    informLiveMeetingStart = () => {
        this.emitThroughSocket({
            type: websocketMessageTypes.CONVERSATION_MEETING_LIVE,
            message: ''
        })
    }

    handleLiveMeetingStart = meeting => {
        this.setState({
            live_meeting_code: meeting['code']
        })
    }

    handleConversationInfo = message => {
        this.setState({
            messages: message['messages'],
            conversation: message['conversation']
        })
    }

    handleNewMessage = message => {
        this.setState({
            messages: [...this.state.messages, message]
        })

        const me = this.props.UserInformation.user

        if (message.sender.uuid === me.uuid) {
            this.props.sendGlobalMessage(message, this.props.selectedConversationID)
        }
    }

    sendMessage = message => {
        this.setState({
            sendingMessage: true
        })

        this.emitThroughSocket({
            type: websocketMessageTypes.SEND_MESSAGE,
            message
        })

        this.setState({
            sendingMessage: false
        })
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
        const {
            selectedConversation,
            selectedConversationID,
            UserInformation
        } = this.props

        const {showSettings, live_meeting_code} = this.state
        const me = UserInformation.user
        const {participants} = selectedConversation

        let receiver
        if (participants.length === 2)
            receiver = participants[0].uuid === me.uuid ?
                participants[1] : participants[0]

        return (
            <div style={containerStyle}>
                <div style={contentStyle}>
                    {participants.length === 2 ?
                        (<span style={avatarStyle}>
                            <Image
                                circular
                                size={'tiny'}
                                style={{width: '65px', marginRight: '1rem'}}
                                src={receiver['profile_picture']}
                            />
                            <Header
                                inverted
                                color={'grey'}
                                as={'h1'}
                                textAlign={'left'}
                                style={{
                                    fontSize: '1.6rem',
                                    margin: '0px',
                                    textAlign: 'bottom'
                                }}
                            >
                                {receiver['full_name']}
                            </Header>
                        </span>)
                        :
                        (<span style={avatarStyle}>
                            <Image>
                                <Label
                                    circular
                                    style={labelAvatarStyle}
                                >
                                    {selectedConversation.participants.length}
                                </Label>
                            </Image>
                            <Header
                                inverted
                                color={'grey'}
                                as={'h1'}
                                textAlign={'left'}
                                style={{
                                    fontSize: '1.6rem',
                                    margin: '0px',
                                    textAlign: 'bottom'
                                }}
                            >
                                {selectedConversation.title}
                            </Header>
                        </span>)}
                    <Scrollbars
                        autoHide
                        renderThumbVertical={this.scrollBarThumb}
                        style={{width: '100%'}}
                    >
                        <MessagesList
                            selectedConversation={selectedConversation}
                            selectedConversationID={selectedConversationID}
                            sendMessage={this.sendMessage.bind(this)}
                            sendingMessage={this.state.sendingMessage}
                            messages={this.state.messages}
                        />
                    </Scrollbars>
                </div>
                {showSettings &&
                <div style={settingsContainerStyle}>
                    <ConversationSettings
                        selectedConversation={selectedConversation}
                        selectedConversationID={selectedConversationID}
                        live_meeting_code={live_meeting_code}
                        informLiveMeetingStart={this.informLiveMeetingStart.bind(this)}
                    />
                </div>}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation
    }
}

export default connect(mapStateToProps, null)(ConversationDetail)
