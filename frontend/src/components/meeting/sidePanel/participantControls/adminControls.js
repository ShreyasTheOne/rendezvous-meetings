import React, {Component} from 'react'
import {Button, Icon, Popup} from "semantic-ui-react"

const actionButtons = [
    {
        'key': 'remove',
        'action': 'remove',
        'iconName': 'remove',
        'iconColor': '',
        'popupContent': 'Remove User',
    },
    {
        'key': 'ban',
        'action': 'ban',
        'iconName': 'ban',
        'iconColor': 'red',
        'popupContent': 'Ban User'
    },
]

class AdminControls extends Component {

    constructor (props) {
        super(props)
        this.state = {
            loading: ''
        }
    }

    handleActionClick = (action, userID) => {
        if (this.needAdminRights(action))
            this.setState({
                loading: action
            })
        const { participantControlFunctions } = this.props
        participantControlFunctions[action](userID)
    }

    needAdminRights (action) {
        return action === 'ban' || action === 'remove'
    }

    render () {
        const { user, iAmHost } = this.props
        const { loading } = this.state
        return (
            <Button.Group icon>
                {actionButtons.map(item => {
                    if (this.needAdminRights(item['key']) && !iAmHost) return(<></>)
                    return (
                        <Popup key={item['key']}
                            trigger={
                                <Button
                                    loading={loading === item['action']}
                                    disabled={loading === item['action']}
                                    color='black'
                                    onClick={() => this.handleActionClick(item['action'], user.uuid)}
                                >
                                    <Icon
                                        color={item['iconColor']}
                                        name={item['iconName']}
                                    />
                                </Button>
                            }
                            size={'mini'}
                            content={item['popupContent']}
                            inverted
                            style={{ border: '1px solid white' }}
                            position='top center'
                        />
                    )
                })}
            </Button.Group>
        )
    }
}

export default AdminControls
