import React, {Component} from "react"
import rough from 'roughjs/bundled/rough.esm'
import {TOOLS} from '../toolbar/tools'

import {
    websocketMessageTypes
} from "../../../../constants/websocketMessageTypes"

import {apiWSWhiteboard} from "../../../../urls"
import {Loader} from "semantic-ui-react"

const generator = rough.generator()

const initialState = {
    elements: [],
    action: '',
    curvePoints: [],
    mostRecentlyCreatedElement: '',
    whiteboardInitialised: false,
}

class WhiteboardCanvas extends Component {

    constructor(props) {
        super(props)
        this.state = initialState
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.open !== this.props.open && this.props.open) {
            this.openWSConnection()
        } else {
            this.fillCanvas()
        }
    }

    componentDidMount() {
        this.openWSConnection()
    }

    openWSConnection() {
        this.whiteboardWebsocket = new WebSocket(apiWSWhiteboard(this.props.code))
        this.whiteboardWebsocket.onmessage = this.handleWhiteboardWebSocketMessage.bind(this)
        this.whiteboardWebsocket.onclose = this.handleWhiteboardWebSocketClose.bind(this)
    }

    handleWhiteboardWebSocketClose = event => {
        this.setState(initialState)
    }

    handleWhiteboardWebSocketMessage = event => {
        let message = JSON.parse(decodeURIComponent(event.data))
        const type = message.type
        message = message.message

        switch (type) {
            case websocketMessageTypes.WHITEBOARD_DRAW_STROKE:
                this.handleNewStroke(message)
                break
            case websocketMessageTypes.INITIALISE_WHITEBOARD:
                this.initialiseWhiteboard(message)
                break
            default:
                break
        }
    }

    emitThroughSocket = message => {
        this.whiteboardWebsocket.send(encodeURIComponent(JSON.stringify(message)))
    }

    initialiseWhiteboard(message) {
        const {elements} = message
        let elements_json = []
        if (elements) {
            elements.forEach(e => {
                elements_json.push(JSON.parse(e))
            })
        }

        this.setState({
            elements: elements_json,
            whiteboardInitialised: true
        })
    }

    handleNewStroke(stroke) {
        this.setState({
            elements: [
                ...this.state.elements,
                JSON.parse(stroke)
            ]
        })
    }

    fillCanvas() {
        const canvas = document.getElementById('whiteboard-canvas')
        if (!canvas) return

        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)

        const roughCanvas = rough.canvas(canvas)

        if (this.state.elements) {
            this.state.elements.forEach(({type, roughElement}) => {
                if (type === TOOLS.ERASER) {
                    context.globalCompositeOperation = 'destination-out'
                } else {
                    context.globalCompositeOperation = 'source-over'
                }

                roughCanvas.draw(roughElement)
            })
        }
    }

    getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

        return {
            clientX: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
            clientY: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        }
    }

    createElement(x1, y1, x2, y2) {
        const type = this.props.currentTool

        let roughElement

        if (type === TOOLS.LINE) {
            roughElement = generator.line(x1, y1, x2, y2)
        } else if (type === TOOLS.RECTANGLE) {
            roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1)
        } else if (type === TOOLS.CIRCLE) {
            roughElement = generator.circle((x1 + x2) / 2, (y1 + y2) / 2, Math.min(x2 - x1, y2 - y1))
        } else if (type === TOOLS.CURVE) {
            const curvePoints = [...this.state.curvePoints, [x2, y2]]
            roughElement = generator.curve(curvePoints, {roughness: 0})
            this.setState({curvePoints})
        } else if (type === TOOLS.ERASER) {
            const curvePoints = [...this.state.curvePoints, [x2, y2]]
            roughElement = generator.curve(curvePoints, {roughness: 0, strokeWidth: 40})
            this.setState({curvePoints})
        }

        let element = {x1, y1, x2, y2, type, roughElement}
        this.setState({
            mostRecentlyCreatedElement: JSON.stringify(element)
        })

        return element
    }


    handleMouseDown = event => {
        if (this.props.currentTool === TOOLS.SELECTOR) return
        let canvas = document.getElementById('whiteboard-canvas')
        const {clientX, clientY} = this.getMousePos(canvas, event)

        const newElement = this.createElement(clientX, clientY, clientX, clientY)

        this.setState({
            elements: [...this.state.elements, newElement]
        })
        this.setState({
            action: 'drawing'
        })
    }

    handleMouseUp = event => {
        if (this.state.mostRecentlyCreatedElement) {
            this.emitThroughSocket({
                type: websocketMessageTypes.WHITEBOARD_DRAW_STROKE,
                message: this.state.mostRecentlyCreatedElement
            })
        }

        this.setState({
            action: '',
            curvePoints: [],
            mostRecentlyCreatedElement: ''
        })

    }

    handleMouseMove = event => {
        if (!(this.state.action === 'drawing') || this.props.currentTool === TOOLS.SELECTOR) return

        let canvas = document.getElementById('whiteboard-canvas')
        const {clientX, clientY} = this.getMousePos(canvas, event)

        const {elements} = this.state
        const lastIndex = elements.length - 1
        const {x1, y1} = elements[lastIndex]

        const updatedElement = this.createElement(x1, y1, clientX, clientY)

        let newElements = [...elements]
        newElements[lastIndex] = updatedElement

        this.setState({elements: newElements})
    }

    render() {
        const {canvasHeight, canvasWidth} = this.props
        const {whiteboardInitialised} = this.state

        if (!whiteboardInitialised) {
            return (
                <Loader active inline={'centered'}/>
            )
        }

        return (
            <canvas
                id={'whiteboard-canvas'}
                width={`${canvasWidth}`}
                height={`${canvasHeight}`}
                onMouseDown={this.handleMouseDown.bind(this)}
                onMouseMove={this.handleMouseMove.bind(this)}
                onMouseUp={this.handleMouseUp.bind(this)}
            >
            </canvas>
        )
    }
}

export default WhiteboardCanvas
