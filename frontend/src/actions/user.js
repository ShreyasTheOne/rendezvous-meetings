import axios from 'axios'
import { authLoginUrl, authLogoutUrl, authVerifyUrl } from '../urls'
import {
    CHANGE_USER_LOGIN_LOADED_ERROR,
    INITIALISE_USER,
} from '../constants/actionTypes'


/**
 * Send a request to the backend to cHeck if the user is logged in or not
 * Saves result in redux store.
 */
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
                        user: res.data['user']
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


/**
 * Send request to backend to log the user in
 * @param  {String} oauth_service The service that the user used to authenticate ('Google')
 * @param  {String} code          The authentication code sent by the OAuth Service
 *
 * If login successful, stores the user data in the redux store.
 * Else stores error state: true in redux store.
 */
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
                    user: res.data['user']
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

/**
 * Send request to backend to log the user out
 * Saves result in redux store.
 */
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