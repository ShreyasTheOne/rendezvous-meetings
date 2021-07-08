import React, {Component} from 'react'

const containerStyle = {
    height: '48px',
    width: '100%',
    backgroundColor: '#1b1a17',
    borderBottom: '1px solid #37352f',

    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 'calc(90px + 2rem)',
    justifyContent: 'flex-start',
    alignItems: 'center',
}

const appHeaderStyle = {
    color: 'white',
    fontSize: '1.5rem',
    fontFamily: 'Open Sans'
}

class AppBar extends Component {
    render() {
        return (
            <div style={containerStyle}>
                <span style={appHeaderStyle}>
                    Rendezvous Meetings
                </span>
            </div>
        )
    }
}

export default AppBar
