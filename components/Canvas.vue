<template>
    <div>
        <div class="toolbox-wrapper">
            <button
                @click="eraseContent"
                :class="[
                    { higlighted: toolbox.scrappingKnife.highlighted },
                    'button-box',
                    'scrapping-knife',
                    { 'active-tool': toolbox.activeTool === 'scrappingKnife' },
                    { 'tool-disabled': !toolbox.scrappingKnife.enabled }
                ]"
            >
                {{ $t('tools.scrapping_knife') }}
            </button>
            <button
                @click="resizeCanvas"
                :class="[
                    { higlighted: toolbox.cuttingKnife.highlighted },
                    'button-box',
                    'cutting-knife',
                    { 'tool-disabled': !toolbox.cuttingKnife.enabled }
                ]"
            >
                {{ $t('tools.cutting_knife') }}
            </button>
            <button
                @click="powderContent"
                :class="[
                    { higlighted: toolbox.powder.highlighted },
                    'button-box',
                    'powder',
                    { 'active-tool': toolbox.activeTool === 'powder' },
                    { 'tool-disabled': !toolbox.powder.enabled }
                ]"
            >
                {{ $t('tools.powder') }}
            </button>
            <button
                @click="addLiningDots"
                :class="[
                    { higlighted: toolbox.lines.highlighted },
                    'button-box',
                    'button-box-right',
                    'ruler',
                    { 'active-tool': toolbox.activeTool === 'lines' },
                    { 'tool-disabled': !toolbox.lines.enabled }
                ]"
            >
                {{ $t('tools.add_lines') }}
            </button>
            <button
                @click="drawWithInk"
                :class="[
                    { higlighted: toolbox.ink.highlighted },
                    'button-box',
                    'button-box-right',
                    'ink',
                    { 'active-tool': toolbox.activeTool === 'ink' },
                    { 'tool-disabled': !toolbox.ink.enabled }
                ]"
            >
                {{ $t('tools.ink') }}
            </button>
        </div>

        <div class="table">
            <div
                id="konva-container"
                :class="canvasSize.classes[canvasSize.index]"
                ref="container"
                :style="'background-image: url(' + this.customBackground + ');'"
            >
                <v-stage
                    ref="stage"
                    :config="stageSize"
                    @mouseup="handleMouseUp"
                    @mousemove="handleMouseMove"
                    @touchend="handleMouseUp"
                    @touchmove="handleMouseMove"
                    @mousedown="handleMouseDown"
                    @touchstart="handleMouseDown"
                >
                    <v-layer ref="background"></v-layer>
                    <v-layer ref="manuscript"></v-layer>
                    <v-layer ref="grid">
                        <v-circle
                            :config="circle"
                            v-for="(circle, index) in circles"
                            :key="'circle' + index"
                            @dragmove="adjustLines($event, index)"
                            ref="circle"
                            class="fillShape"
                        />
                        <v-line
                            :config="line"
                            v-for="(line, index) in lines"
                            :key="'line' + index"
                            class="grid-line"
                        />
                    </v-layer>
                    <v-layer ref="palimpsest"></v-layer>
                </v-stage>
            </div>
        </div>
    </div>
</template>

<script>
let stage = null
let context = null

