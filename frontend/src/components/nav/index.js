import React, { Component } from 'react'
import {
    Avatar,
    List,
    ListItem,
    Fab
} from "@material-ui/core"
import {
    Home,
    ArrowBack,
    Business
} from "@material-ui/icons"
import {
    red,
    grey
} from "@material-ui/core/colors"
import {
    routeHome,
    routeOrganisations,
} from "../../urls"
import './css/index.css'
import { connect } from 'react-redux'

const menu_items = [
    {
        'icon': <Home/>,
        'route': `${routeHome()}`,
        'value': 'home'
    },
    {
        'icon': <Business/>,
        'route': `${routeOrganisations()}`,
        'value': 'organisations'
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
                    <ArrowBack
                        id={'back-button'}
                        style={{ color: grey[50] }}
                    />
                }
                <div id='menu-items'>
                    <List>
                        {
                            menu_items.map( item => {
                                return (
                                    <ListItem>
                                        <Fab
                                            variant="extended"
                                            // style={{color: item['value'] === menu_item ? red[500] : ''}}
                                            color={item['value'] === menu_item ? 'secondary' : ''}
                                            onClick={() => this.handleMenuItemChange(item['route'])}
                                        >
                                            {item['icon']}
                                        </Fab>
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </div>
                <div
                    id='nav-footer'
                >
                    <Avatar
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
