<template lang="pug">
  .Course(
    @mouseover="$emit('mouseover')"
    @mouseout="$emit('mouseout')"
    @contextmenu.prevent="$emit('contextmenu', $event)")
    .wrapper
      .title {{ id }}
</template>

<script>
import Vue from 'vue'
import Lockr from 'lockr'

export default {
  name: 'Course',
  props: ['id'],
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
.Course
  --color: #848484
  width: 100%
  top: 0
  left: 0
  height: calc(100% / 11)
  .wrapper
    width: 100%
    height: 50%
    color: white
    font-size: 1.2rem
    padding: 2px 6px 2px 8px
    box-sizing: border-box
    border-radius: 2px
    background-color: var(--color)
    box-shadow: 0 1px 4px rgba(0, 0, 0, .2)
</style>

