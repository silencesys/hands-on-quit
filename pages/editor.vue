<template>
    <div class="container">
        <guide-bubble>
            <p
                v-html="
                    $t('guide_messages.stage_' + guideStage + '_' + guideStep)
                "
            />
            <p
                @click="pushDialogByStep"
                class="button"
                v-if="guideStep === 8 || (guideStage === 2 && guideStep === 1)"
            >
                {{ $t('button_continue') }}
            </p>
            <p
                v-if="guideStep === 9 && canvas.showContinueToEditor"
                @click="changeEditor"
                class="button"
            >
                {{ $t('button_continue') }}
            </p>
        </guide-bubble>
        <div />
        <konva-canvas
            :key="canvas.key"
            :customBackground="canvas.background"
            :stage="canvas.key"
            class="empty-margin"
        />
    </div>
</template>

<script>
import { setTimeout, clearTimeout } from 'timers'
import { mapMutations } from 'vuex'
import KonvaCanvas from '~/components/Canvas.vue'
import GuideBubble from '~/components/Bubble.vue'

export default {
    components: {
        KonvaCanvas,
        GuideBubble
    },
    data() {
        return {
            guide: {
                timeout: null,
                timeoutTime: 10000
            },
            canvas: {
                key: 'manuscript',
                background: '/imgs/background_canvas.png',
                showContinueToEditor: true
            }
        }
    },
    computed: {
        guideStep() {
            return this.$store.state.guide.step
        },
        guideStage() {
            return this.$store.state.guide.stage
        }
    },
    created() {
        this.timeout = setTimeout(() => {
            this.updateStep(2)
            this.$bus.$emit('editor_higlightTool', 'scrappingKnife')
        }, 3000)

        this.$bus.$on('editor_continueDialog', (eventData) => {
            this.continueGuideDialog(eventData)
        })
    },
    methods: {
        ...mapMutations({
            updateStep: 'guide/updateStep',
            updateStage: 'guide/updateStage'
        }),
        changeEditor() {
            this.canvas = {
                key: 'palimpsest',
                background: '/imgs/background_palimpsest.png',
                showContinueToEditor: false
            }
        },
        pushDialogByStep() {
            this.continueGuideDialog({
                step: this.guideStep + 1,
                stage: this.guideStage,
                disableTimeout: true
            })
        },
        continueGuideDialog(data) {
            clearTimeout(this.timeout)
            const timeout = data.timeout !== undefined ? data.timeout : 3000

            if (!data.disableTimeout) {
                this.timeout = setTimeout(() => {
                    this.updateStep(data.step)
                    this.updateStage(data.stage)

                    if (data.highlightTool !== undefined) {
                        this.$bus.$emit(
                            'editor_higlightTool',
                            data.highlightTool
                        )
                    }
                }, timeout)
            } else {
                this.updateStep(data.step)
                this.updateStage(data.stage)

                if (data.highlightTool !== undefined) {
                    this.$bus.$emit('editor_higlightTool', data.highlightTool)
                }
            }
        }
    }
}
</script>

<style>
.container {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}
.button {
    background: #b04130;
    border-radius: 8px;
    margin-top: 10px;
    color: #fff;
    padding: 0.5em;
    display: inline-block;
    cursor: pointer;
}
.empty-margin {
    margin-top: 70px;
}
</style>
