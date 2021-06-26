import {
    UPDATE_MEETING_TITLE_DESCRIPTION_HOST,
    SET_PARTICIPANTS_LIST,
    ADD_STREAM,
    CHANGE_MEETING_LOADED,
    CHANGE_MEETING_ADMITTED
} from '../constants/actionTypes'

/**
 * Store the meeting title and description received when user is admitted to the meeting
 * @param  {Object} info JSON Object containing title, description, code, and meeting host
 *
 * Calls dispatch function to store the meeting information
 */
export const setMeetingInformation = info => {
    return dispatch => {
        dispatch({
            type: UPDATE_MEETING_TITLE_DESCRIPTION_HOST,
            payload: info
        })
    }
}

/**
 * Updates 'admitted' state of user in meeting
 * @param  {boolean} newState   new value of admitted
 */
export const changeMeetingAdmitted = newState => {
    return dispatch => {
        dispatch({
            type: CHANGE_MEETING_ADMITTED,
            payload: newState
        })
    }
}

/**
 * Updates 'loaded' state of the meeting
 * @param  {boolean} newState   new value of loaded
 */
export const changeMeetingLoaded = newState => {
    return dispatch => {
        console.log("updating meeting loaded to", newState)
        dispatch({
            type: CHANGE_MEETING_LOADED,
            payload: newState
        })
    }
}
