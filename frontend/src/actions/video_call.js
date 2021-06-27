import {
    ADD_PEER_CONNECTION
} from '../constants/actionTypes'

/**
 * Adds another peer connection to the state, or overrides the existing
 * entry with matching uuid
 * @param {number} id UUID of the user with whom PeerConnection is formed
 * @param {Object.<RTCPeerConnection>} pc   RTCPeerConnection object
 */
export const setOrCreatePeerConnection = (id, pc) => {
    return dispatch => {
        dispatch({
            type: ADD_PEER_CONNECTION,
            payload: {
                uuid: id,
                pc
            }
        })
    }
}
