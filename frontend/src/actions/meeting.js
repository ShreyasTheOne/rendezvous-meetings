import {
    UPDATE_MEETING_TITLE_DESCRIPTION_HOST,
    CHANGE_MEETING_LOADED,
    CHANGE_MEETING_ADMITTED,
    ADD_PARTICIPANT,
    SET_PARTICIPANTS_LIST,
    CHANGE_USER_VOLUME
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

/**
 * Stores the object of participants received in the state
 * @param participants  JSON object of meeting participants
 * @returns {function(...[*]=)} REDUX DISPATCH
 */
export const setParticipantsList = participants => {
    return dispatch => {
        dispatch({
            type: SET_PARTICIPANTS_LIST,
            payload: participants
        })
    }
}

/**
 * Adds another participant to the state, or overrides the existing
 * entry with matching uuid
 * @param {Object.<Participant>} participant   participant object
 */
export const addParticipant = participant => {
    return dispatch => {
        dispatch({
            type: ADD_PARTICIPANT,
            payload: {
                uuid: participant.uuid,
                participant
            }
        })
    }
}



/**
 * Updates the value of the user volume in the meeting state
 * @param participant
 * @returns {function(...[*]=)}
 */
export const changeUserVolume = (volume, participant_uuid) => {
    return dispatch => {
        dispatch({
            type: CHANGE_USER_VOLUME,
            payload: {
                volume,
                participant_uuid
            }
        })
    }
}