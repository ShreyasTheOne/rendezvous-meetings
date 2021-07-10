import React, {Component} from "react"
import {connect} from "react-redux"
import Scrollbars from 'react-custom-scrollbars'
import {centerFullParent} from "../../styles"
import {
    Image,
    Header,
    Loader,
    List,
    Label
} from "semantic-ui-react"
import {fitText} from "../../utils"

const moment = require('moment')

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

class ConversationsList extends Component {

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
            conversations,
            UserInformation,
            setConversation
        } = this.props
        const me = UserInformation.user

        if (conversations === null) {
            return (
                <div style={centerFullParent}>
                    <Loader active inline={'centered'}/>
                </div>
            )
        }

        if (conversations.length === 0) {
            return (
                <Header
                    style={{fontWeight: 'lighter'}}
                    inverted
                    color={'grey'}
                    content={`No active conversations :)`}
                />
            )
        }

        return (
            <Scrollbars
                style={{width: '100%'}}
                autohide
                renderThumbVertical={this.scrollBarThumb}
            >
                <List
                    divided
                    inverted
                    selection
                    size='large'
                    relaxed='very'
                    style={{width: '100%'}}
                >
                    {conversations.map(conversation => {
                        const {datetime_modified, participants} = conversation
                        const last_view = moment(datetime_modified).format('LT')

                        if (participants.length === 2) {
                            const receiver = participants[0].uuid === me.uuid ?
                                participants[1] : participants[0]

                            return (
                                <List.Item onClick={() => setConversation(conversation['id'])}>
                                    <Image
                                        circular
                                        size={'tiny'}
                                        style={{width: '65px', marginRight: '1rem'}}
                                        src={receiver['profile_picture']}
                                    />
                                    <List.Content>
                                        <List.Header style={{marginBottom: '0.5rem'}}>
                                            {receiver['full_name']}
                                            <span
                                                style={{
                                                    fontWeight: 'lighter',
                                                    fontSize: '1rem',
                                                    marginLeft: '1rem'
                                                }}
                                            >
                                            {
                                                conversation['last_message']
                                                && conversation['last_message']['content']
                                                && last_view
                                            }
                                        </span>
                                        </List.Header>
                                        <List.Description>
                                            {
                                                conversation['last_message'] && conversation['last_message']['content']
                                                    ?
                                                fitText(conversation['last_message']['content'], 20)
                                                    :
                                                last_view
                                            }
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            )
                        }
                        return (
                            <List.Item onClick={() => setConversation(conversation['id'])}>
                                <Image>
                                    <Label
                                        circular
                                        style={labelAvatarStyle}
                                    >
                                        {conversation.participants.length}
                                    </Label>
                                </Image>
                                <List.Content>
                                    <List.Header style={{marginBottom: '0.5rem'}}>
                                        {conversation['title']}
                                        <span
                                            style={{
                                                fontWeight: 'lighter',
                                                fontSize: '1rem',
                                                marginLeft: '1rem'
                                            }}
                                        >
                                        {
                                            conversation['last_message']
                                            && conversation['last_message']['content']
                                            && last_view
                                        }
                                    </span>
                                    </List.Header>
                                    <List.Description>
                                        {
                                            conversation['last_message'] && conversation['last_message']['content']
                                                ?
                                            fitText(conversation['last_message']['content'])
                                                :
                                            last_view
                                        }
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        )
                    })}
                </List>
            </Scrollbars>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation
    }
}

export default connect(mapStateToProps, null)(ConversationsList)
