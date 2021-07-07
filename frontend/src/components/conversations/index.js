import React, {Component} from 'react'
import {connect} from 'react-redux'
import axios from 'axios'
import NavBar from "../nav"
import {
    Header,
    Loader,
    Image,
} from 'semantic-ui-react'

import './index.css'

import AppBar from "../appBar"

class Conversations extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const {UserInformation} = this.props
        const me = UserInformation.user
        return (
            <>
                <AppBar/>
                <div id='conversations-parent'>
                    <NavBar menu_item={'conversations'}/>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        UserInformation: state.userInformation
    }
}

export default connect(mapStateToProps, null)(Conversations)
