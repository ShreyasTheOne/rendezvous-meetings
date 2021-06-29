import {ICE_CANDIDATE, PEER_CONNECTION_OFFER} from "../../../constants/websocketMessageTypes";

const iceServers = [
    {
        urls: 'stun:stun1.l.google.com:19302'
    },
]

export function createPeerObject (targetID, senderID) {
    let pc = new RTCPeerConnection({iceServers})

    pc.onicecandidate = this.createIceCandidateEventHandler(targetID, senderID).bind(this)
    pc.onnegotiationneeded = this.createNegotiationNeededEventHandler(pc, targetID, senderID).bind(this)
    pc.ontrack = this.createTrackEventHandler(targetID).bind(this)
    pc.onremovestream = this.createRemoveTrackEventHandler(targetID).bind(this)

    return pc
}

export function createNegotiationNeededEventHandler (pc, targetID, senderID) {
    return event => {
        const offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }
        pc.createOffer(offerOptions).then(offer => {
            return pc.setLocalDescription(offer)
        }).then(() => {
            // console.log("Sending call to update video (nn)")
            this.emitThroughSocket({
                type: PEER_CONNECTION_OFFER,
                message: {
                    targetID,
                    senderID,
                    sdp: pc.localDescription
                }
            })
        }).catch(e => {})
    }
}

export function createTrackEventHandler (targetID) {
    return event => {
        let stream = this.state.streams[targetID]
        if (!stream) stream = new MediaStream()
        console.log( "before adding track", stream.getTracks())
        stream.addTrack(event.track)
        console.log( "after adding track", stream.getTracks())
        console.log("receiving add track", event, event.stream, event.track)

        console.log("setting state stream", stream)
        this.setState({
            streams: {
                ...this.state.streams,
                [targetID]: stream
            }
        })
    }
}

export function createRemoveTrackEventHandler (targetID) {
    return event => {
        console.log("removed track")
        console.log(event)
        // let stream = this.state.streams[targetID]
        // if (stream) {
        //     let videoTracks = stream.getVideoTracks()
        //     videoTracks.forEach(track => {
        //         track.stop()
        //         stream.removeTrack(track)
        //     })
        // }
        console.log("setting state stream", event.stream)
        this.setState({
            streams: {
                ...this.state.streams,
                [targetID]: event.stream
            }
        })
    }
}

export function createIceCandidateEventHandler (targetID, senderID) {
    // console.log("createIceCandidateEventHandler")
    return event => {
        if (event.candidate) {
            this.emitThroughSocket({
                type: ICE_CANDIDATE,
                message: {
                    targetID,
                    senderID,
                    candidate: event.candidate,
                }
            })
            // console.log(`Sending ice-candidate message to ${targetID}`)
        }
    }
}

