import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

library.add(faGithub)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false
