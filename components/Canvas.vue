<template>
    <div>
        <div class="toolbox-wrapper">
            <button
                :class="[
                    { higlighted: toolbox.scrappingKnife.highlighted },
                    'button-box',
                    'scrapping-knife',
                    { 'active-tool': toolbox.activeTool === 'scrappingKnife' },
                    { 'tool-disabled': !toolbox.scrappingKnife.enabled }
                ]"
                @click="eraseContent"
            >
                {{ $t('tools.scrapping_knife') }}
            </button>
            <button
                :class="[
                    { higlighted: toolbox.cuttingKnife.highlighted },
                    'button-box',
                    'cutting-knife',
                    { 'active-tool': toolbox.activeTool === 'cuttingKnife' },
                    { 'tool-disabled': !toolbox.cuttingKnife.enabled }
                ]"
                @click="resizeCanvas"
            >
                {{ $t('tools.cutting_knife') }}
            </button>
            <button
                :class="[
                    { higlighted: toolbox.powder.highlighted },
                    'button-box',
                    'button-box-right',
                    'powder',
                    { 'active-tool': toolbox.activeTool === 'powder' },
                    { 'tool-disabled': !toolbox.powder.enabled }
                ]"
                @click="powderContent"
            >
                {{ $t('tools.powder') }}
            </button>
            <button
                :class="[
                    { higlighted: toolbox.ink.highlighted },
                    'button-box',
                    'button-box-right',
                    'ink',
                    { 'active-tool': toolbox.activeTool === 'ink' },
                    { 'tool-disabled': !toolbox.ink.enabled }
                ]"
                @click="drawWithInk"
            >
                {{ $t('tools.ink') }}
            </button>
        </div>

        <div class="table">
            <div id="canvas-editor" ref="container">
                <v-stage
                    ref="stage"
                    :config="stage.config"
                    @mouseup="handleMouseUp"
                    @mousemove="handleMouseMove"
                    @touchend="handleMouseUp"
                    @touchmove="handleMouseMove"
                    @mousedown="handleMouseDown"
                    @touchstart="handleMouseDown"
                >
                    <v-layer ref="background">
                        <v-image :config="layers.backgroundStorage" />
                    </v-layer>
                    <v-layer ref="manuscript">
                        <v-image
                            ref="manuscriptLayerStorage"
                            :config="layers.manuscriptStorage"
                        />
                    </v-layer>
                    <v-layer v-if="toolbox.activeTool === 'cuttingKnife'">
                        <v-rect
                            v-for="(rectangle, index) in rectangles"
                            :key="'rectangle' + index"
                            ref="rectangle"
                            :config="rectangle"
                        />
                    </v-layer>
                    <v-layer ref="grid">
                        <v-circle
                            v-for="(circle, index) in circles"
                            :key="'circle' + index"
                            ref="circle"
                            class="fillShape"
                            :config="circle"
                            @dragmove="adjustLines($event, index)"
                        />
                        <v-line
                            v-for="(line, index) in lines"
                            :key="'line' + index"
                            :config="line"
                            class="grid-line"
                        />
                    </v-layer>
                    <v-layer ref="palimpsest">
                        <v-image
                            v-if="toolbox.drawingTools.canDraw"
                            :config="layers.palimpsestStorage"
                        />
                    </v-layer>
                </v-stage>
            </div>
        </div>
    </div>
</template>

<script>
let context = null

