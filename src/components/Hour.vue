<template lang="pug">
  .Hour(
    :class="{isPlaceholder}"
    :style="{'--start': startPixel, '--end': endPixel, '--day': dayNumber}"
    @mouseover="$emit('mouseover')"
    @mouseout="$emit('mouseout')"
    @contextmenu.prevent="$emit('contextmenu', $event)")
    .wrapper(:style="{'--color': color}")
      .title {{title}}
      .instructor {{ instructor }}
      .time
        span.start {{ start }}
        span.end {{ end }}
        span.remove(@click="remove") ×
</template>

<script>
import Vue from 'vue'
import Lockr from 'lockr'

export default {
  name: 'Hour',
  props: ['title', 'instructor', 'day', 'time', 'color', 'crn', 'isPlaceholder'],
  computed: {
    start: function () { return this.time.split('-')[0] },
    end: function () { return this.time.split('-')[1] },
    startPixel: function () { return this.timeToPixel(this.start) },
    endPixel: function () { return this.timeToPixel(this.end) },
    dayNumber: function () { return this.dayToNumber(this.day) }
  },
  methods: {
    timeToPixel (hour) {
      const h = (hour / 100) | 0
      const m = hour % 100
      return (h + (m / 60)) * 100
    },
    dayToNumber (day) {
      switch (day) {
        case 'U': return 1
        case 'M': return 2
        case 'T': return 3
        case 'W': return 4
        case 'R': return 5
      }
    },
    remove () {
      this.$store.dispatch('removeCourse', this.crn)
    }
  }
}
</script>

<style lang="sass" scoped>
.Hour
  --color: #848484
  --duration: calc((var(--end) - var(--start)) / 100)
  grid-column: var(--day)
  position: absolute
  transform: translateY(calc((var(--start) - var(--from)) * 1% / var(--duration)))
  height: calc(100% * var(--duration) / 11)
  width: calc(100% / (1 + var(--cols) - var(--day)))
  top: 0
  left: 0
  &.isPlaceholder
    opacity: .7
  .wrapper
    width: calc(100% - 7px)
    height: calc(100% - 6px)
    margin: 3px 3px
    color: white
    font-size: 1.2rem
    display: grid
    position: relative
    grid-template-columns: 1fr min-content
    grid-template-rows: min-content 1fr
    padding: 2px 6px 2px 8px
    box-sizing: border-box
    border-radius: 2px
    background-color: var(--color)
    overflow-y: auto
    box-shadow: 0 1px 4px rgba(0, 0, 0, .2)
    transition: width .1s ease-in-out, height .1s ease-in-out, margin .1s ease-in-out, padding .1s ease-in-out
  .title
    grid-row: 1
    grid-column: 1
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
  .instructor
    grid-row: 2
    grid-column: 1
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
  .time
    font-size: 1 rem
    grid-row: 1 / 3
    grid-column: 2
    display: flex
    flex-direction: column
    justify-content: space-between
    margin-left: 4px
  .remove
    position: absolute
    top: 0px
    right: 2px
    padding: 0 4px
    cursor: pointer
    pointer-events: none
    color: rgba(#fff, 0)
    font-weight: 600
    transition: color .1s ease-in-out
    user-select: none
  &:hover, &.hover
    .wrapper
      width: calc(100% - 1px)
      height: calc(100% - 0px)
      margin: 0px
      padding: 5px 9px 5px 11px
      box-shadow: 0 1px 8px rgba(0, 0, 0, .4)
  &:hover
    z-index: 15
    .wrapper
        width: calc(100%  + 8px)
        padding-right: 18px
        margin-left: calc((var(--day) - 4)/(var(--day) - 4)*(var(--day) - 1)/(var(--day) - 1)*(var(--day) - 3)/(var(--day) - 3)*(var(--day) - 2)/(var(--day) - 2) * -12px)
    .remove
        pointer-events: all
        color: rgba(#fff, 1)
  
</style>

