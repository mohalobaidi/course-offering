<template lang="pug">
  #ContextMenu
   .list(v-if="menu" :style="{top: `${menu.y}px`,left: `${menu.x}px`,transform: `translateX(-${offset}%)`}")
    .item(
      v-for="(item, i) in menu.items"
      :key="i"
      v-text="item.text"
      :class="{hr: !item.text && item.text !== 0, disabled: item.disabled}"
      @click="dispatch($event, item.action)")
</template>

<style lang="sass" scoped>
@import '@/_Color.sass'
#ContextMenu .list
  cursor: pointer
  min-width: 15rem
  outline: 0
  margin: 0
  padding: 4px 0 5px
  border-radius: 7px
  font-family: -apple-system, Lucida Grande !important
  font-size: 1.4rem
  line-height: 1.5rem
  border-width: 1px
  border-style: solid
  min-width: 160px
  position: fixed
  z-index: 1000
  .item
    user-select: none
    white-space: nowrap
    margin: 0
    padding: 0
    list-style: none
    text-align: left
    padding: .4rem 1.8rem
    &.disabled
      pointer-events: none
      opacity: .56
    &:hover
      color: #fff
      background: #4195fa
  .hr
    border: none
    height: .1rem
    margin: .4rem 0
    padding: 0
</style>

<style lang="sass" theme="light">
#ContextMenu .list
  background-color: rgba(#f0f0f0, .95)
  box-shadow: 0 4px 12px rgba(black, .2)
  border-color: #c0c0c0
  color: black
  .hr
    background: #d5d5d5
</style>

<style lang="sass" theme="dark">
#ContextMenu .list
  background-color: rgba(#484848, .95)
  box-shadow: 0 8px 16px rgba(black, .5)
  border-color: #545454
  color: white
  .hr
    background: #646464
</style>



<script>
export default {
  data () {
    return {
      counter: 0,
      menu: null,
      _menu: null
    }
  },
  computed: {
    offset () {
      if (this.menu)
        return Math.max(0, (this.menu.x - window.innerWidth * .8) / window.innerWidth * 100) * 5
    }
  },
  methods: {
    documentContextMenu (e) {
      if (e.path.some(({ id }) => id === 'ContextMenu')) {
        e.preventDefault()
        return false
      }
      if (!this._menu || this.menu !== this._menu)
        this.menu = this._menu
      this._menu = null
    },
    documentClick (e) {
      this.menu = this._menu = null
    },
    contextmenu (menu) {
      if (typeof menu.items === "function")
        menu.items = menu.items()
      this._menu = menu
    },
    dispatch (e, action) {
      if (action) action(e)
    }
  },
  mounted () {
    document.addEventListener('contextmenu', this.documentContextMenu)
    document.addEventListener('click', this.documentClick)
    window.addEventListener('scroll', this.documentClick)
    window.addEventListener('resize', this.documentClick)
    this.$root.$on('contextmenu', this.contextmenu)
  },
  beforeDestroy () {
    document.removeEventListener('contextmenu', this.documentContextMenu)
    document.removeEventListener('click', this.documentClick)
    window.removeEventListener('scroll', this.documentClick)
    window.removeEventListener('resize', this.documentClick)
    this.$root.$off('contextmenu')
  }
};
</script> 