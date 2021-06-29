import {PEER_CONNECTION_ANSWER, PEER_CONNECTION_OFFER} from "../../../constants/websocketMessageTypes";

export function callUsers (users) {
    const { me } = this.state
    const offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
    }
    users.forEach(user => {
        if (user.uuid === me.uuid) return
        // console.log("calling user")

        this.peer_connections[user.uuid] = this.createPeerObject(user.uuid, me.uuid)

        this.peer_connections[user.uuid]
            .createOffer(offerOptions)
            .then(offer => {
                // console.log("Setting the offer as the local description")
                return this.peer_connections[user.uuid].setLocalDescription(offer)
            }).then(() => {
                // console.log("About to send offer")
                this.emitThroughSocket({
                    type: PEER_CONNECTION_OFFER,
                    message: {
                        targetID: user.uuid,
                        senderID: me.uuid,
                        sdp: this.peer_connections[user.uuid].localDescription
                    }
                })
        // console.log(`Offer sent to ${user.uuid}`)
        }).catch(e => {})
        // console.log("Created pc with user", user.uuid)

    })
}

export function handleIceCandidateMessage (message) {
    // Already checked at backend for security, but also
    // check at frontend for security

    if (message.targetID !== this.state.me.uuid) return

    // console.log(`Received ice-candidate message from ${message.senderID}`)

    const candidate = new RTCIceCandidate(message.candidate)
    this.peer_connections[message.senderID]
        .addIceCandidate(candidate)
        .then(() => {
            // console.log(`Received ice-candidate mentioned by ${message.senderID}`)
        })
}

export function handleOffer (message) {
    // Already checked at backend, but still check at frontend
    const { me } = this.state
    const {targetID, senderID, sdp} = message
    if (targetID !== me.uuid) return

    // console.log(`Offer received from ${senderID}`)

    const desc = new RTCSessionDescription(sdp)

    if (!this.peer_connections[senderID]) {
        this.peer_connections[senderID] = this.createPeerObject(senderID, targetID)
    }
    this.peer_connections[senderID]
        .setRemoteDescription(desc)
        // .then(() => {
        //     const stream = this.state.streams[me.uuid]
        //     if (stream) {
        //         if (!this.videoSenders[senderID] && stream.getVideoTracks().length>0) {
        //             this.videoSenders[senderID] = this.peer_connections[senderID].addTrack(stream.getVideoTracks()[0], stream)
        //         }
        //         if (!this.audioSenders[senderID] && stream.getAudioTracks().length>0) {
        //             this.audioSenders[senderID] = this.peer_connections[senderID].addTrack(stream.getAudioTracks()[0], stream)
        //         }
        //     }
        // })
        .then(() => {
            return this.peer_connections[senderID].createAnswer()
        })
        .then(answer => {
            return this.peer_connections[senderID].setLocalDescription(answer)
        }).then(() => {
            this.emitThroughSocket({
                type: PEER_CONNECTION_ANSWER,
                message: {
                    senderID: targetID,
                    targetID: senderID,
                    sdp: this.peer_connections[senderID].localDescription
                }
            })
        // console.log(`Answer sent to ${senderID}`)
        })
}

export function handleAnswer (message) {
    const { me } = this.state
    const { targetID, senderID, sdp } = message

    // Already checked at backend, but still check at frontend
    if (targetID !== me.uuid) return

    // console.log(`Answer received from ${senderID}`)

    const desc = new RTCSessionDescription(sdp)
    this.peer_connections[senderID]
        .setRemoteDescription(desc)
        .then(() => {
            // console.log(`Answer remoteDesc set for ${senderID}`)
        }).catch(e => {})
}
