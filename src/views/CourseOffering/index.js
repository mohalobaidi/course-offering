import Vue from 'vue'
import store from '../../store'
import ContextMenu from '../../plugins/ContextMenu'
import GlobalComponents from '../../components'
import Components from './components'
import Main from './Main.vue'
import Settings from './Settings.vue'


Vue.use(ContextMenu)
Vue.use(GlobalComponents)
Vue.use(Components)

const app = new Vue({
  el: '#app',
  store,
  render: h => h(Main)
})

const settings = new Vue({
  el: '#settings',
  store,
  render: h => h(Settings)
})