<template>
    <div class="container">
        <guide-bubble>
            <p
                v-html="
                    $t('guide_messages.stage_' + guideStage + '_' + guideStep)
                "
            />
        </guide-bubble>
        <div />
        <konva-canvas
            :key="canvas.key"
            :custom-background="canvas.background"
            :stage-name="canvas.key"
            class="empty-margin"
        />
    </div>
</template>

<script>
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
            canvas: {
                key: 'manuscript',
                stageName: 'manuscript',
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
        this.$bus.$on('resetTheEditor', () => {
            this.changeEditor()
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
            this.$bus.$emit('hide_bubble')
        }
    }
}
</script>
