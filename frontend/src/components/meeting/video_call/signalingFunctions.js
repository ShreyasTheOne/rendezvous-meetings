import {PEER_CONNECTION_ANSWER} from "../../../constants/websocketMessageTypes"

/**
 * Creates peer connections and sends offer to all other participants in the meeting
 * @param users     List of meeting participants
 */
export function callUsers (users) {
    const { me } = this.state
    users.forEach(user => {
        if (me.uuid === user.uuid) return

        if (!this.peer_connections[user.uuid])
            this.peer_connections[user.uuid] = this.createPeerConnection(me.uuid, user.uuid)

        this.peer_connections[user.uuid].onnegotiationneeded()
    })
}

/**
 * Handles the offer received when a new user joins the meeting
 * - If a peer connection does not exist for the user, it creates a new RTCPeerConnection object
 * - Sets the offer as the remote description to the peer connection pbject
 * - If any stream of self exists, it adds it to the peer connection object
 * - Creates answer and sets it as the local description
 * - Sends the answer to the caller user so that the caller can set the answer as the remote description
 * @param message   JSON Object containing: UUID of target user, UUID of self, and Offer SDP
 */
export function handleOffer (message) {
    const { me } = this.state
    const { target_userID, sender_userID } = message
    if (target_userID !== me.uuid) return

    const { sdp } = message
    const desc = new RTCSessionDescription(sdp)

    if (!this.peer_connections[sender_userID])
        this.peer_connections[sender_userID] = this.createPeerConnection(me.uuid, sender_userID)

    this.peer_connections[sender_userID]
        .setRemoteDescription(desc)
        .then(() => {
            if (!this.videoSenders[sender_userID] && this.state.streams[me.uuid]) {
                const stream = this.state.streams[me.uuid]
                const videoTracks = stream.getVideoTracks()
                if (videoTracks.length>0)
                    this.videoSenders[sender_userID] = this.peer_connections[sender_userID].addTrack(videoTracks[0], stream)
            }
        })
        .then(() => {
            return this.peer_connections[sender_userID].createAnswer()
        })
        .then(answer => {
            return this.peer_connections[sender_userID].setLocalDescription(answer)
        })
        .then(() => {
            this.emitThroughSocket({
                type: PEER_CONNECTION_ANSWER,
                message: {
                    sender_userID: me.uuid,
                    target_userID: sender_userID,
                    sdp: this.peer_connections[sender_userID].localDescription
                }
            })
        })
        .catch(e => {console.log("Error sending answer", e)})
}

/**
 * Sets the answer as the remoteDescription of the peer connection object
 * @param message   JSON Object containing: UUID of target user, UUID of self, and Answer SDP
 */
export function handleAnswer (message) {
    const { me } = this.state
    const { target_userID, sender_userID } = message
    if (target_userID !== me.uuid) return

    const { sdp } = message
    const desc = new RTCSessionDescription(sdp)

    this.peer_connections[sender_userID]
        .setRemoteDescription(desc)
        .then(() => {})
        .catch(() => {})
}

/**
 * Adds the ice candidate sent by the peer
 * @param message   JSON Object containing: UUID of target user, UUID of self, and ICE Candidate
 */
export function handleIceCandidateMessage (message) {
    const { me } = this.state
    const { target_userID, sender_userID } = message
    if (target_userID !== me.uuid) return

    if (!this.IceCandidates[sender_userID]) {
        this.IceCandidates[sender_userID] = [message.candidate]
    } else {
        this.IceCandidates[sender_userID].push(message.candidate)
    }

    if (this.peer_connections[sender_userID] && this.peer_connections[sender_userID].currentRemoteDescription) {
        this.IceCandidates[sender_userID].forEach(c => {
            const candidate = new RTCIceCandidate(c)
            this.peer_connections[sender_userID]
                .addIceCandidate(candidate)
                .then(() => {})
        })
        this.IceCandidates[sender_userID] = []
    }
}
