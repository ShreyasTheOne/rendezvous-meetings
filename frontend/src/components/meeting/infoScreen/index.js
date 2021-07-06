import React, { Component } from "react"
import {Button, Header, Loader} from "semantic-ui-react"
import {routeHome} from "../../../urls"
import {centerFullPage} from "../../../styles"

import {
    MEETING_CODE_INVALID,
    YOU_ARE_REMOVED,
    YOU_ARE_BANNED
} from "../../../constants/websocketCloseCodes"

const containerStyle = {
    ...centerFullPage,
    backgroundColor: '#1b1a17'
}

const contentFields = {
    [MEETING_CODE_INVALID.code]: {
        'H1': (
                <>
                The meeting code is invalid &nbsp;
                    <span
                        aria-label="face with monocle"
                        role="img"
                        className="careful-emoji-inside">
                        🙁
                    </span>
                </>
            ),
        'H2':
            (
                <>
                    Redirecting...
                </>
            ),
    },
    [YOU_ARE_REMOVED.code]: {
        'H1':
            (
                <>
                    You have been
                    <span style={{color: 'grey'}}> removed </span>
                    from the meeting
                </>
            ),
        'H2':
            (
                <>
                Redirecting...
                </>
            ),
    },
    [YOU_ARE_BANNED.code]: {
        'H1':
            (
                <>
                    You have been
                    <span style={{color: 'red'}}> banned </span>
                    from the meeting
                </>
            ),
        'H2':
            (
                <>
                Redirecting...
                </>
            ),
    },
}

class MeetingInfoScreen extends Component {

    componentDidMount() {
        setTimeout(() => {
            window.location = routeHome()
        }, 2000)
    }

    render () {
        const { code } = this.props
        console.log("CODE", code)
        return (
            <div style={containerStyle}>
                <Header
                    as={'h1'}
                    color={'grey'}
                    inverted
                    style={{
                        fontSize: '5rem',
                        marginBottom: '0'
                    }}
                >
                    {contentFields[code]['H1']}
                </Header>
                <Header
                    as={'h1'}
                    color={'grey'}
                    size={'huge'}
                    style={{
                        marginTop: '0',
                        marginBottom: '3rem'
                    }}
                >
                    {contentFields[code]['H2']}
                </Header>

                <Loader active inline/>
            </div>
        )
    }
}

export default MeetingInfoScreen
