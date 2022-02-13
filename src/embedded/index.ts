import { createApp } from 'vue'
import { createPinia } from "pinia"
import Toast from "vue-toastification"
import GlobalComponents from '../components'
import Main from "./Main.vue"
import '../assets/main.scss'

// Create wrapper
const wrapper = document.createElement('div')
wrapper.classList.add('wrapper')

// Create #app div inside wrapper
wrapper.innerHTML = '<div id="app"></div>'

// Target space on KFUPM Course Offering webpage.
const parent = document.querySelector('.inner-page-section')

if (parent == null) {
    throw new Error('Cannot find target element to inject in.')
}

//Remove all children of parent
parent.innerHTML = ''

// Append wrapper on webpage
parent.prepend(wrapper)

const pinia = createPinia()

// Mount vue app and init
createApp(Main)
    .use(pinia)
    .use(Toast)
    .use(GlobalComponents)
    .mount('#app')