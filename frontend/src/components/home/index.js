import React, { Component } from 'react'
import NavBar from "../nav";

class Home extends Component {
    render () {
        return (
            <div>
                <NavBar
                    menu_item={'home'}
                />
            </div>
        )
    }
}

export default Home
