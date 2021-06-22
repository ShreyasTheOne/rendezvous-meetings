import React, { Component } from 'react'
import {
    Icon,
    Button,
    Popup,
    Image
} from "semantic-ui-react"
import {
    routeHome,
    routeOrganisations,
} from "../../urls"
import './css/index.css'
import { connect } from 'react-redux'

const menu_items = [
    {
        'icon': 'home',
        'route': `${routeHome()}`,
        'value': 'home',
        'popup': 'Home'
    },
    {
        'icon': 'building',
        'route': `${routeOrganisations()}`,
        'value': 'organisations',
        'popup': 'Organisations'
    },
]

class NavBar extends Component {

    handleMenuItemChange = route => {
        window.location = route
    }

    render () {
        // Props from parent component
        const { menu_item, showBackButton } = this.props

        // Props from redux
        const { UserInformation } = this.props
        const { user } = UserInformation

        return (
            <div id='nav-container'>
                {
                    showBackButton &&
                    <Icon
                        id={'back-button'}
                        name={'arrow left'}
                        size={'big'}
                        inverted
                    />
                }
                <div id='menu-items'>
                    {
                        menu_items.map( item => {
                            return (
                                <Popup
                                    content={item['popup']}
                                    inverted
                                    basic
                                    position={'right center'}
                                    trigger={
                                        <Button
                                            style={{marginTop: '1rem'}}
                                            size={'large'}
                                            icon={item['icon']}
                                            inverted={item['value'] !== menu_item}
                                            color={item['value'] === menu_item ? 'red' : 'white'}
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
                    <Image
                        avatar
                        size={'mini'}
                        style={{ cursor: 'pointer' }}
                        src={user['profile_picture']}
                    />
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
