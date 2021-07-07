import React, {Component} from 'react'
import {Modal, Loader} from 'semantic-ui-react'
import WhiteboardToolbar from "./toolbar"
import WhiteboardCanvas from "./canvas"
import {TOOLS} from './toolbar/tools'

class Whiteboard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            canvasHeight: null,
            canvasWidth: null,
            currentTool: TOOLS.CURVE,
        }
    }

    handleClose = () => {
        const {toggleWhiteboard} = this.props
        // Save whiteboard here? ==> No because then we cannot update those who joined later
        toggleWhiteboard()
    }

    handleToolChange = tool => {
        this.setState({
            currentTool: tool
        })
    }

    onWindowResize = () => {
        this.setCanvasDimensions()
    }

    setCanvasDimensions = () => {
        const container = document.getElementById('canvas-container')
        if (container) {
            const canvasHeight = container.offsetHeight
            const canvasWidth = container.offsetWidth
            const currentH = this.state.canvasHeight
            const currentW = this.state.canvasWidth
            if (!(currentH === canvasHeight && currentW === canvasWidth))
                this.setState({
                    canvasHeight,
                    canvasWidth
                })
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResize.bind(this))
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.setCanvasDimensions()
    }

    render() {
        const {open} = this.props
        const {canvasHeight, canvasWidth, currentTool} = this.state
        return (
            <Modal
                open={open}
                closeIcon
                style={{width: '85%', height: '85%'}}
                size={'large'}
                onClose={() => this.handleClose()}
            >
                <Modal.Content style={{height: '90%', padding: '0'}}>
                    <div id={'canvas-container'} style={{height: '100%', width: '100%'}}>
                        {(canvasWidth && canvasHeight) ?
                            <WhiteboardCanvas
                                open={open}
                                code={this.props.code}
                                canvasWidth={canvasWidth}
                                canvasHeight={canvasHeight}
                                currentTool={currentTool}
                            />
                            :
                            <Loader inline={'centered'} active/>
                        }
                    </div>
                </Modal.Content>
                <Modal.Content>
                    <WhiteboardToolbar
                        currentTool={currentTool}
                        handleToolChange={this.handleToolChange.bind(this)}
                    />
                </Modal.Content>
            </Modal>
        )
    }
}

export default Whiteboard
