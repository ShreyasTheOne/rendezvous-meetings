import {MEDIA_TURNED_OFF} from "../../../constants/websocketMessageTypes"

/**
 * If the media is currently off, it turns is on and adds the tracks to all peer connection objects
 * Else it turns the media off and removes the track from all peer connection objects
 *
 * @param media Type of Media: ['video'|'audio']
 */
export function toggleMedia (media) {
    // Get current state
    const media_currently_on = this.state.inputs[media]
    const {me} = this.state

    if (media_currently_on) {
        let stream = this.state.streams[me.uuid]
        if (stream) {
            // Inform everyone that media is being turned off
            this.emitThroughSocket({
                type: MEDIA_TURNED_OFF[media],
                message: me.uuid
            })

            // Remove track from all peer connections
            Object.keys(this.peer_connections).forEach( uuid => {
                if (uuid === me.uuid) return

                if (this.mediaSenders[media][uuid])
                    this.peer_connections[uuid].removeTrack(this.mediaSenders[media][uuid])

                delete this.mediaSenders[media][uuid]
            })

            // Remove tracks from local stream
            if (media === 'video') {
                stream.getVideoTracks().forEach(track => {
                    track.stop()
                    stream.removeTrack(track)
                })
            } else if (media === 'audio') {
                stream.getAudioTracks().forEach(track => {
                    track.stop()
                    stream.removeTrack(track)
                })
            }
        }

        // Set modified stream
        this.setState({
            streams: {
                ...this.state.streams,
                [me.uuid]: stream
            },
            inputs: {
                ...this.state.inputs,
                [media]: false
            }
        })
    } else {
        navigator.mediaDevices
            .getUserMedia({[media]: true})
            .then( new_stream => {
                let tracks
                if (media === 'video')
                    tracks = new_stream.getVideoTracks()
                else if (media === 'audio')
                    tracks = new_stream.getAudioTracks()

                let stream = this.state.streams[me.uuid]
                if (!stream) stream = new MediaStream()

                stream.addTrack(tracks[0])

                if (media === 'video')
                    tracks = stream.getVideoTracks()
                else if (media === 'audio')
                    tracks = stream.getAudioTracks()

                Object.keys(this.peer_connections).forEach(uuid => {
                    if (this.peer_connections[uuid] && !this.mediaSenders[media][uuid]) {
                        this.mediaSenders[media][uuid] = this.peer_connections[uuid].addTrack(tracks[0], stream)
                    }
                })

                this.setState({
                    streams: {
                        ...this.state.streams,
                        [me.uuid]: stream
                    },
                    inputs: {
                        ...this.state.inputs,
                        [media]: true
                    }
                })
            })
            .catch(e => {})
    }
}

/**
 * Handles the notification that a remote user has turned off his/her video
 * Removes the corresponding track from that user's stream
 *
 * @param userID Meeting participant that just turned off his/her video
 */
export function handleUserVideoOff (userID) {
    let stream = this.state.streams[userID]
    if (stream) {
        stream.getVideoTracks().forEach(track => {
            track.stop()
            stream.removeTrack(track)
        })
    }

    this.setState({
        streams: {
            ...this.state.streams,
            [userID]: stream
        }
    })
}

/**
 * Handles the notification that a remote user has turned off his/her audio
 * Removes the corresponding track from that user's stream
 *
 * @param userID Meeting participant that just turned off his/her audio
 */
export function handleUserAudioOff (userID) {
    let stream = this.state.streams[userID]
    if (stream) {
        stream.getAudioTracks().forEach(track => {
            track.stop()
            stream.removeTrack(track)
        })
    }

    this.setState({
        streams: {
            ...this.state.streams,
            [userID]: stream
        }
    })
}

export function getScreen () {

}

export function startRecording () {
    
}
