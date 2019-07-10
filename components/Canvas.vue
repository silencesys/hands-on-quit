<template>
    <div>
        <button @click="drawWithInk">Ink</button>
        <button @click="eraseContent">Eraser</button>
        <button @click="addLiningDots">Add dots</button>

        <div id="konva-container" ref="container">
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
                <v-layer ref="background">
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
                <v-layer ref="manuscript"></v-layer>
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
            lastPointerPosition: { x: 0, y: 0 },
            brushConfig: {
                color: '#55DD33',
                size: 5
            },
            layers: {
                background: null,
                manuscript: null,
                palimpsest: null
            },
            layerConfig: {
                position: 1,
                name: 'background'
            }
        }
    },
    computed: {
        currentLayer() {
            return this.layerConfig.name
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
    },
    methods: {
        handleMouseDown(e) {
            // this.isDrawing = true
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
        pickLayer() {
            let canvas = document.querySelectorAll('canvas')
            canvas = canvas[2]
            context = canvas.getContext('2d')
        },
        drawWithInk() {
            this.isDrawing = true
            this.brushConfig = {
                color: 'RGBA(0, 0, 0, .8)',
                size: 5
            }
        },
        eraseContent() {
            this.isDrawing = true
            this.brushConfig = {
                color: 'RGBA(255, 255, 255, 0.1)',
                size: 50
            }
        },
        addLiningDots() {
            this.isDrawing = false
            const container = this.$refs.container

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
                    strokeWidth: 3,
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
                    strokeWidth: 3,
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
                    strokeWidth: 3,
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

            this.$refs.background.getNode().children.each((group) => {
                if (group === target) {
                    return
                }
                if (this.haveIntersection(group.getClientRect(), targetRect)) {
                    if (group.getX() > 10) {
                        target.draggable(false)
                    }
                    group.fill('red')
                }
            })

            this.layers.background.draw()
            this.layers.manuscript.draw()
            this.layers.palimpsest.draw()
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
    width: 100%;
    height: 500px;
    box-sizing: border-box;
}
</style>
