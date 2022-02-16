console.log('test')
import { createApp } from 'vue'
import { createPinia } from "pinia"
import piniaPersist from 'pinia-plugin-persist'
import Toast from "vue-toastification"
import GlobalComponents from '../components'
import Main from "./Main.vue"
import '../assets/main.scss'
import browser from 'webextension-polyfill'

// Create wrapper
const wrapper = document.createElement('div')
wrapper.classList.add('wrapper')

// Create #app div inside wrapper
wrapper.innerHTML = '<div id="app"></div>'

const port = browser.runtime.connect('bbickcmmdidmobmmbgiaedkffokgdhaj', { name: 'course-offering'})
port.postMessage({
    type: 'fetchCourseOffering'
})

const init = () => {
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
    pinia.use(piniaPersist)

    // Mount vue app and init
    createApp(Main)
        .use(pinia)
        .use(Toast)
        .use(GlobalComponents)
        .mount('#app')
}

const observer = new MutationObserver(mutations => {
    const isParentLoaded = mutations.some(mutation => {
      if (!mutation.addedNodes) return false
      return [...mutation.addedNodes as unknown as Array<Node>].some(node => {
        return node?.classList?.value === 'inner-page-section'
      })
    })

    if (!isParentLoaded) return
    observer.disconnect()
    init()
})

if (document.querySelector('.inner-page-section')) {
    init()
} else {
    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    })
}
