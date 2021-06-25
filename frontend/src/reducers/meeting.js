import {
    SET_PARTICIPANTS_LIST,
    UPDATE_MEETING_TITLE_DESCRIPTION,
    ADD_STREAM,
    CHANGE_MEETING_LOADED
} from "../constants/actionTypes"

const defaultState = {
    loaded: false,
    meeting: {},
    participants: {},
    streams: {},
    error: false,
}

const meetingInformation = (state = defaultState, action) => {
    switch (action.type) {
        case CHANGE_MEETING_LOADED:
            return {
                ...state,
                loaded: action.payload
            }
        case UPDATE_MEETING_TITLE_DESCRIPTION:
            return {
                ...state,
                meeting: {
                    ...state.meeting,
                    ...action.payload
                }
            }
        case SET_PARTICIPANTS_LIST:
            return {
                ...state,
                participants: action.payload
            }
        case ADD_STREAM:
            return {
                ...state,
                streams: {
                    ...state.streams,
                    [action.payload.userID]: action.payload.stream
                }
            }
        default:
            return state
    }
}

export default meetingInformation
