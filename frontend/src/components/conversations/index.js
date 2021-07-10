import React, {Component} from 'react'
import {connect} from 'react-redux'
import NavBar from "../nav"
import {
    Header,
    Input,
    Button
} from 'semantic-ui-react'
import {
    CONVERSATIONS_LIST,
    NEW_MESSAGE,
    SEND_MESSAGE
} from "../../constants/websocketMessageTypes"

import {apiWSGlobalConversations} from "../../urls"

import AppBar from "../appBar"
import ConversationsList from "./conversationList"
import CreateConversation from "./createConversation"
import ConversationDetail from "./conversationDetail"

import './index.css'

class Conversations extends Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedConversation: null,
            selectedConversationID: null,
            fullConversationsList: null,
            displayedConversationsList: null,
            openCreateConversationModal: false,
            searchQuery: ''
        }

        this.globalConversationsWebsocket = new WebSocket(apiWSGlobalConversations())
    }

    componentDidMount() {
        this.globalConversationsWebsocket.onmessage = event => {
            let message = JSON.parse(decodeURIComponent(event.data))
            const type = message.type
            message = message.message

            console.log("type", type)
            switch (type) {
                case CONVERSATIONS_LIST:
                    this.setConversationsList(message)
                    break
                case NEW_MESSAGE:
                    this.handleNewMessage(message)
                    break
                default:
                    break
            }
        }
    }

    emitThroughSocket = message => {
        this.globalConversationsWebsocket.send(encodeURIComponent(JSON.stringify(message)))
    }

    sendGlobalMessage = (message, conversationID) => {
        this.emitThroughSocket({
            type: SEND_MESSAGE,
            message: {
                message,
                conversationID
            }
        })
    }

    /**
     * When a new message comes from the websocket for a conversation,
     * bring that conversation to the top of the list
     * @param message   Object containing message and the conversation that the message belongs to
     */
    handleNewMessage = message => {
        const {fullConversationsList} = this.state

        let modifiedIndex = -1

        // Find the index of the conversation to which the message belongs
        for (let i=0; i < fullConversationsList.length; i++) {
            let item = fullConversationsList[i]
            if (message['conversationID'] === item.id) {
                modifiedIndex = i
                break
            }
        }

        // If the conversation is found
        if (modifiedIndex !== -1) {
            // Save the conversation instance before deleting it
            let newMessageConversation = fullConversationsList[modifiedIndex]

            // Remove the conversation from the list
            fullConversationsList.splice(modifiedIndex, 1)

            newMessageConversation['last_message'] = message['message']
            newMessageConversation['datetime_modified'] = message['message']['send_time']

            // Add the conversation to the front of the list
            fullConversationsList.unshift(newMessageConversation)

            // Set the updated list to the state
            this.setState({
                fullConversationsList
            })
        }
    }

    /**
     * Initially when we receive the list of conversations, add that to the state
     * @param conversations_list    List of conversations, of which I am a part
     */
    setConversationsList = conversations_list => {
        this.setState({
            fullConversationsList: conversations_list,
            displayedConversationsList: conversations_list
        })
    }

    /**
     * When a user clicks on a conversation from the list, it
     * should be shown in detail on the side
     * @param id    ID of the conversation that the user selected
     */
    setConversation = id => {
        const {fullConversationsList} = this.state
        fullConversationsList.forEach( conversation => {
            if (conversation.id === id) {
                this.setState({
                    selectedConversation: conversation,
                    selectedConversationID: id,
                })
            }
        })
    }

    openCloseCreateConversationModal = state => {
        this.setState({
            openCreateConversationModal: state
        })
    }

    /**
     * Use the user's search query to filter the displayed chats in the list
     * based on conversation title, and participant name and emails
     * @param query     The string that the user enters into the search bar
     */
    searchMyConversations = query => {
        this.setState({
            searchQuery: query
        })

        // Remove leading and trailing whitespace characters
        query = query.trim().toLowerCase()

        // If empty string, then reset list
        if (!query) {
            this.setState({
                displayedConversationsList: this.state.fullConversationsList
            })
            return
        }

        // Initialise empty list
        let displayedConversationsList = []

        const { fullConversationsList } = this.state
        fullConversationsList.forEach(c => {
            // If conversation title exists and matches search query, include right away
            if (c.title && c.title.toLowerCase().includes(query)) {
                displayedConversationsList.push(c)
                return
            }

            // If search query matches any of the participants, include the conversation only once
            // (Not for every user that matches)
            let found = false
            c.participants.forEach(p => {
                if (found) return

                if (
                    p.full_name.toLowerCase().includes(query)
                    ||
                    p.email.toLowerCase().includes(query)
                ) {
                    if (!found) {
                        displayedConversationsList.push(c)
                        found = true
                    }
                }
            })
        })

        // Display filtered conversations
        this.setState({
            displayedConversationsList
        })
    }

    render() {

        const {
            searchQuery,
            displayedConversationsList,
            openCreateConversationModal,
            selectedConversation,
            selectedConversationID,
        } = this.state

        return (
            <>
                <AppBar/>
                <div id='conversations-parent'>
                    <NavBar menu_item={'conversations'}/>
                    <div id='conversations-container'>
                        <>
                            <div id='conversations-list-container'>
                                <div id='conversations-header'>
                                    <Header
                                        inverted
                                        color={'grey'}
                                        textAlign={'left'}
                                        style={{
                                            fontSize: '2rem'
                                        }}
                                    >
                                        Conversations
                                    </Header>
                                    <div id='conversations-list'>
                                        <div>
                                            <Input
                                                 fluid
                                                 icon='search'
                                                 inverted
                                                 value={searchQuery}
                                                 placeholder='Search your conversations'
                                                 onChange={(e, d) => {
                                                     this.searchMyConversations(d.value)
                                                 }}
                                             />
                                        </div>
                                         <div id='conversations-add-icon-container'>
                                             <Button
                                                 icon='add'
                                                 inverted
                                                 color={'blue'}
                                                 onClick={() => this.openCloseCreateConversationModal(true)}
                                             />
                                         </div>
                                    </div>
                                </div>
                                <ConversationsList
                                    setConversation={this.setConversation.bind(this)}
                                    conversations={displayedConversationsList}
                                    selectedConversation={selectedConversation}
                                    selectedConversationID={selectedConversationID}
                                />
                            </div>
                            <div id='conversations-detail'>
                                {selectedConversationID &&
                                <ConversationDetail
                                    sendGlobalMessage={this.sendGlobalMessage.bind(this)}
                                    selectedConversation={selectedConversation}
                                    selectedConversationID={selectedConversationID}
                                />}
                            </div>
                            <CreateConversation
                                open={openCreateConversationModal}
                                openCloseCreateConversationModal={this.openCloseCreateConversationModal.bind(this)}
                            />
                        </>
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation
    }
}

export default connect(mapStateToProps, null)(Conversations)
