import Vue from 'vue'
import ContextMenu from './ContextMenu.vue'

export default {
  install (vue, options) {
    const root = new Vue({
        data: { targets: {} },
        render: h => h(ContextMenu)
    })

    root.$mount(document.body.appendChild(document.createElement('div')))

    // Register Vue event handlers on root instance
    root.$on('create', function () {

    })
    const open = (e, items) => {
      e.preventDefault()
      let { clientX: x, clientY: y } = e
      root.$emit(`contextmenu`, { items, x, y })
    }

    vue.prototype.$context = { root, open }
    
    vue.directive('context', {
      bind(el, binding) {
        root.$set(root.targets, binding.value, {
          id: binding.value,
          getRect: () => el.getBoundingClientRect(),
        })
        el.addEventListener('contextmenu', e => open(e, binding.value))
      }
    })
  }
}
