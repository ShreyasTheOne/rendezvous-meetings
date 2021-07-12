import AppBar from "../appBar"
import React, {Component} from 'react'
import {googleOAuthRedirect} from '../../urls'
import {centerFullParent} from "../../styles"
import {Button, Icon} from "semantic-ui-react"

const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1b1a17'
}

class Login extends Component {

    login () {
        window.location = googleOAuthRedirect()
    }

    render () {
        return (
            <div style={containerStyle}>
                <AppBar showMyName/>
                <div style={{
                    ...centerFullParent,
                    height: 'calc(100vh - 48px)'
                }}>
                    <Button
                        size={'huge'}
                        onClick={this.login}
                        inverted
                        icon
                        labelPosition={'left'}
                    >
                        <Icon name={'google'}/>
                        Login with Google
                    </Button>
                </div>
            </div>
        )
    }
}

export default Login
