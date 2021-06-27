import React, { Component } from 'react'
import {Button, Card, Image, List, TransitionablePortal} from "semantic-ui-react";
import {ADMIT_USER, REJECT_USER} from "../../../constants/websocketMessageTypes"


class JoinRequestPortal extends Component {
    render () {
        const {
            open,
            requests,
            handleAction,
        } = this.props

        return (
            <TransitionablePortal open={open}>
                <Card
                    style={{
                        left: '30%',
                        top: '40%',
                        width: '40%',
                        position: 'fixed',
                        zIndex: 1000
                    }}
                >
                    <Card.Content header={'The following users request permission to be admitted to the meeting'}/>
                    <Card.Content>
                        {
                            requests.map(user => {
                                return (
                                    <List
                                        key={user.uuid}
                                        animated
                                        divided
                                        verticalAlign='middle'
                                    >
                                        <List.Item>
                                            <List.Content floated='right'>
                                                <Button
                                                    onClick={
                                                        () => {
                                                            handleAction(user['uuid'], ADMIT_USER)
                                                        }
                                                    }
                                                    positive
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    onClick={
                                                        () => {
                                                            handleAction(user['uuid'], REJECT_USER)
                                                        }
                                                    }
                                                    negative
                                                >
                                                    Reject
                                                </Button>
                                            </List.Content>
                                            <Image avatar src={user['profile_picture']}/>
                                            <List.Content>{user['full_name']} - {user['email']}</List.Content>
                                        </List.Item>
                                    </List>
                                )
                            })
                        }
                    </Card.Content>
                </Card>
            </TransitionablePortal>
        )
    }
}

export default JoinRequestPortal
