import React, { Component } from "react"
import {centerFullParent} from "../../../../styles"
import {Icon, Segment} from 'semantic-ui-react'
import {TOOLS} from './tools'

import './index.css'

const containerStyle = {
    ...centerFullParent,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
}

const tools = [
    {
        'key': TOOLS.SELECTOR,
        'icon': 'hand paper outline'
    },
    {
        'key': TOOLS.CURVE,
        'icon': 'pencil'
    },
    {
        'key': TOOLS.LINE,
        'icon': 'window minimize outline'
    },
    {
        'key': TOOLS.RECTANGLE,
        'icon': 'square outline'
    },
    {
        'key': TOOLS.CIRCLE,
        'icon': 'circle outline'
    },
    {
        'key': TOOLS.ERASER,
        'icon': 'eraser'
    }
]

class WhiteboardToolbar extends Component {
    render () {
        const {currentTool, handleToolChange} = this.props

        return (
            <div style={containerStyle}>
                <Segment
                inverted
                    style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}
                >
                    {tools.map(tool => {
                        const selected = tool['key'] === currentTool ? 'selected-tool' : ''
                        return (
                            <Icon
                                link
                                bordered
                                circular
                                name={tool['icon']}
                                className={`toolbar-icon ${selected}`}
                                size={'large'}
                                onClick={() => handleToolChange(tool['key'])}
                            />
                        )
                    })}
                </Segment>
            </div>
        )
    }
}

export default WhiteboardToolbar
