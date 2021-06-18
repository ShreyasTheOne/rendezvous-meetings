import {
    CHANGE_USER_LOGIN_LOADED_ERROR,
    INITIALISE_USER
} from "../actions/types"

const defaultState = {
    loginState: false,
    loaded: false,
    data: {},
    error: false,
}

const userInformation = (state = defaultState, action) => {
    switch (action.type) {
        case CHANGE_USER_LOGIN_LOADED_ERROR:
            return {
                ...state,
                ...action.payload
            }
        case INITIALISE_USER:
            return action.payload
        default:
            return state
    }
}

export default userInformation

