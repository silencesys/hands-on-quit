export const state = () => ({
    stage: 1,
    step: 1,
    enable_continue: false,
    avatarUrl: '/imgs/avatar_mouse.png'
})

export const mutations = {
    updateStep(state, step, fireEvent = undefined, eventData = {}) {
        state.step = step
    },
    updateStage(state, stage, fireEvent = undefined, eventData = {}) {
        state.stage = stage
    },
    enableContinue(state, enable) {
        state.enableContinue = enable
    },
    setGuide(state, avatarUri) {
        state.avatarUrl = avatarUri
    }
}
