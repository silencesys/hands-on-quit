export default {
    mode: 'spa',
    /*
     ** Headers of the page
     */
    head: {
        title: 'The Creative Scriptorium',
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                hid: 'description',
                name: 'description',
                content: process.env.npm_package_description || ''
            }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },
    globalName: 'The Creative Scriptorium',
    /*
     ** Customize the progress-bar color
     */
    loading: { color: '#fff' },
    /*
     ** Global CSS
     */
    css: ['@assets/app.css'],
    /*
     ** Plugins to load before mounting the App
     */
    plugins: [
        '~/plugins/Konva.js',
        '~/plugins/i18n.js',
        '~/plugins/EventBus.js',
        '~/plugins/FontAwesome.js'
    ],
    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios',
        '@nuxtjs/pwa',
        '@nuxtjs/eslint-module'
    ],
    /*
     ** Axios module configuration
     ** See https://axios.nuxtjs.org/options
     */
    axios: {},
    /*
     ** Build configuration
     */
    build: {
        /*
         ** You can extend webpack config here
         */
        extend(config, ctx) {}
    }
}