export default {
    props: {
        customBackground: {
            type: String,
            default: '/imgs/background_canvas.png'
        },
        stageName: {
            type: String,
            default: 'manuscript'
        }
    },
    data() {
        return {
            stage: {
                node: null,
                config: {
                    width: 500,
                    height: 500,
                    container: '#canvas-editor'
                }
            },
            layers: {
                config: {
                    position: 1,
                    name: 'background'
                },
                backgroundStorage: {
                    x: 0,
                    y: 0,
                    image: null
                },
                palimpsestStorage: {
                    x: 0,
                    y: 0,
                    image: null
                },
                manuscriptStorage: {
                    x: 0,
                    y: 0,
                    image: null
                },
                background: null,
                manuscript: null,
                palimpsest: null
            },
            lastPointerPosition: { x: 0, y: 0 },
            // Shape storage
            circles: [],
            lines: [],
            rectangles: [],
            timeout: null,
            bubbleEnabled: true,
            // Toolbox settings
            toolbox: {
                step: 0,
                activeTool: null,
                drawingTools: {
                    isDrawing: false,
                    canDraw: false
                },
                scrappingKnife: {
                    highlighted: false,
                    used: false,
                    enabled: true,
                    brushColor: 'RGBA(220, 202, 167, 0.06)',
                    brushSize: 120,
                    brushLineJoin: 'round'
                },
                cuttingKnife: {
                    highlighted: false,
                    used: false,
                    enabled: false,
                    canDraw: false,
                    mode: 'crop',
                    brushColor: 'RGBA(217, 204, 178, 0.15)',
                    brushSize: 20,
                    brushLineJoin: 'round'
                },
                powder: {
                    highlighted: false,
                    used: false,
                    enabled: false,
                    brushColor: 'RGBA(230, 217, 191, 0.1)',
                    brushSize: 100,
                    brushLineJoin: 'round'
                },
                lines: {
                    highlighted: false,
                    used: false,
                    connected: 0,
                    enabled: false,
                    dotColor: 'RGBA(0, 0, 0, 0.75)',
                    dotColorSuccess: 'RGBA(145, 167, 110, 0.75)',
                    lineColor: 'RGBA(0, 0, 0, 0.50)',
                    startingPosition: 45,
                    visibleCircleWidth: 7,
                    visibleCircleHeight: 7,
                    draggableCircleWidth: 70,
                    draggableCircleHeight: 70
                },
                ink: {
                    highlighted: false,
                    used: false,
                    enabled: false,
                    brushColor: 'RGBA(0, 0, 0, .7)',
                    brushSize: 3,
                    brushLineJoin: 'round'
                }
            }
        }
    },
    computed: {
        currentLayer() {
            return this.layers.config.name
        },
        guideStep() {
            return this.$store.state.guide.step
        }
    },
    watch: {
        'toolbox.step': 'unlockTools',
        customBackground: (current, previous) => {
            this.setCanvasBackground(current)
        }
    },
    mounted() {
        this.stage.node = this.$refs.stage.getNode()

        this.layers.background = this.$refs.background.getNode()
        this.layers.manuscript = this.$refs.manuscript.getNode()
        this.layers.palimpsest = this.$refs.palimpsest.getNode()

        this.setCanvasBackground(this.customBackground)

        let canvas = document.querySelectorAll('canvas')
        canvas = canvas[1]
        context = canvas.getContext('2d')

        this.setCanvasSize()

        if (this.stageName === 'palimpsest') {
            this.toolbox.step = 4
            this.toolbox.scrappingKnife.used = false
            this.toolbox.cuttingKnife.used = true
            this.toolbox.ink.used = false
            this.toolbox.powder.used = true
            this.toolbox.lines.used = true
        }

        window.addEventListener('resize', this.setCanvasSize)

        // Event listeners
        this.$bus.$on('highlightScrappingKnife', () => {
            this.highlight('scrappingKnife')
        })
        this.$bus.$on('highlightCroppingKnife', () => {
            this.highlight('cuttingKnife')
        })
        this.$bus.$on('highlightPowder', () => {
            this.highlight('powder')
        })
        this.$bus.$on('highlightRuler', () => {
            this.addLiningDots()
        })
        this.$bus.$on('highlightInk', () => {
            this.highlight('ink')
        })
        this.$bus.$on('disableBubble', () => {
            this.disableBubble()
        })
    },
    methods: {
        /**
         * Handle mouse down.
         *
         * @param {Object} event
         */
        handleMouseDown(event) {
            // Save last pointer position, so we can start drawing from there.
            this.lastPointerPosition = this.stage.node.getPointerPosition()

            if (this.toolbox.drawingTools.canDraw) {
                // Enable drawing by standard drawing tools
                this.toolbox.drawingTools.isDrawing = true
            } else if (
                this.toolbox.activeTool === 'cuttingKnife' &&
                this.toolbox.cuttingKnife.mode === 'crop'
            ) {
                // Enable croping by creation of croping rectangle
                this.toolbox.cuttingKnife.canDraw = true
                this.createCuttingRectangle()
            }
        },
        /**
         * Handle mouse moving on the canvas.
         *
         * @param {Object} event
         */
        handleMouseMove(event) {
            if (
                this.toolbox.drawingTools.canDraw &&
                this.toolbox.drawingTools.isDrawing
            ) {
                this.startFreeDrawing()
            } else if (
                this.toolbox.activeTool === 'cuttingKnife' &&
                this.toolbox.cuttingKnife.canDraw &&
                this.toolbox.cuttingKnife.mode === 'crop'
            ) {
                this.drawCuttingRectangle()
            }
        },
        /**
         * When we click outside or just leave the area,
         * the drawing should stop.
         *
         * @param {Object} event
         */
        handleMouseUp(event) {
            if (
                this.toolbox.drawingTools.canDraw &&
                this.toolbox.drawingTools.isDrawing
            ) {
                this.toolbox.drawingTools.isDrawing = false

                if (this.bubbleEnabled) {
                    this.timeout = setTimeout(() => {
                        this.$bus.$emit('continue_with_story')
                    }, 2500)
                }
            } else if (
                this.toolbox.activeTool === 'cuttingKnife' &&
                this.toolbox.cuttingKnife.canDraw &&
                this.toolbox.cuttingKnife.mode === 'crop'
            ) {
                this.cutCanvasSize()
            }

            // Always save layer content, becuase if user change windows size
            // layer content might get deleted.
            this.saveLayerContent()
        },
        /**
         * Set canvas background to given source image.
         * This method uses standard html API to create element image. When the
         * image is succesfully loaded it is also stored in data of this
         * component.
         *
         * @param {String} src can be link or base64 encoded image
         */
        setCanvasBackground(src) {
            const image = new Image()
            image.onload = () => {
                this.layers.backgroundStorage.image = image
            }
            image.src = src
        },
        /**
         * Set canvas size to given values. Because size of the canvas cannot
         * be changed directly, the only way to achieve proper responsivity is
         * to modify data object in this component.
         *
         * @param {Object} event
         * @param {Number} customWidth
         * @param {Number} customHeight
         */
        setCanvasSize(event, customWidth = 0, customHeight = 0) {
            const container = this.$refs.container

            if (!container) {
                return
            }

            const height = container.offsetHeight
            const width = container.offsetWidth

            this.stage.config.width = customWidth !== 0 ? customWidth : width
            this.stage.config.height =
                customHeight !== 0 ? customHeight : height

            this.addReactiveRectangle(width, height)
        },
        /**
         * Add reactive rectangle to canvas, so we can catch drawing/dragging
         * events and show cropping borders.
         *
         * @param {Number} width,
         * @param {Number} height
         */
        addReactiveRectangle(width, height) {
            const reactiveRectIndex = this.rectangles.findIndex((rect) => {
                return rect.isReactive === true
            })

            if (reactiveRectIndex >= 0) {
                this.rectangles[reactiveRectIndex].width = width
                this.rectangles[reactiveRectIndex].height = height
            } else {
                this.rectangles.push({
                    x: 0,
                    y: 0,
                    width,
                    height,
                    isReactive: true
                })
            }
        },
        /**
         * Save layer's content, because when the canvas get resized free
         * drawing will disappear from it. This method converts content of the
         * canvas into dataURL and stores it as an image. This prevents from
         * erasing content on one hand, but on the other keeps things on the
         * place.
         *
         * @todo Save only active layer, not both of them.
         */
        saveLayerContent() {
            // Store content of mansucript layer.
            const manuscriptLayer = document.querySelectorAll('canvas')[1]
            const manuscriptImage = manuscriptLayer.toDataURL()

            const imageFromManuscriptLayer = new Image()
            imageFromManuscriptLayer.onload = () => {
                this.layers.manuscriptStorage.image = imageFromManuscriptLayer
                if (this.toolbox.powder.used) {
                    this.layers.manuscriptStorage.x = 0
                    this.layers.manuscriptStorage.y = 0
                }
            }
            imageFromManuscriptLayer.src = manuscriptImage

            // Store content of palimpsest layer.
            const palimpsestLayer = document.querySelectorAll('canvas')[3]
            const palimpsestImage = palimpsestLayer.toDataURL()

            const imageFromPalimpsestLayer = new Image()
            imageFromPalimpsestLayer.onload = () => {
                this.layers.palimpsestStorage.image = imageFromPalimpsestLayer
                if (this.toolbox.powder.used) {
                    this.layers.palimpsestStorage.x = 0
                    this.layers.palimpsestStorage.y = 0
                }
            }
            imageFromPalimpsestLayer.src = palimpsestImage
        },
        /**
         * Handles free drawing. At the beginning we set brush colour, size and
         * so on. Then we can start tracking the cursor and drawing a shape on
         * it's position.
         * Also each drawing clears timeout so timed events are not fired during
         * drawing (we set them again after mb or touch release).
         */
        startFreeDrawing() {
            clearTimeout(this.timeout)

            const activeTool = this.toolbox.activeTool

            // Configure brush
            context.globalCompositeOperation = 'source-over'
            context.strokeStyle = this.toolbox[activeTool].brushColor
            context.lineWidth = this.toolbox[activeTool].brushSize
            context.lineJoin = this.toolbox[activeTool].brushLineJoin

            // Start drawing
            context.beginPath()

            let localPos = {
                x: this.lastPointerPosition.x,
                y: this.lastPointerPosition.y
            }

            context.moveTo(localPos.x, localPos.y)
            const pos = this.stage.node.getPointerPosition()
            localPos = {
                x: pos.x,
                y: pos.y
            }
            context.lineTo(localPos.x, localPos.y)
            context.closePath()
            context.stroke()

            this.lastPointerPosition = pos
            this.layers.background.batchDraw()
        },
        disableBubble() {
            this.bubbleEnabled = false
            this.$bus.$emit('hide_bubble')
        },
        unlockTools() {
            switch (this.guideStep) {
                case 2:
                    this.toolbox.lines.enabled = false
                    this.toolbox.scrappingKnife.enabled = true
                    this.toolbox.cuttingKnife.enabled = false
                    this.toolbox.powder.enabled = false
                    this.toolbox.ink.enabled = false
                    break
                case 4:
                    this.toolbox.lines.enabled = false
                    this.toolbox.scrappingKnife.enabled = false
                    this.toolbox.cuttingKnife.enabled = true
                    this.toolbox.powder.enabled = false
                    this.toolbox.ink.enabled = false
                    break
                case 6:
                    this.toolbox.lines.enabled = false
                    this.toolbox.scrappingKnife.enabled = false
                    this.toolbox.cuttingKnife.enabled = false
                    this.toolbox.powder.enabled = true
                    this.toolbox.ink.enabled = false
                    break
                case 8:
                    this.toolbox.lines.enabled = true
                    this.toolbox.scrappingKnife.enabled = false
                    this.toolbox.cuttingKnife.enabled = false
                    this.toolbox.powder.enabled = false
                    this.toolbox.ink.enabled = false
                    break
                case 10:
                    this.toolbox.lines.enabled = false
                    this.toolbox.scrappingKnife.enabled = false
                    this.toolbox.cuttingKnife.enabled = true
                    this.toolbox.powder.enabled = false
                    this.toolbox.ink.enabled = true
                    break
                case 17:
                    this.toolbox.lines.enabled = false
                    this.toolbox.scrappingKnife.enabled = false
                    this.toolbox.cuttingKnife.enabled = true
                    this.toolbox.powder.enabled = false
                    this.toolbox.ink.enabled = true
                    break
                default:
                    this.toolbox.lines.enabled = false
                    this.toolbox.scrappingKnife.enabled = false
                    this.toolbox.cuttingKnife.enabled = true
                    this.toolbox.powder.enabled = false
                    this.toolbox.ink.enabled = true
            }
        },
        /**
         * Highlight one tool from toolbox.
         */
        highlight(toolName) {
            this.toolbox[toolName].highlighted = true
            this.toolbox.activeTool = null
            this.toolbox.drawingTools.canDraw = false
            this.$bus.$emit('hide_bubble')
            this.unlockTools()
        },
        /**
         * Create new rectangle config.
         */
        createCuttingRectangle() {
            if (this.findCuttingRectangle() < 0) {
                this.rectangles.push({
                    x: 0,
                    y: 0,
                    stroke: 'RGBA(26, 94, 129, 0.5)',
                    dash: [3, 3],
                    listening: false,
                    isCutting: true
                })
            }
        },
        /**
         * Find cutting rectangle inside array of rectangles. There should
         * be always only one cutting rectangle for the sake of simplicity!
         *
         * @return {Number} index of cutting rectangle.
         */
        findCuttingRectangle() {
            return this.rectangles.findIndex((rect) => {
                return rect.isCutting === true
            })
        },
        /**
         * Draw cutting rectangle so user see how big area will be cropped.
         * Because we use vue components it is possible to modify x and y coords
         * directly, also the widht and height props are changed.
         */
        drawCuttingRectangle() {
            const currentPosition = this.stage.node.getPointerPosition()

            const rectanglePosition = this.reverse(
                this.lastPointerPosition,
                currentPosition
            )

            const index = this.findCuttingRectangle()

            if (index >= 0) {
                const rectangle = this.$refs.rectangle[index].getNode()

                rectangle.x(rectanglePosition.x1)
                rectangle.y(rectanglePosition.y1)
                rectangle.width(rectanglePosition.x2 - rectanglePosition.x1)
                rectangle.height(rectanglePosition.y2 - rectanglePosition.y1)

                rectangle.visible(true)

                this.stage.node.draw()
            }
        },
        /**
         * This method handles the actual canvas cropping. When the rectangle is
         * finished, the canvas size is set to it's width and height. Similarly
         * layer storages are required to be moved so it does not look like we
         * cut different part of page.
         *
         * @todo Add breakpoints so the canvas is not too small.
         */
        cutCanvasSize() {
            const index = this.findCuttingRectangle()

            if (index >= 0) {
                const cuttingRectangle = this.$refs.rectangle[index].getNode()

                this.setCanvasSize(
                    null,
                    cuttingRectangle.width(),
                    cuttingRectangle.height()
                )

                // I'm sure this can be handled in a better way, but for now
                // it works. We set x and y position of background according to
                // x and y position of drawn rectangle.
                if (this.toolbox.cuttingKnife.canDraw) {
                    this.layers.manuscriptStorage.x = -cuttingRectangle.x()
                    this.layers.manuscriptStorage.y = -cuttingRectangle.y()
                    this.layers.backgroundStorage.x = -cuttingRectangle.x()
                    this.layers.backgroundStorage.y = -cuttingRectangle.y()
                    this.layers.palimpsestStorage.x = -cuttingRectangle.x()
                    this.layers.palimpsestStorage.y = -cuttingRectangle.y()
                }

                this.timeout = setTimeout(() => {
                    this.$bus.$emit('continue_with_story')
                }, 1000)

                this.toolbox.cuttingKnife.canDraw = false
                this.toolbox.cuttingKnife.mode = 'brush'

                cuttingRectangle.visible(false)
            }
        },
        /**
         * Here we'll set colour for the ink brush.
         */
        drawWithInk() {
            if (!this.toolbox.ink.enabled) {
                return
            }

            this.toolbox.activeTool = 'ink'

            this.toolbox.drawingTools.canDraw = true
            this.toolbox.ink.highlighted = false
            this.toolbox.ink.used = true
        },
        /**
         * This is actually not an eraser, but another brush
         * with similar colour to the background.
         */
        eraseContent() {
            if (!this.toolbox.scrappingKnife.enabled) {
                return
            }

            this.toolbox.activeTool = 'scrappingKnife'

            this.toolbox.drawingTools.canDraw = true
            this.toolbox.scrappingKnife.highlighted = false
            this.toolbox.scrappingKnife.used = true
        },
        /**
         * Powder is also done with brush.
         */
        powderContent() {
            if (!this.toolbox.powder.enabled) {
                return
            }

            this.toolbox.activeTool = 'powder'

            this.toolbox.drawingTools.canDraw = true
            this.toolbox.powder.highlighted = false
            this.toolbox.powder.used = true
        },
        /**
         * This method will add dots on the canvas and prepare lines
         * which are connecting them. User is actually not drawing lines
         * but is moving with invisible circle, that is connected with line.
         */
        addLiningDots() {
            this.toolbox.drawingTools.canDraw = false
            this.toolbox.lines.highlighted = false
            this.toolbox.lines.used = true

            this.$bus.$emit('hide_bubble')
            this.unlockTools()

            this.toolbox.activeTool = 'lines'

            // Set minimal Y multiplier to be height of the draggbox circle
            const minYMultipler = this.toolbox.lines.draggableCircleHeight
            // Count available rows based on node height and dragbox circle's height
            const availableRows = Math.floor(
                this.stage.node.height() / (minYMultipler + 20)
            )
            // Get available width in percents so we can position dots.
            const availableWidthPercent = this.stage.node.width() / 100

            // @todo x and y positions still needs some love (remove fixed values)
            const lineStart = availableWidthPercent * 10
            const xPositionStart = lineStart > 30 ? lineStart : 30

            this.toolbox.lines.startingPosition = xPositionStart + 15

            const lineEnd = availableWidthPercent * 70
            const xPositionEnd = lineEnd > 70 ? lineEnd : 70

            const minYPosition = this.toolbox.lines.draggableCircleHeight + 10

            // Append dots and lines to canvas
            for (let i = 0; i < availableRows; i++) {
                const yPosition = minYPosition * i + minYMultipler

                this.circles.push(
                    {
                        x: xPositionStart,
                        y: yPosition,
                        width: this.toolbox.lines.visibleCircleWidth,
                        height: this.toolbox.lines.visibleCircleHeight,
                        fill: this.toolbox.lines.dotColor,
                        start: i
                    },
                    {
                        x: xPositionStart,
                        y: yPosition,
                        width: this.toolbox.lines.draggableCircleWidth,
                        height: this.toolbox.lines.draggableCircleHeight,
                        fill: 'transparent',
                        draggable: true,
                        drag: i,
                        dragBoundFunc(pos) {
                            return {
                                x: pos.x,
                                y: this.absolutePosition().y
                            }
                        }
                    },
                    {
                        x: xPositionEnd,
                        y: yPosition,
                        width: this.toolbox.lines.visibleCircleWidth,
                        height: this.toolbox.lines.visibleCircleHeight,
                        fill: this.toolbox.lines.dotColor
                    }
                )

                const circleStart = this.circles.findIndex((circle) => {
                    return circle.start === i
                })
                const circleDrag = this.circles.findIndex((circle) => {
                    return circle.drag === i
                })

                this.lines.push({
                    points: [
                        this.circles[circleStart].x,
                        this.circles[circleStart].y,
                        this.circles[circleDrag].x,
                        this.circles[circleDrag].y
                    ],
                    stroke: this.toolbox.lines.lineColor,
                    strokeWidth: 1,
                    circleIndex: circleDrag
                })
            }
        },
        /**
         * This method handles movement of the invisible circles, when
         * user reaches another dot the invisible dot gets locked so
         * he/she can't move it again.
         */
        adjustLines(e, index) {
            if (!this.toolbox.lines.enabled) {
                return
            }

            const points = [
                this.circles[index].x,
                this.circles[index].y,
                this.$refs.circle[index].getNode().getX() + 35,
                this.circles[index].y
            ]

            const linePosition = this.lines.findIndex((element) => {
                return element.circleIndex === index
            })

            this.lines[linePosition].points = points

            const target = e.target
            const targetRect = e.target.getClientRect()

            this.$refs.grid.getNode().children.each((group) => {
                if (group === target) {
                    return
                }
                if (this.haveIntersection(group.getClientRect(), targetRect)) {
                    if (group.getX() > this.toolbox.lines.startingPosition) {
                        target.draggable(false)
                        this.toolbox.lines.connected++

                        if (
                            this.toolbox.lines.connected === this.lines.length
                        ) {
                            this.toolbox.lines.enabled = false
                            this.timeout = setTimeout(() => {
                                this.$bus.$emit('continue_with_story')
                            }, 1000)
                        }
                    }
                    group.fill(this.toolbox.lines.dotColorSuccess)
                }
            })

            this.layers.background.draw()
            this.layers.palimpsest.draw()

            let canvas = document.querySelectorAll('canvas')
            canvas = canvas[3]
            context = canvas.getContext('2d')
        },
        /**
         * This is just a loop through array of classes which changes
         * the size of the canvas.
         *
         * I'm pretty sure that there is a nicer way how to do it.
         */
        resizeCanvas() {
            this.toolbox.cuttingKnife.highlighted = false

            if (!this.toolbox.cuttingKnife.enabled) {
                return
            }

            if (this.guideStep > 8) {
                this.toolbox.activeTool = 'cuttingKnife'

                this.toolbox.drawingTools.canDraw = true
                this.toolbox.cuttingKnife.highlighted = false
                this.toolbox.cuttingKnife.used = true
            } else {
                clearTimeout(this.timeout)

                this.toolbox.activeTool = 'cuttingKnife'
                this.toolbox.cuttingKnife.highlighted = false
                this.toolbox.cuttingKnife.used = true
            }
        },
        /**
         * Helper method to check whether objects collided.
         *
         * @param {Object} r1
         * @param {Object} r2
         */
        haveIntersection(r1, r2) {
            return !(
                r2.x > r1.x + r1.width ||
                r2.x + r2.width < r1.x ||
                r2.y > r1.y + r1.height ||
                r2.y + r2.height < r1.y
            )
        },
        /**
         * Helper method to get rectangle position, width and height.
         *
         * @param {Object} r1
         * @param {Object} r2
         */
        reverse(r1, r2) {
            let r1x = r1.x
            let r1y = r1.y
            let r2x = r2.x
            let r2y = r2.y
            let d = null

            if (r1x > r2x) {
                d = Math.abs(r1x - r2x)
                r1x = r2x
                r2x = r1x + d
            }

            if (r1y > r2y) {
                d = Math.abs(r1y - r2y)
                r1y = r2y
                r2y = r1y + d
            }

            return { x1: r1x, y1: r1y, x2: r2x, y2: r2y }
        }
    }
}
</script>
