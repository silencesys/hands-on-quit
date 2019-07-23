<template>
    <div v-if="visible" class="guide-content-wrapper star">
        <div v-if="guideStep === 18 || guideStep === 12" class="star-wrapper">
            <img
                v-for="(star, index) in starCount"
                :key="index"
                src="/imgs/star.png"
                class="star-image"
            />
        </div>
        <div class="guide-wrapper">
            <div class="guide-comment">
                <img :src="getAvatar" alt="guide_avatar" />
                <div class="comment">
                    <slot />
                </div>
            </div>
            <button class="button" @click="continueGuide">
                {{ continueText }}
            </button>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
    data() {
        return {
            events: {
                3: 'highlightScrappingKnife',
                5: 'highlightCroppingKnife',
                7: 'highlightPowder',
                9: 'highlightRuler',
                11: 'highlightInk',
                14: 'resetTheEditor',
                17: 'hide_bubble',
                19: 'disableBubble'
            },
            visible: true
        }
    },
    computed: {
        guideStep() {
            return this.$store.state.guide.step
        },
        starCount() {
            return this.$store.state.guide.starCount
        },
        guideStage() {
            return this.$store.state.guide.stage
        },
        getAvatar() {
            return this.$store.state.guide.avatarUrl
        },
        continueText() {
            if (this.guideStep > 17) {
                return this.$t('button_continue_freely')
            }

            return this.$t('button_continue')
        }
    },
    created() {
        this.$bus.$on('hide_bubble', () => {
            this.hideBubble()
        })
        this.$bus.$on('show_bubble', () => {
            this.showBubble()
        })
        this.$bus.$on('continue_with_story', () => {
            this.continueGuide()
        })
    },
    methods: {
        ...mapMutations({
            updateStep: 'guide/updateStep',
            updateStage: 'guide/updateStage',
            updateStarCount: 'guide/addStar'
        }),
        continueGuide() {
            this.showBubble()
            const step = this.guideStep + 1
            const callback =
                this.events[step] !== undefined ? this.events[step] : undefined

            if (step === 11 || step === 17) {
                this.updateStarCount()
            }

            if (callback !== undefined) {
                this.fireEvent(callback)
                this.updateStep(step)
            } else {
                this.updateStep(step)
            }
        },
        fireEvent(eventName) {
            this.$bus.$emit(eventName, {})
        },
        hideBubble() {
            this.visible = false
        },
        showBubble() {
            this.visible = true
        }
    }
}
</script>
