import React, {Component} from 'react'
import {
    Icon,
    Button,
    Popup,
    Image
} from "semantic-ui-react"
import {
    authLogoutUrl,
    routeConversations,
    routeHome,
    routeMeetings
} from "../../urls"
import './css/index.css'
import {connect} from 'react-redux'
import axios from "axios"

const menu_items = [
    {
        'icon': 'home',
        'route': `${routeHome()}`,
        'value': 'home',
        'popup': 'Home'
    },
    {
        'icon': 'talk',
        'route': `${routeConversations()}`,
        'value': 'conversations',
        'popup': 'Conversations'
    },
    {
        'icon': 'clock outline',
        'route': `${routeMeetings()}`,
        'value': 'myMeetings',
        'popup': 'My Meetings'
    },
]

class NavBar extends Component {

    handleMenuItemChange = route => {
        window.location = route
    }

    logout = () => {
        axios({
            url: authLogoutUrl(),
            method: 'post',
        }).then(res => {
            window.location = routeHome()
        }).catch(e => {
            window.location = routeHome()
        })
    }

    render() {
        // Props from parent component
        const {menu_item, showBackButton, backButtonLink} = this.props

        // Props from redux
        const {UserInformation} = this.props
        const {user} = UserInformation

        return (
            <div id='nav-container'>
                {
                    showBackButton &&
                    <Icon
                        link
                        onClick={() => {
                            window.location = backButtonLink
                        }}
                        id={'back-button'}
                        name={'arrow left'}
                        size={'big'}
                        inverted
                    />
                }
                <div id='menu-items'>
                    {
                        menu_items.map(item => {
                            return (
                                <Popup
                                    content={item['popup']}
                                    inverted
                                    basic
                                    position={'right center'}
                                    trigger={
                                        <Button
                                            size={'large'}
                                            icon={item['icon']}
                                            style={{marginTop: '1rem'}}
                                            inverted={item['value'] !== menu_item}
                                            color={item['value'] === menu_item ? 'blue' : 'white'}
                                            onClick={() => this.handleMenuItemChange(item['route'])}
                                        />
                                    }
                                />
                            )
                        })
                    }
                </div>
                <div
                    id='nav-footer'
                >
                    <Popup
                        hideOnScroll
                        position='right center'
                        on="click"
                        basic
                        inverted
                        style={{
                            padding: "0px",
                        }}
                        trigger={
                            <Image
                                avatar
                                size={'mini'}
                                style={{cursor: 'pointer'}}
                                src={user['profile_picture']}
                            />
                        }
                    >
                        <Button
                            color='red'
                            size='large'
                            fluid
                            onClick={this.logout}
                        >
                            <Icon name='log out'/>
                            Logout
                        </Button>
                    </Popup>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation
    }
}

export default connect(mapStateToProps, null)(NavBar)
