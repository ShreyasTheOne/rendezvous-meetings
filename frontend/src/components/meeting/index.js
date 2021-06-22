import React, { Component } from 'react'

class Meeting extends Component {
    render () {
        return (
            <div>
                {this.props.match.params.code}
            </div>
        )
    }
}

export default Meeting
