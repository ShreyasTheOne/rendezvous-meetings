import {
    UPDATE_MEETING_TITLE_DESCRIPTION,
    SET_PARTICIPANTS_LIST,
    ADD_STREAM, CHANGE_MEETING_LOADED
} from '../constants/actionTypes'


/**
 * Store the meeting title and description received when websocket connection is formed
 */
export const setMeetingInformation = info => {
    return dispatch => {
        dispatch({
            type: UPDATE_MEETING_TITLE_DESCRIPTION,
            payload: info
        })
    }
}


/*
    Action to create peer connections with all other participants
*/
export const setParticipantsList = participants => {
    return dispatch => {
        console.log("participants", participants)
        dispatch({
            type: SET_PARTICIPANTS_LIST,
            payload: participants
        })
    }
}

export const addStream = (stream, userID) => {
    return dispatch => {
        dispatch({
            type: ADD_STREAM,
            payload: {
                stream,
                userID
            }
        })
    }
}

export const changeMeetingLoaded = newState => {
    return dispatch => {
        console.log("updating meeting loaded to", newState)
        dispatch({
            type: CHANGE_MEETING_LOADED,
            payload: newState
        })
    }
}
