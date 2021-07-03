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
                    style={{
                        fontSize: '5rem',
                        marginBottom: '0'
                    }}
                >
                    Error: 404
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
                    Page not found!
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