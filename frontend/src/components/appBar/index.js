import React, {Component} from 'react'

const containerStyle = {
    height: '48px',
    width: '100%',
    backgroundColor: '#1b1a17',
    borderBottom: '1px solid #37352f',

    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 'calc(90px + 2rem)',
    paddingRight: '3rem',
    justifyContent: 'space-between',
    alignItems: 'center',
}

const appHeaderStyle = {
    color: 'white',
    fontSize: '1.5rem',
    fontFamily: 'Open Sans'
}

const ribbonStyle = {
    color: 'white',
    fontSize: '1rem',

}

const ShreyasTheOne = {
    marginLeft: '0.5rem',
    color: '#FFB17A',
    fontFamily: 'JetBrains Mono',
    textDecoration: 'none'
}

const myGithub = 'https://www.github.com/ShreyasTheOne'

class AppBar extends Component {

    render() {

        const {showMyName} = this.props

        return (
            <div style={containerStyle}>
                <span style={appHeaderStyle}>
                    Rendezvous Meetings
                </span>

                {showMyName &&
                <span style={ribbonStyle}>
                    Developed by
                    <a
                        href={myGithub}
                        style={ShreyasTheOne}
                        target={'blank'}
                    >
                        @ShreyasTheOne
                    </a>
                </span>}
            </div>
        )
    }
}

export default AppBar
