import {ICE_CANDIDATE, PEER_CONNECTION_OFFER} from "../../../constants/websocketMessageTypes"

const pcConfig = {
    'iceServers': [
        {
            'urls': 'stun:stun.l.google.com:19302',
        },
    ]
}

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}

/**
 * Creates an RTCPeerConnection object between a self anf the target user
 * and sets the relevant event handlers
 *
 * @param sender_userID         UUID of self user
 * @param target_userID         UUID of target user
 * @returns {RTCPeerConnection} RTCPeerConnection object that has been created
 */
export function createPeerConnection (sender_userID, target_userID) {
    let pc = new RTCPeerConnection(pcConfig)

    pc.onicecandidate = this.createIceCandidateHandler(sender_userID, target_userID).bind(this)
    pc.onnegotiationneeded = this.createNegotiationNeededHandler(pc, sender_userID, target_userID).bind(this)
    pc.ontrack = this.createOnTrackHandler(target_userID).bind(this)

    return pc
}

/**
 * Returns a function to handle the ICE Candidates that a peer connection object will receive
 * when it is created
 *
 * @param sender_userID         UUID of self user
 * @param target_userID         UUID of target user
 * @returns {function(...[*]=)} Function that signals ICE Candidate to target user
 */
export function createIceCandidateHandler (sender_userID, target_userID) {
    return event => {
        if (event.candidate) {
            this.emitThroughSocket({
                type: ICE_CANDIDATE,
                message: {
                    target_userID: target_userID,
                    sender_userID: sender_userID,
                    candidate: event.candidate
                }
            })
        }
    }
}

/**
 * Returns a function to create an offer when negotiation is needed (In our case when a track is added)
 *
 * @param pc                        RTCPeerConnection object to create offer from
 * @param sender_userID             UUID of self user
 * @param target_userID             UUID of target user
 * @returns {function(...[*]=)}     Function to create and send offer (SDP object)
 */
export function createNegotiationNeededHandler (pc, sender_userID, target_userID) {
    return event => {
        pc.createOffer(offerOptions)
            .then(offer => {
                return pc.setLocalDescription(offer)
            })
            .then(() => {
                this.emitThroughSocket({
                    type: PEER_CONNECTION_OFFER,
                    message: {
                        sender_userID: sender_userID,
                        target_userID: target_userID,
                        sdp: pc.localDescription
                    }
                })
            })
            .catch(e => {
                console.log("Error sending offer", e)
            })
    }
}

/**
 * Returns a function to handle a new remote track
 *
 * @param target_userID             UUID of target user
 * @returns {function(...[*]=)}     Function that adds the new track to the stream corresponding to the target user
 */
export function createOnTrackHandler (target_userID) {
    return event => {
        let stream = this.state.streams[target_userID]
        if (!stream) stream = new MediaStream()
        stream.addTrack(event.track)

        this.setState({
            streams: {
                ...this.state.streams,
                [target_userID]: stream
            }
        })
    }
}
