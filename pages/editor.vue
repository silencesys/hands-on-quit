<template>
    <div class="container">
        <guide-bubble>
            <p
                v-html="
                    $t('guide_messages.stage_' + guide.stage + '_' + guide.step)
                "
            ></p>
        </guide-bubble>
        <div></div>
        <konva-canvas />
    </div>
</template>

<script>
import { setTimeout, clearTimeout } from 'timers'
import KonvaCanvas from '~/components/Canvas.vue'
import GuideBubble from '~/components/Bubble.vue'

export default {
    data() {
        return {
            guide: {
                stage: 1,
                step: 1,
                timeout: null,
                timeoutTime: 10000
            }
        }
    },
    methods: {
        continueGuideDialog(data) {
            clearTimeout(this.timeout)
            const timeout = data.timeout !== undefined ? data.timeout : 3000

            if (!data.disableTimeout) {
                this.timeout = setTimeout(() => {
                    this.guide.step = data.step
                    this.guide.stage = data.stage

                    if (data.highlightTool !== undefined) {
                        this.$bus.$emit(
                            'editor_higlightTool',
                            data.highlightTool
                        )
                    }
                }, timeout)
            } else {
                this.guide.step = data.step
                this.guide.stage = data.stage

                if (data.highlightTool !== undefined) {
                    this.$bus.$emit('editor_higlightTool', data.highlightTool)
                }
            }
        }
    },
    components: {
        KonvaCanvas,
        GuideBubble
    },
    created() {
        this.timeout = setTimeout(() => {
            this.guide.step = 2
            this.$bus.$emit('editor_higlightTool', 'scrappingKnife')
        }, 3000)

        this.$bus.$on('editor_continueDialog', (eventData) => {
            this.continueGuideDialog(eventData)
        })
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
</style>
