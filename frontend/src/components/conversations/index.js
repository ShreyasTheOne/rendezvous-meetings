import React, {Component} from 'react'
import {connect} from 'react-redux'
import axios from 'axios'
import NavBar from "../nav"
import {
    Header,
    Loader,
    Image, Dropdown,
} from 'semantic-ui-react'

import './index.css'

import AppBar from "../appBar"
import MeetingsList from "../home/meetingsList";
import MeetingDetail from "../myMeetings/meetingDetail";
import ConversationsList from "./conversationsList";

class Conversations extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    setConversation = id => {

    }

    render() {
        const {UserInformation} = this.props
        const me = UserInformation.user
        return (
            <>
                <AppBar/>
                <div id='conversations-parent'>
                    <NavBar menu_item={'conversations'}/>
                    <div id='conversations-container'>
                        <>
                            <div id='conversations-list'>
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
                                </div>
                                <ConversationsList/>
                            </div>
                            <div id='conversations-chat'>
                                {/*<MeetingDetail*/}
                                {/*    meeting={selectedMeetingInstance}*/}
                                {/*    meetingTimeType={selectedMeetingType}*/}
                                {/*/>*/}
                            </div>
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
