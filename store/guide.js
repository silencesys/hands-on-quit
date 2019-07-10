export const state = () => ({
    stage: 1,
    step: 1,
    enable_continue: false
})

export const mutations = {
    updateStep(state, step) {
        state.step = step
    },
    updateStage(state, stage) {
        state.stage = stage
    },
    enableContinue(state, enable) {
        state.enableContinue = enable
    }
}
