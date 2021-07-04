export function toggleVideo () {
    const video_currently_on = this.state.inputs['video']
    const {me} = this.state

    if (video_currently_on) {
        let stream = this.state.streams[me.uuid]
        if (stream) {
            Object.keys(this.peer_connections).forEach( uuid => {
                if (uuid === me.uuid) return
                if (this.videoSenders[uuid])
                    this.peer_connections[uuid].removeTrack(this.videoSenders[uuid])
                delete this.videoSenders[uuid]
            })

            stream.getVideoTracks().forEach(track => {
                track.stop()
                // track.enabled = false
                // track.dispatchEvent(new Event("ended"))
                stream.removeTrack(track)
            })
        }

        this.setState({
            streams: {
                ...this.state.streams,
                [me.uuid]: stream
            },
            inputs: {
                ...this.state.inputs,
                'video': false
            }
        })
    } else {
        navigator.mediaDevices
            .getUserMedia({video: true})
            .then( new_stream => {
                let videoTracks = new_stream.getVideoTracks()

                let stream = this.state.streams[me.uuid]
                if (!stream) stream = new MediaStream()
                stream.addTrack(videoTracks[0])

                videoTracks = stream.getVideoTracks()

                Object.keys(this.peer_connections).forEach(uuid => {
                    if (this.peer_connections[uuid] && !this.videoSenders[uuid]) {
                        this.videoSenders[uuid] = this.peer_connections[uuid].addTrack(videoTracks[0], stream)
                    }
                })
                this.setState({
                    streams: {
                        ...this.state.streams,
                        [me.uuid]: stream
                    },
                    inputs: {
                        ...this.state.inputs,
                        'video': true
                    }
                })
            })
            .catch(e => {})
    }
}

export function toggleAudio () {
    const audio_currently_on = this.state.inputs['audio']
    const {me} = this.state

    if (audio_currently_on) {
        let stream = this.state.streams[me.uuid]
        if (stream) {
            Object.keys(this.peer_connections).forEach( uuid => {
                if (uuid === me.uuid) return
                if (this.audioSenders[uuid])
                    this.peer_connections[uuid].removeTrack(this.audioSenders[uuid])
                delete this.audioSenders[uuid]
            })

            stream.getAudioTracks().forEach(track => {
                track.stop()
                stream.removeTrack(track)
            })
        }

        this.setState({
            streams: {
                ...this.state.streams,
                [me.uuid]: stream
            },
            inputs: {
                ...this.state.inputs,
                'audio': false
            }
        })
    } else {
        navigator.mediaDevices
            .getUserMedia({audio: true})
            .then( new_stream => {
                let audioTracks = new_stream.getAudioTracks()

                let stream = this.state.streams[me.uuid]
                if (!stream) stream = new MediaStream()
                stream.addTrack(audioTracks[0])

                audioTracks = stream.getAudioTracks()

                Object.keys(this.peer_connections).forEach(uuid => {
                    if (this.peer_connections[uuid] && !this.audioSenders[uuid]) {
                        this.audioSenders[uuid] = this.peer_connections[uuid].addTrack(audioTracks[0], stream)
                    }
                })
                this.setState({
                    streams: {
                        ...this.state.streams,
                        [me.uuid]: stream
                    },
                    inputs: {
                        ...this.state.inputs,
                        'audio': true
                    }
                })
            })
            .catch(e => {})
    }
}
export function toggleScreenShare () {}