<template lang="pug">
.List(:class="{open}")
  .overlay(@click="$emit('close')")
  .item(
    v-for="section in sections"
    @click="changeSection(section)"
    @mouseover="$emit('addPlaceholders', getPlaceholders(section))"
    @mouseout="$emit('removePlaceholders')"
    )
    .title SECTION {{section.id}}
    .activity(v-for="activity in section.activities") 
      .type(:class="activity.activity.toLowerCase()") {{activity.activity}}
      .instructor {{activity.instructor || 'To Be Announced'}}
      .info {{activity.loc}} {{activity.day}} 
        span.float-right {{activity.time}}
    Icon repeat
  .empty(v-if="!Array.isArray(sections) || sections.length == 0") No other section available.
</template>

<script>
import Vue from 'vue'

export default {
  name: 'List',
  props: ['open', 'sections'],
  methods: {
    getPlaceholders (section) {
      const h2p = hour => ((hour / 100 | 0) - 7) * 100 + hour % 100 / 0.6
      const d2n = d => d == 'U' ? 1 : d == 'M' ? 2 : d == 'T' ? 3 : d == 'W' ? 4 : d == 'R' ? 5 : ''

      return section.activities.reduce((hours, hour) => {
        return [...hours, ...hour.day.split('').map(day => ({
          day,
          crn: hour.crn,
          instructor: hour.instructor,
          activity: hour.activity,
          time: hour.time,
          color: hour.color,
          title: `${hour.id}@${hour.loc}`,
          start: h2p(hour.time.split('-')[0]),
          end: h2p(hour.time.split('-')[1]),
          dayNumber: d2n(day)
        }))]
      }, [])
    },
    changeSection (section) {
      this.$store.dispatch('addCourse', section.activities)
      this.$emit('removePlaceholders')
      this.$emit('close')
    }
  }
}
</script>

<style lang="sass">
.List
  background-color: darken(lighten($color-card-primary, 3%), 2%)
  border-left: 1px solid $color-card-border
  width: 21.6rem
  display: flex
  flex-direction: column
  padding: 1.8rem .6rem
  box-shadow: -1px 0 4px rgba(0, 0, 0, .0)
  z-index: 3
  overflow-y: scroll
  transition: .5s box-shadow ease-in-out, .5s margin ease-in-out
  will-change: margin, box-shadow
  margin-right: -21.6rem
  &.open
    margin-right: 0
    box-shadow: -1px 0 4px rgba(0, 0, 0, .1)
    .overlay
      pointer-events: inherit
      opacity: 1
      width: calc(100% - 21.6rem)
  .overlay
    pointer-events: none
    opacity: 0
    top: 0
    left: 0
    position: absolute
    width: 100%
    height: 100%
    background: rgba($color-card-primary, .5)
    transition: .2s opacity ease-in-out, .5s width ease-in-out
    will-change: opacity, width
    cursor: pointer
  .empty
    height: 100%
    display: flex
    align-items: center
    justify-content: center
  .item
    margin: .6rem
    border-bottom: 1px solid rgba($color-card-border, .5)
    font-weight: 500
    background: lighten($color-card-primary, 8%)
    padding: .6rem 1.2rem
    box-shadow: 0 1px 4px rgba(0, 0, 0, .2)
    border-radius: 4px
    color: $color-initial
    position: relative
    cursor: pointer
    transition: .2s box-shadow ease-in-out
    &:hover
      box-shadow: 0 2px 6px rgba(0, 0, 0, .3)
      .Icon
        opacity: 1
    .Icon
      border-radius: 4px
      top: 0
      left: 0
      height: 100%
      width: 100%
      background: rgba(lighten($color-card-primary, 8%), .7)
      color: rgba($color-initial, .5)
      font-style: rounded
      display: flex
      align-items: center
      justify-content: center
      position: absolute
      opacity: 0
      transition: .2s opacity ease-in-out
      will-change: opacity
      font-size: 4.8rem
    .title
      opacity: .38
      font-size: 1rem
      font-weight: bold
    .activity
      display: grid
      grid-template-columns: min-content auto
      grid-template-rows: auto auto
      align-items: center
      .type
        height: min-content
        grid-column: 1
        grid-row: 1
        text-align: center
        padding: .2rem .4rem
        margin: .2rem
        // box-shadow: 0 1px 2px rgba(0, 0, 0, .2)
        display: inline-block
        border-radius: .2rem
        font-weight: 500
        font-size: 1rem
        background: #484848
        background-color: rgba($oc-gray-9, .7)
        color: white
        &.res, &.dis // red
          background-color: rgba($oc-red-9, .7)
          color: $oc-red-1
        &.rec // pink
          background-color: rgba($oc-pink-9, .7)
          color: $oc-pink-1
        &._ // grape
          background-color: rgba($oc-grape-9, .7)
          color: $oc-grape-1
        &.lab // violet
          background-color: rgba($oc-violet-9, .7)
          color: $oc-violet-1
        &.ths // indigo
          background-color: rgba($oc-indigo-9, .7)
          color: $oc-indigo-1
        &.lec // blue
          background-color: rgba($oc-blue-9, .7)
          color: $oc-blue-1
        &._ // cyan
          background-color: rgba($oc-cyan-9, .7)
          color: $oc-cyan-1
        &.sem // teal
          background-color: rgba($oc-teal-9, .7)
          color: $oc-teal-1
        &._ // green
          background-color: rgba($oc-green-9, .7)
          color: $oc-green-1
        &.cop // lime
          background-color: rgba($oc-lime-9, .7)
          color: $oc-lime-1
        &._ // yellow
          background-color: rgba($oc-yellow-9, .7)
          color: $oc-yellow-1
        &.prj // orange
          background-color: rgba($oc-orange-9, .7)
          color: $oc-orange-1
      .instructor 
        grid-column: 2
        grid-row: 1
        margin: .2rem
        font-size: 1.2rem
        opacity: .87
      .info
        grid-column: 1 / 3
        grid-row: 2
        margin: .2rem
        font-size: 1.2rem
        opacity: .56

</style>

