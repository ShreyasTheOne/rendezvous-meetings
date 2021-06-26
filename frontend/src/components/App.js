import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
    Route,
    Switch,
    BrowserRouter as Router,
    Redirect
} from 'react-router-dom'

import { verifyUser, loginUser } from "../actions/user"
import { centerFullPage } from "../styles"
import Login from "./login"
import Home from "./home"
import Meeting from "./meeting/parent"
import {Loader} from "semantic-ui-react";
import _404 from "./404";

class App extends Component {

    componentDidMount() {
        const { loaded } = this.props.UserInformation
        if (!loaded) {
            const pathArray = window.location.pathname.split('/')
            if (pathArray[1] === 'redirect') {
                const params = new URLSearchParams(window.location.search)
                this.props.LoginUser(
                    params.get('state'),
                    params.get('code')
                )
            } else {
                this.props.VerifyUser()
            }
        }
    }

    render () {
        const { match, UserInformation } = this.props
        const { loginState, loaded } = UserInformation

        if (loaded === false) {
            return (
                <div style={centerFullPage}>
                    <Loader active/>
                </div>
            )
        }

        if (loginState === false) {
            return (
                <Login/>
            )
        }

        if (loginState === true) {
            return (
                <Router>
                    <Switch>
                        <Route
                            exact
                            path={`${match.path}`}
                            component={Home}
                        />
                        <Route
                            exact
                            path={`${match.path}meeting/:code/`}
                            component={Meeting}
                        />
                        <Route
                            path={`${match.path}redirect/`}
                            render={() => {
                                return (<Redirect to='/' />)
                            }}
                        />
                        <Route
                            path={`${match.path}404/`}
                            component={_404}
                        />
                        <Route
                            component={_404}
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
