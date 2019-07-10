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
import { setTimeout } from 'timers'
import KonvaCanvas from '~/components/Canvas.vue'
import GuideBubble from '~/components/Bubble.vue'

export default {
    data() {
        return {
            guide: {
                stage: 1,
                step: 1
            }
        }
    },
    components: {
        KonvaCanvas,
        GuideBubble
    },
    created() {
        setTimeout(() => {
            this.guide.step = 2
            this.$bus.$emit('editor_higlightTool', 'scrappingKnife')
        }, 5000)
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
