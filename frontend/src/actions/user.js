import axios from 'axios'
import { authLoginUrl, authLogoutUrl, authVerifyUrl, routeHome } from '../urls'
import {
    CHANGE_USER_LOGIN_LOADED_ERROR,
    INITIALISE_USER,
} from './types'

export const verifyUser = () => {
    return dispatch => {
        axios.get(
            authVerifyUrl()
        ).then(res => {
            const loginState = res.data['login_status']
            if (loginState === true) {
                dispatch({
                    type: INITIALISE_USER,
                    payload: {
                        loginState: true,
                        loaded: true,
                        error: false,
                        data: res.data['user']
                    }
                })
            } else {
                dispatch({
                    type: CHANGE_USER_LOGIN_LOADED_ERROR,
                    payload: {
                        loginState: false,
                        loaded: true,
                        error: false
                    }
                })
            }
        }).catch(e => {
            dispatch({
                type: CHANGE_USER_LOGIN_LOADED_ERROR,
                payload: {
                    loginState: false,
                    loaded: true,
                    error: true,
                }
            })
        })
    }
}

export const loginUser = (oauth_service, code) => {
    return dispatch => {
        axios({
            url: authLoginUrl(),
            method: 'post',
            data: {oauth_service, code},
        }).then(res => {
            dispatch({
                type: INITIALISE_USER,
                payload: {
                    loginState: true,
                    loaded: true,
                    error: false,
                    data: res.data['user']
                }
            })
        }).catch(e => {
            dispatch({
                type: CHANGE_USER_LOGIN_LOADED_ERROR,
                payload: {
                    loginState: false,
                    loaded: true,
                    error: true
                }
            })
        })
    }
}

export const logoutUser = () => {
    return dispatch => {
        axios({
            url: authLogoutUrl(),
            method: 'post',
        }).then(res => {
            dispatch({
                type: CHANGE_USER_LOGIN_LOADED_ERROR,
                payload: {
                    loginState: false,
                    loaded: true,
                    error: false
                }
            })
        }).catch(e => {
            dispatch({
                type: CHANGE_USER_LOGIN_LOADED_ERROR,
                payload: {
                    loginState: false,
                    loaded: true,
                    error: true
                }
            })
        })
    }
}