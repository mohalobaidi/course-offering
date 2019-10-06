import Vue from 'vue'
import Components from '../../components'
import Main from './Main.vue'

Vue.use(Components)

const app = new Vue({
  el: '#app',
  render: h => h(Main)
})