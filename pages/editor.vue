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
            :customBackground="canvas.background"
            :stage="canvas.key"
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
                background: '/imgs/background_canvas.png',
                showContinueToEditor: true
            }
        }
    },
    created() {
        this.$bus.$on('resetTheEditor', () => {
            this.changeEditor()
        })
    },
    computed: {
        guideStep() {
            return this.$store.state.guide.step
        },
        guideStage() {
            return this.$store.state.guide.stage
        }
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
    padding: 0.75em;
    display: inline-block;
    outline: none;
    cursor: pointer;
    border: none;
}
</style>
