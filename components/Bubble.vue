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

<style>
.guide-content-wrapper {
    width: 100%;
    height: 100%;
    background: RGBA(56, 34, 47, 0.8);
    position: fixed;
    padding-top: 30vh;
    z-index: 9998;
}
.guide-wrapper {
    display: block;
    max-width: 800px;
    position: absolute;
    z-index: 9999;
    position: relative;
}
.guide-comment {
    display: grid;
    grid-template-columns: 150px auto;
    grid-column-gap: 20px;
    grid-template-rows: 1fr;
    grid-template-areas: '. .';
    position: relative;
    width: 100%;
}
img {
    border: 3px solid black;
    box-sizing: border-box;
}
.comment {
    border: 3px solid black;
    border-radius: 5px;
    padding: 2em;
    box-sizing: border-box;
    background: #d6c49f;
}
.star-wrapper {
    text-align: center;
    margin-top: -10vh;
    margin-bottom: 5vh;
    max-width: 800px;
}
.star-image {
    border: none;
    margin-right: 50px;
}
.star-image:last-of-type {
    margin-right: 0;
}
</style>
