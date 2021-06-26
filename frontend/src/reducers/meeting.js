import {
    UPDATE_MEETING_TITLE_DESCRIPTION_HOST,
    CHANGE_MEETING_LOADED,
    CHANGE_MEETING_ADMITTED,
} from "../constants/actionTypes"

const defaultState = {
    loaded: false,
    meeting: {},
    participants: {},
    streams: {},
    peer_connections: {},
    error: false,
    admitted: false,
}

const meetingInformation = (state = defaultState, action) => {
    switch (action.type) {
        case CHANGE_MEETING_LOADED:
            return {
                ...state,
                loaded: action.payload
            }
        case CHANGE_MEETING_ADMITTED:
            return {
                ...state,
                admitted: action.payload
            }
        case UPDATE_MEETING_TITLE_DESCRIPTION_HOST:
            return {
                ...state,
                meeting: {
                    ...state.meeting,
                    ...action.payload
                }
            }
        default:
            return state
    }
}

export default meetingInformation
