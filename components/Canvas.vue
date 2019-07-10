<template>
    <div>
        <button
            @click="eraseContent"
            :class="{ higlighted: toolbox.scrappingKnife.highlighted }"
        >
            {{ $t('tools.scrapping_knife') }}
        </button>
        <button
            @click="resizeCanvas"
            :class="{ higlighted: toolbox.cuttingKnife.highlighted }"
        >
            {{ $t('tools.cutting_knife') }}
        </button>
        <button
            @click="powderContent"
            :class="{ higlighted: toolbox.powder.highlighted }"
        >
            {{ $t('tools.powder') }}
        </button>
        <button
            @click="addLiningDots"
            :class="{ higlighted: toolbox.lines.highlighted }"
        >
            {{ $t('tools.add_lines') }}
        </button>
        <button
            @click="drawWithInk"
            :class="[{ higlighted: toolbox.ink.highlighted }, 'button-ink']"
        >
            {{ $t('tools.ink') }}
        </button>

        <div
            id="konva-container"
            :class="canvasSize.classes[canvasSize.index]"
            ref="container"
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
</template>

<script>
let stage = null
let context = null

export default {
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
            timeout: null,
            toolbox: {
                scrappingKnife: {
                    highlighted: false,
                    used: false,
                    enabled: false
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
    computed: {
        currentLayer() {
            return this.layers.config.name
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

        window.addEventListener('resize', this.fitStageToContainer)
        this.$bus.$on('editor_higlightTool', (eventData) => {
            this.highlight(eventData)
        })
    },
    methods: {
        highlight(eventData) {
            this.toolbox[eventData].highlighted = true
        },
        handleMouseDown(e) {
            if (this.canDraw === true) {
                this.isDrawing = true
            }
            this.lastPointerPosition = stage.getPointerPosition()
        },
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
        handleMouseMove(e) {
            if (!this.isDrawing) {
                return
            }

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
        handleMouseUp(e) {
            this.isDrawing = false
        },
        drawWithInk() {
            this.canDraw = true
            this.toolbox.ink.highlighted = false
            this.toolbox.ink.used = true

            this.brushConfig = {
                color: 'RGBA(0, 0, 0, .8)',
                size: 5
            }
        },
        eraseContent() {
            this.canDraw = true
            this.toolbox.scrappingKnife.highlighted = false

            if (!this.toolbox.scrappingKnife.used) {
                this.toolbox.scrappingKnife.used = true
                this.$bus.$emit('editor_continueDialog', {
                    stage: 1,
                    step: 3,
                    highlightTool: 'cuttingKnife'
                })
            }

            this.brushConfig = {
                color: 'RGBA(217, 170, 98, 0.1)',
                size: 50
            }
        },
        powderContent() {
            this.canDraw = true
            this.toolbox.powder.highlighted = false

            if (!this.toolbox.powder.used) {
                this.toolbox.powder.used = true
                this.$bus.$emit('editor_continueDialog', {
                    stage: 1,
                    step: 6,
                    highlightTool: 'lines'
                })
            }

            this.brushConfig = {
                color: 'RGBA(240, 194, 125, 0.1)',
                size: 100
            }
        },
        addLiningDots() {
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
        adjustLines(e, index) {
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

                            this.$bus.$emit('editor_continueDialog', {
                                stage: 1,
                                step: 7,
                                highlightTool: 'ink'
                            })
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
        resizeCanvas() {
            this.toolbox.cuttingKnife.highlighted = false
            clearTimeout(this.timeout)

            if (!this.toolbox.cuttingKnife.used) {
                this.$bus.$emit('editor_continueDialog', {
                    stage: 1,
                    step: 4,
                    disableTimeout: true
                })

                this.timeout = setTimeout(() => {
                    this.toolbox.cuttingKnife.used = true
                    this.$bus.$emit('editor_continueDialog', {
                        stage: 1,
                        step: 5,
                        highlightTool: 'powder',
                        disableTimeout: true
                    })
                }, 3000)
            }

            this.canvasSize.index =
                this.canvasSize.index < this.canvasSize.classes.length - 1
                    ? this.canvasSize.index + 1
                    : 0
        },
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
.higlighted {
    background: red;
}
</style>
