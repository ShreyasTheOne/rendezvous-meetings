import React, {Component} from 'react'
import {Button} from "semantic-ui-react"
import {styleFullPage} from "../../styles"
import {googleOAuthRedirect} from '../../urls'


class Login extends Component {

    login () {
        window.location = googleOAuthRedirect()
    }

    render () {
        return (
            <div style={styleFullPage}>
                <Button
                    color={'blue'}
                    onClick={this.login}
                >
                    Login with Google
                </Button>
            </div>
        )
    }
}

export default Login
