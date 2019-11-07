<template lang="pug">
  .TimetableSelector(@contextmenu.prevent)
    .left
      .term Term {{ term.substr(2, 3) }}
    .right
      .button.button-clear(:disabled="selected == 0" @click="selected = 0" v-context="menu(0)") table 1
      .button.button-clear(:disabled="selected == 1" @click="selected = 1" v-context="menu(1)") table 2
      .button.button-clear(:disabled="selected == 2" @click="selected = 2" v-context="menu(2)") table 3
</template>

<script>
import Vue from 'vue'
import Lockr from 'lockr'

export default {
  name: 'TimetableSelector',
  computed: {
    term () {
      return this.$store.state.selected.term
    },
    selected: {
      get () { return this.$store.state.selected.table },
      set (i) { this.$store.dispatch('selectTable', i) }
    },
  },
  methods: {
    menu (id) {
      return () => [
        {
          text: 'Select',
          disabled: id == this.selected,
          action: () => {
            this.selected = id
          }
        },
        '------------------------------------------------',
        {
          text: 'Copy',
          disabled: this.isEmpty(id),
          action: () => {
            this.$store.dispatch('copyTable', id)
          }  
        },
        {
          text: 'Paste',
          disabled: !this.canPaste(id),
          action: () => {
            const clipboard = Lockr.get('clipboard')
            if (clipboard.type === 'table')
              this.$store.dispatch('pasteTable', id)
            else if (clipboard.type === 'course')
              this.$store.dispatch('pasteCourse', id)
            else {
              console.error(`Error: "${clipboard.type}" is not a recognized type.`)
              console.warn(`Clipboard has been flushed out.`)
              Lockr.set('clipboard')
            }
          }
        },
        {
          text: 'Clear',
          disabled: this.isEmpty(id),
          action: () => {
            this.$store.dispatch('clearTable', id)
          }
        },
        '------------------------------------------------',
        {
          text: 'Save as image',
          disabled: id != this.selected,
          action: () => this.$emit('save')
        },
        {
          text: 'Print...',
          disabled: id != this.selected,
          action: window.print
        },
        { text: 'Share...', disabled: true },
      ]
    },
    isEmpty (i) {
      const tables = Lockr.get('tables') || []
      const table = tables.find(table => table.id == `${this.term}${i}`)
      return !table || table.content.length == 0
    },
    canPaste () {
      const clipboard = Lockr.get('clipboard')
      return clipboard && clipboard.term === this.term
    },
  }
}
</script>

<style lang="sass" scoped>
@import '@/_Color.sass'
.TimetableSelector
  display: flex
  align-items: center
  justify-content: space-between
  .left
    margin-left: -1.2rem
  .right
    align-items: flex-end
    margin-right: -1.2rem
    text-align: right
  .button
    padding: 0
    margin: 0 1rem 0 2.2rem
  .term
    color: $color-primary
    padding-left: 1rem
    font-size: 1.6rem
    font-weight: 700
    letter-spacing: 0.1rem
    text-transform: uppercase
    margin-bottom: 1.0rem
</style>
