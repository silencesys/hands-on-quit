<template>
    <div class="container">
        <guide-bubble>
            <p
                v-html="
                    $t('guide_messages.stage_' + guide.stage + '_' + guide.step)
                "
            />
            <nuxt-link
                :to="{ name: 'intermezzo' }"
                v-if="guide.enable_continue"
            >
                {{ $t('continue') }}
            </nuxt-link>
        </guide-bubble>
        <div />
        <konva-canvas />
    </div>
</template>

<script>
import { setTimeout, clearTimeout } from 'timers'
import { mapState } from 'vuex'
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
                stage: 1,
                step: 1,
                enable_continue: false,
                timeout: null,
                timeoutTime: 10000
            }
        }
    },
    computed: {
        ...mapState({
            step: (state) => state.step,
            stage: (state) => state.stage
        })
    },
    created() {
        this.timeout = setTimeout(() => {
            this.guide.step = 2
            this.$bus.$emit('editor_higlightTool', 'scrappingKnife')
        }, 3000)

        this.$bus.$on('editor_continueDialog', (eventData) => {
            this.continueGuideDialog(eventData)
        })
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
