import React, { Component } from "react"
import {centerFullPage} from "../../styles";
import {Button, Header} from "semantic-ui-react";
import {routeHome} from "../../urls";

const containerStyle = {
    ...centerFullPage,
    backgroundColor: '#1b1a17'
}

class _404 extends Component {
    render () {

        return (
            <div style={containerStyle}>
                <Header
                    as={'h1'}
                    color={'grey'}
                    inverted
                    textAlign={'center'}
                    style={{
                        fontSize: '5rem',
                        marginBottom: '0'
                    }}
                >
                    You seem to be lost...
                </Header>
                <Header
                    as={'h1'}
                    color={'grey'}
                    size={'huge'}
                    textAlign={'center'}
                    style={{
                        marginTop: '0',
                        marginBottom: '3rem'
                    }}
                >
                    Error 404: Page not found!
                </Header>

                <Button
                    inverted
                    onClick={() => {window.location = routeHome()}}
                >
                    Go home
                </Button>
            </div>
        )
    }
}

export default _404