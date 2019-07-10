<template>
    <div>
        <button
            @click="eraseContent"
            :class="{ higlighted: highlighted.knife }"
        >
            Scrapping knife
        </button>
        <button @click="powderContent">Powder</button>
        <button @click="addLiningDots">Add lines</button>
        <button @click="drawWithInk">Ink</button>

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
            canDrawing: false,
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
            },
            highlighted: {
                knife: false
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
        this.$bus.$on('editor_higlightTool', (eventData) => {
            this.highlight(eventData)
        })
    },
    methods: {
        highlight(eventData) {
            this.highlighted[eventData] = true
        },
        handleMouseDown(e) {
            if (this.canDrawing === true) {
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
            this.canDrawing = true
            this.brushConfig = {
                color: 'RGBA(0, 0, 0, .8)',
                size: 5
            }
        },
        eraseContent() {
            this.canDrawing = true
            this.highlighted.knife = false

            this.brushConfig = {
                color: 'RGBA(217, 170, 98, 0.1)',
                size: 50
            }
        },
        powderContent() {
            this.canDrawing = true
            this.brushConfig = {
                color: 'RGBA(240, 194, 125, 0.1)',
                size: 100
            }
        },
        addLiningDots() {
            this.canDrawing = false
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
    height: 60vh;
    box-sizing: border-box;
}
.higlighted {
    background: red;
}
</style>
