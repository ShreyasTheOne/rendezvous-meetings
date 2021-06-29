import {
    SET_PARTICIPANTS_LIST,
    ADD_STREAM,
    CHANGE_VIDEO_CALL_LOADED,
    ADD_PEER_CONNECTION,
} from "../constants/actionTypes"

const defaultState = {
    loaded: false,
}

const videoCallInformation = (state = defaultState, action) => {
    switch (action.type) {
        case CHANGE_VIDEO_CALL_LOADED:
            return {
                ...state,
                loaded: action.payload
            }
        case ADD_PEER_CONNECTION:
            return {
                ...state,
                peer_connections: {
                    ...state.peer_connections,
                    [action.payload.uuid]: action.payload.pc
                }
            }
        default:
            return state
    }
}

export default videoCallInformation
