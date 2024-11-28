export const state = () => ({
    locales: ['en', 'cs'],
    locale: 'cs'
})

export const mutations = {
    SET_LANG(state, locale) {
        if (state.locales.indexOf(locale) !== -1) {
            state.locale = locale
        }
    }
}
