import Raact, { Component } from 'react'
import { Button, Tabs, Tab, Avatar, Typography } from "@material-ui/core"
import { ArrowBack } from "@material-ui/icons"

import './css/index.css'
import {routeBase} from "../../urls";

const menu_items = {
    'home': {
        'route': `${routeBase()}`,
        'value': 0
    },
    // 'organisations': {
    //     'route': `${routeBase()}organisations/`,
    //     'value': 1
    // },
    // 'collaborations': {
    //     'route': `${routeBase()}collaborations/`,
    //     'value': 2
    // },
}

class NavBar extends Component {

    handleMenuItemChange = (event, value) => {
        for (var key in menu_items) {
            if (menu_items[key]['value'] === value) {
                window.location = menu_items[key]['route']
            }
        }
    }

    render () {
        const { menu_item, showBackButton } = this.props
        return (
            <div
                id='nav-container'
            >
                {
                    showBackButton &&
                    <Button
                        id='back-button'
                        startIcon={<ArrowBack/>}
                    >
                        Back
                    </Button>
                }
                <div
                    id={'app-header'}
                >
                    <Typography>
                        Rendezvous
                    </Typography>
                </div>
                <div
                    id='menu-container'
                >
                    <Tabs
                        value={menu_items[menu_item]['value']}
                        onChange={this.handleMenuItemChange}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab label="Home" />
                        {/*<Tab label="Organisations" />*/}
                        {/*<Tab label="Collaborations" />*/}
                    </Tabs>
                </div>

                <div
                    id={'user-avatar'}
                >
                    <Avatar
                        src={'https://images.unsplash.com/photo-1488654715439-fbf461f0eb8d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                    />
                </div>
            </div>
        )
    }
}

export default NavBar
