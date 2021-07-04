import {
    UPDATE_MEETING_TITLE_DESCRIPTION_HOST,
    CHANGE_MEETING_LOADED,
    CHANGE_MEETING_ADMITTED,
    ADD_PARTICIPANT, SET_PARTICIPANTS_LIST, CHANGE_USER_VOLUME
} from "../constants/actionTypes"

const defaultState = {
    loaded: false,
    meeting: {},
    participants: {},
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
        case CHANGE_USER_VOLUME:
            return {
                ...state,
                participants: {
                    ...state.participants,
                    [action.payload.participant_uuid]: {
                        ...state.participants[action.payload.participant_uuid],
                        'volume': action.payload.volume
                    }
                }
            }
        case UPDATE_MEETING_TITLE_DESCRIPTION_HOST:
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
        case ADD_PARTICIPANT:
            return {
                ...state,
                participants: {
                    ...state.participants,
                    [action.payload.uuid]: action.payload.participant
                }
            }
        default:
            return state
    }
}

export default meetingInformation