export default {
    props: {
        customBackground: {
            type: String,
            default: '/imgs/background_canvas.png'
        },
        stage: {
            type: String,
            default: 'manuscript'
        }
    },
    data() {
        return {
            stageSize: {
                width: 1000,
                height: 1000
            },
            circles: [],
            lines: [],
            isDrawing: false,
            canDraw: false,
            lastPointerPosition: { x: 0, y: 0 },
            brushConfig: {
                color: '#55DD33',
                size: 5
            },
            layers: {
                background: null,
                manuscript: null,
                palimpsest: null,
                config: {
                    position: 1,
                    name: 'background'
                }
            },
            canvasSize: {
                classes: ['full-size', 'medium-size', 'small-size'],
                index: 0
            },
            bubbleEnabled: true,
            timeout: null,
            toolbox: {
                step: 0,
                activeTool: null,
                scrappingKnife: {
                    highlighted: false,
                    used: false,
                    enabled: true
                },
                cuttingKnife: {
                    highlighted: false,
                    used: false,
                    enabled: false
                },
                powder: {
                    highlighted: false,
                    used: false,
                    enabled: false
                },
                lines: {
                    highlighted: false,
                    used: false,
                    connected: 0,
                    enabled: false
                },
                ink: {
                    highlighted: false,
                    used: false,
                    enabled: false
                }
            }
        }
    },
    watch: {
        'toolbox.step': 'unlockTools'
    },
    computed: {
        currentLayer() {
            return this.layers.config.name
        },
        guideStep() {
            return this.$store.state.guide.step
        }
    },
    mounted() {
        stage = this.$refs.stage.getNode()

        this.layers = {
            background: this.$refs.background.getNode(),
            manuscript: this.$refs.manuscript.getNode(),
            palimpsest: this.$refs.palimpsest.getNode()
        }

        let canvas = document.querySelectorAll('canvas')
        canvas = canvas[1]
        context = canvas.getContext('2d')

        this.fitStageToContainer()

        if (this.stage === 'palimpsest') {
            this.toolbox.step = 4
            this.toolbox.scrappingKnife.used = false
            this.toolbox.cuttingKnife.used = true
            this.toolbox.ink.used = false
            this.toolbox.powder.used = true
            this.toolbox.lines.used = true
        }

        window.addEventListener('resize', this.fitStageToContainer)

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
            this.highlight('lines')
        })
        this.$bus.$on('highlightInk', () => {
            this.highlight('ink')
        })
        this.$bus.$on('disableBubble', () => {
            this.disableBubble()
        })
    },
    methods: {
        disableBubble() {
            this.bubbleEnabled = false
            this.$bus.$emit('hide_bubble')
        },
        unlockTools() {
            switch (this.guideStep) {
                case 0:
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
                    this.toolbox.scrappingKnife.enabled = true
                    this.toolbox.cuttingKnife.enabled = false
                    this.toolbox.powder.enabled = false
                    this.toolbox.ink.enabled = true
                    break
                default:
                    this.toolbox.lines.enabled = false
                    this.toolbox.scrappingKnife.enabled = true
                    this.toolbox.cuttingKnife.enabled = false
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
            this.canDraw = false
            this.$bus.$emit('hide_bubble')
            this.unlockTools()
        },
        /**
         * Canvas, handle mouse down event, if user can draw, this will
         * start drawing.
         */
        handleMouseDown(e) {
            if (this.canDraw === true) {
                this.isDrawing = true
            }
            this.lastPointerPosition = stage.getPointerPosition()
        },
        /**
         * Make the canvas responsive.
         * It is based on container size and it will definitely
         * need some more love.
         */
        fitStageToContainer() {
            const container = this.$refs.container

            if (!container) {
                return
            }

            const height = container.offsetHeight
            const width = container.offsetWidth

            this.stageSize.width = width
            this.stageSize.height = height
        },
        /**
         * Handle mouse move, this is drawing event and all the drawing
         * stuff happens there.
         */
        handleMouseMove(e) {
            if (!this.isDrawing) {
                return
            }

            clearTimeout(this.timeout)

            context.globalCompositeOperation = 'source-over'
            context.strokeStyle = this.brushConfig.color
            context.lineWidth = this.brushConfig.size
            context.lineJoin = 'round'

            context.beginPath()

            let localPos = {
                x: this.lastPointerPosition.x,
                y: this.lastPointerPosition.y
            }

            context.moveTo(localPos.x, localPos.y)
            const pos = stage.getPointerPosition()
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
        /**
         * When we click outside or just leave the area,
         * the drawing should stop.
         */
        handleMouseUp(e) {
            if (this.canDraw && this.isDrawing && this.bubbleEnabled) {
                this.timeout = setTimeout(() => {
                    this.$bus.$emit('continue_with_story')
                }, 1500)
            }

            this.isDrawing = false
        },
        /**
         * Here we'll set colour for the ink brush.
         */
        drawWithInk() {
            if (!this.toolbox.ink.enabled) {
                return
            }

            this.toolbox.activeTool = 'ink'

            if (!this.toolbox.ink.used && this.stage === 'manuscript') {
                this.toolbox.ink.used = true
                this.$bus.$emit('editor_continueDialog', {
                    stage: 1,
                    step: 8,
                    timeout: 5000
                })
                this.toolbox.step++
            }

            if (!this.toolbox.ink.used && this.stage === 'palimpsest') {
                this.toolbox.ink.used = true
                this.$bus.$emit('editor_continueDialog', {
                    stage: 2,
                    step: 3,
                    timeout: 7000
                })
            }

            this.canDraw = true
            this.toolbox.ink.highlighted = false
            this.toolbox.ink.used = true

            this.brushConfig = {
                color: 'RGBA(0, 0, 0, .8)',
                size: 5
            }
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

            this.canDraw = true
            this.toolbox.scrappingKnife.highlighted = false
            this.toolbox.scrappingKnife.used = true

            this.brushConfig = {
                color: 'RGBA(220, 202, 167, 0.1)',
                size: 50
            }
        },
        /**
         * Powder is also done with brush.
         */
        powderContent() {
            if (!this.toolbox.powder.enabled) {
                return
            }

            this.toolbox.activeTool = 'powder'

            this.canDraw = true
            this.toolbox.powder.highlighted = false

            if (!this.toolbox.powder.used) {
                this.toolbox.powder.used = true
            }

            this.brushConfig = {
                color: 'RGBA(230, 217, 191, 0.1)',
                size: 100
            }
        },
        /**
         * This method will add dots on the canvas and prepare lines
         * which are connecting them. User is actually not drawing lines
         * but is moving with invisible circle, that is connected with line.
         *
         * There is much better method to draw lines in API, but there
         * was not enough time to implement it.
         */
        addLiningDots() {
            if (!this.toolbox.lines.enabled) {
                return
            }

            this.toolbox.activeTool = 'lines'

            this.canDraw = false
            this.toolbox.lines.highlighted = false
            const container = this.$refs.container

            if (!this.toolbox.lines.used) {
                this.toolbox.lines.used = true
            }

            this.circles = [
                {
                    x: 10,
                    y: 80,
                    width: 10,
                    height: 10,
                    fill: 'blue'
                },
                {
                    x: 10,
                    y: 80,
                    width: 70,
                    height: 70,
                    fill: 'transparent',
                    draggable: true,
                    dragBoundFunc(pos) {
                        return {
                            x: pos.x,
                            y: this.absolutePosition().y
                        }
                    }
                },
                {
                    x: container.offsetWidth - 200,
                    y: 80,
                    width: 10,
                    height: 10,
                    fill: 'blue'
                },
                // Dot group 2: 3
                {
                    x: 10,
                    y: 160,
                    width: 10,
                    height: 10,
                    fill: 'blue'
                },
                {
                    x: 10,
                    y: 160,
                    width: 70,
                    height: 70,
                    fill: 'transparent',
                    draggable: true,
                    dragBoundFunc(pos) {
                        return {
                            x: pos.x,
                            y: this.absolutePosition().y
                        }
                    }
                },
                {
                    x: container.offsetWidth - 200,
                    y: 160,
                    width: 10,
                    height: 10,
                    fill: 'blue'
                },
                // Dot group: index 6
                {
                    x: 10,
                    y: 240,
                    width: 10,
                    height: 10,
                    fill: 'blue'
                },
                {
                    x: 10,
                    y: 240,
                    width: 70,
                    height: 70,
                    fill: 'transparent',
                    draggable: true,
                    dragBoundFunc(pos) {
                        return {
                            x: pos.x,
                            y: this.absolutePosition().y
                        }
                    }
                },
                {
                    x: container.offsetWidth - 200,
                    y: 240,
                    width: 10,
                    height: 10,
                    fill: 'blue'
                }
            ]

            this.lines = [
                {
                    points: [
                        this.circles[0].x,
                        this.circles[0].y,
                        this.circles[1].x,
                        this.circles[1].y
                    ],
                    stroke: 'black',
                    strokeWidth: 1,
                    circleIndex: 1
                },
                {
                    points: [
                        this.circles[3].x,
                        this.circles[3].y,
                        this.circles[4].x,
                        this.circles[4].y
                    ],
                    stroke: 'black',
                    strokeWidth: 1,
                    circleIndex: 4
                },
                {
                    points: [
                        this.circles[6].x,
                        this.circles[6].y,
                        this.circles[7].x,
                        this.circles[7].y
                    ],
                    stroke: 'black',
                    strokeWidth: 1,
                    circleIndex: 7
                }
            ]
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
                this.circles[index - 1].x,
                this.circles[index - 1].y,
                this.$refs.circle[index].getNode().getX() + 35,
                this.circles[index - 1].y
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
                    if (group.getX() > 10) {
                        target.draggable(false)
                        this.toolbox.lines.connected++

                        if (this.toolbox.lines.connected === 3) {
                            this.toolbox.lines.enabled = false
                            this.timeout = setTimeout(() => {
                                this.$bus.$emit('continue_with_story')
                            }, 1000)
                        }
                    }
                    group.fill('red')
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

            clearTimeout(this.timeout)
            this.$bus.$emit('editor_continueDialog', {
                stage: 1,
                step: 4,
                disableTimeout: true
            })

            this.toolbox.cuttingKnife.used = true

            this.timeout = setTimeout(() => {
                this.$bus.$emit('continue_with_story')
            }, 1000)

            this.canvasSize.index =
                this.canvasSize.index < this.canvasSize.classes.length - 1
                    ? this.canvasSize.index + 1
                    : 0
        },
        /**
         * Check whether objects colided.
         */
        haveIntersection(r1, r2) {
            return !(
                r2.x > r1.x + r1.width ||
                r2.x + r2.width < r1.x ||
                r2.y > r1.y + r1.height ||
                r2.y + r2.height < r1.y
            )
        }
    }
}
</script>

<style>
#konva-container {
    box-sizing: border-box;
    border: 1px solid black;
    margin: 0 auto;
    overflow: hidden;
    background: no-repeat center;
}
.full-size {
    width: 100%;
    height: 60vh;
}
.medium-size {
    width: 80%;
    height: 60vh;
}
.small-size {
    width: 60%;
    height: 60vh;
}
.table {
    background: url('/imgs/background_table.png') no-repeat center -30px;
    background-clip: border-box;
    background-size: cover;
    width: 100%;
    height: 100%;
    padding: 3em 3em;
}
.toolbox-wrapper {
    padding: 0px 1.5em 0 0;
    text-align: center;
}
.button-box {
    background: url('/imgs/background_tool.png') no-repeat 0 0;
    border: none;
    width: 150px;
    height: 238px;
    outline: none;
    display: inline-block;
    margin-right: -23px;
    position: relative;
    padding-top: 195px;
    color: white;
}
.button-box-right {
    background: url('/imgs/background_tool-right.png') no-repeat 0 0;
}
.higlighted {
    background-position-x: -150px;
}
.tool-disabled::before {
    opacity: 0.2;
}
.cutting-knife::before {
    content: ' ';
    display: block;
    width: 126px;
    height: 100px;
    position: absolute;
    margin-left: 10px;
    top: 100px;
    background: url('/imgs/tools.png') no-repeat 0 -100px;
}
.scrapping-knife::before {
    content: ' ';
    display: block;
    width: 126px;
    height: 100px;
    position: absolute;
    margin-left: 10px;
    top: 100px;
    background: url('/imgs/tools.png') no-repeat 0 0;
}
.powder::before {
    content: ' ';
    display: block;
    width: 126px;
    height: 100px;
    position: absolute;
    margin-left: 10px;
    top: 100px;
    background: url('/imgs/tools.png') no-repeat 0 -200px;
}
.ruler::before {
    content: ' ';
    display: block;
    width: 126px;
    height: 100px;
    position: absolute;
    margin-left: 10px;
    top: 120px;
    background: url('/imgs/tools.png') no-repeat 0 -300px;
}
.ink::before {
    content: ' ';
    display: block;
    width: 126px;
    height: 100px;
    position: absolute;
    margin-left: 10px;
    top: 100px;
    background: url('/imgs/tools.png') no-repeat 0 -400px;
}
.active-tool {
    background-position-x: -300px;
}
</style>
