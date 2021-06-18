import React, {Component} from 'react'
import {Button} from "@material-ui/core"
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
                    variant={'contained'}
                    color={'primary'}
                    onClick={this.login}
                >
                    Login with Google
                </Button>
            </div>
        )
    }
}

export default Login
