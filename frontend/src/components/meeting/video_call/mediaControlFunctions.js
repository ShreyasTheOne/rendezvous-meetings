export function toggleVideo () {
    const currentState = this.state.videoInput
    const { me } = this.state
    if (currentState) {
        // Currently on. Requesting to turn video off.
        let current_stream = this.state.streams[me.uuid]
        if (current_stream) {
            Object.keys(this.peer_connections).forEach( uuid => {
                if (uuid === me.uuid) return
                console.log(this.videoSenders[uuid])
                this.peer_connections[uuid].removeTrack(this.videoSenders[uuid])
                this.videoSenders[uuid] = null
                console.log("removed track from " + uuid)
            })
            let videoTracks = current_stream.getVideoTracks()
            videoTracks.forEach(track => {
                track.stop()
                current_stream.removeTrack(track)
            })
        }
        console.log("setting state stream", current_stream)
        this.setState({
            streams: {
                ...this.state.streams,
                [me.uuid]: current_stream
            },
            videoInput: false,
        })
    } else {
        // Currently off. Requesting to turn video on.
        console.log("Turning video on")
        navigator.mediaDevices.getUserMedia({video: true})
            .then(stream => {
                const videoTracks = stream.getVideoTracks()

                console.log(this.streams)
                let current_stream = this.state.streams[me.uuid]
                if (!current_stream) current_stream = new MediaStream()
                console.log("Adding a track")
                current_stream.addTrack(videoTracks[0])

                console.log("setting state stream", current_stream)
                this.setState({
                    streams: {
                        ...this.state.streams,
                        [me.uuid]: current_stream
                    },
                    videoInput: true,
                })

                console.log(current_stream)

                Object.keys(this.peer_connections).forEach( uuid => {
                    if (uuid === me.uuid) return
                    // this.peer_connections[uuid].addTrack(videoTracks[0], stream)
                    if (!this.videoSenders[uuid]) {
                        this.videoSenders[uuid] = this.peer_connections[uuid].addTrack(videoTracks[0], stream)
                    }
                })
            })
    }
}

export function toggleAudio () {
    const currentState = this.state.audioInput
    const { me } = this.state
    if (currentState) {
        // Currently on. Requesting to turn audio off.
        let current_stream = this.state.streams[me.uuid]
        if (current_stream) {
            Object.keys(this.peer_connections).forEach( uuid => {
                if (uuid === me.uuid) return
                console.log(this.audioSenders[uuid])
                this.peer_connections[uuid].removeTrack(this.audioSenders[uuid])
                console.log("removed track from " + uuid)
            })
            let audioTracks = current_stream.getAudioTracks()
            audioTracks.forEach(track => {
                track.stop()
                current_stream.removeTrack(track)
            })
        }
        this.setState({
            streams: {
                ...this.state.streams,
                [me.uuid]: current_stream
            },
            audioInput: false,
        })
    } else {
        // Currently off. Requesting to turn audio on.
        console.log("Turning audio on")
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                const audioTracks = stream.getAudioTracks()

                console.log(this.streams)
                let current_stream = this.state.streams[me.uuid]
                if (!current_stream) current_stream = new MediaStream()
                console.log("Adding a track")
                current_stream.addTrack(audioTracks[0])

                this.setState({
                    streams: {
                        ...this.state.streams,
                        [me.uuid]: current_stream
                    },
                    audioInput: true,
                })

                console.log(current_stream)

                Object.keys(this.peer_connections).forEach( uuid => {
                    if (uuid === me.uuid) return

                    this.audioSenders[uuid] = this.peer_connections[uuid].addTrack(audioTracks[0], stream)
                })
            })
    }
}
