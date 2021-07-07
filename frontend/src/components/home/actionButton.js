import React, { Component } from 'react'
import {Card, Header, Icon, Segment} from "semantic-ui-react";

class ActionButton extends Component {

    render () {
        const {
            action,
            setDialogBoxOpenClose
        } = this.props
        return (
            <div
                key={action['key']}
                className='action-card-container'
            >
                <Segment
                    raised
                    style={{
                        backgroundColor: action['bgColor'],
                        cursor: 'pointer',
                    }}
                    onClick={() => setDialogBoxOpenClose(action['key'], true)}
                >
                    <div className={'segment-inner'}>
                        <Icon
                            color={'black'}
                            name={action['icon']}
                            size={'big'}
                        />
                        <div className={'segment-label'}>
                            <Card.Header>
                            <Header
                                as={'h1'}
                                style={{ fontSize: '1.7rem' }}
                            >
                                {action['header']}
                            </Header>
                        </Card.Header>
                        <Card.Meta>
                            {action['meta']}
                        </Card.Meta>
                        </div>
                    </div>
                </Segment>
            </div>
        )
    }
}

export default ActionButton