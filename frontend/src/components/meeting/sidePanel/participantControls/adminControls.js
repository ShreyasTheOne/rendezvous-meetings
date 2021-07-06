import React, {Component} from 'react'
import {Button, Icon} from "semantic-ui-react";

class AdminControls extends Component {

    render () {
        const { participantControlFunctions, user } = this.props

        return (
            <Button.Group icon>
                <Button
                    color='black'
                    onClick={() => participantControlFunctions['remove'](user.uuid)}
                >
                    <Icon name='remove'/>
                </Button>
                <Button
                    color='black'
                    onClick={() => participantControlFunctions['ban'](user.uuid)}
                >
                    <Icon color='red' name='ban'/>
                </Button>
                <Button
                    color='black'
                    onClick={participantControlFunctions['mute']}
                >
                    <Icon color='red' name='microphone'/>
                </Button>
                <Button
                    color='black'
                    onClick={participantControlFunctions['camera']}
                >
                    <Icon color='red' name='camera'/>
                </Button>
            </Button.Group>
        )
    }
}

export default AdminControls
