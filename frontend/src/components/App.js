import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
    Route,
    Switch,
    BrowserRouter as Router,
    Redirect
} from 'react-router-dom'
import { CircularProgress } from "@material-ui/core"

import { verifyUser, loginUser } from "../actions/user"
import { styleFullPage } from "../styles"
import Login from "./login"
import './App.css'
import {routeBase} from "../urls"
import Home from "./home";

class App extends Component {

    componentDidMount() {
        const { loaded } = this.props.UserInformation
        if (!loaded) {
            const pathArray = window.location.pathname.split('/')
            if (pathArray[1] === 'redirect') {
                console.log("Reached redirect")
                const params = new URLSearchParams(window.location.search)
                this.props.LoginUser(
                    params.get('state'),
                    params.get('code')
                )
            } else {
                console.log("verifying user")
                this.props.VerifyUser()
            }
        }
    }

    render () {
        const { match, UserInformation } = this.props
        const { loginState, loaded } = UserInformation

        if (loaded === false) {
            console.log("Not loaded")
            return (
                <div style={styleFullPage}>
                    <CircularProgress/>
                </div>
            )
        }

        if (loginState === false) {
            return (
                <Redirect to={routeBase()} />
            )
        }

        if (loginState === true) {
            return (
                <Router>
                    <Switch>
                        <Route
                            exact
                            path={`${match.path}/`}
                            component={Home}
                        />
                    </Switch>
                </Router>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation
    }
}

const mapDispatchToProps = dispatch => {
    return {
        VerifyUser: () => {
            return dispatch(verifyUser())
        },
        LoginUser: (state, code) => {
            dispatch(loginUser(state, code))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
