
<!-- TODO: MAKE IT FUNCTIONAL COMPONENT -->
<template lang="pug">
  .Timetable.card(:style="{'--from': this.getFromPixel, '--cols': days.length, '--steps': getSteps}"  @contextmenu.prevent)
    .header(:class="{shrink: isSidebarOpen}")
      span(v-for="day in days") {{ day }}
    .main
      .timeline(:style="{'--steps': getSteps}")
        span(v-for="t in getTimeline") {{ t }}
      .body(@contextmenu.prevent="contextmenu")
        .grid
        transition(name="fade")
          .hours(:key="$store.state.selected.table")
            Hour(
              v-for="(hour, i) in hours"
              :class="{hover: courseHovered === hour.crn}"
              v-bind="hour"
              :key="i"
              @mouseover="courseHovered = hour.crn"
              @mouseout="courseHovered = ''"
              @contextmenu="contextmenu($event, hour)")
            Hour.placeholder(v-for="(ph, i) in placeholders" v-bind="{...ph, isPlaceholder: true}" :key="`ph-${i}`")
    List(
      :open="isSidebarOpen"
      :sections="sections"
      @close="isSidebarOpen = false"
      @addPlaceholders="addPlaceholders"
      @removePlaceholders="placeholders = []")
</template>

<script>
import Lockr from 'lockr'
import List from './List.vue'
import tableContext from './table.context'
import courseContext from './course.context'

export default {
  name: 'Timetable',
  components: {
    List
  },
  data () {
    return {
      days: ['SUN', 'MON', 'TUE', 'WED', 'THU'],
      timeline: {
        from: 700,
        to: 1700,
        every: 100,
        step: 2
      },
      courseHovered: '',
      sections: [],
      placeholders: [],
      isSidebarOpen: false
    }
  },
  computed: {
    // TODO: use mapGetters
    term () {
      return this.$store.state.selected.term
    },
    selected () {
      return this.$store.state.selected.table
    },
    table () {
      return this.$store.getters.table.content
    },
    hours () {
      return this.$store.getters.hours.sort((a, b) => +b.dayNumber - +a.dayNumber)
    },
    // TODO: transfer to getters
    lastHour () {
      return this.hours.reduce((last, hour) => {
        let h = +hour.time.split('-')[1]
        h = Math.ceil(h / 100 - 1) * 100
        return Math.max(h, last)
      }, 0)
    },
    getTimeline () {
      let { from, to, every } = this.timeline
      to = Math.max(to, this.lastHour)
      const output = [from]

      let last = output[output.length - 1]
      while (last < to) {
        let h = (last / 100 | 0) + (every / 100 | 0)
        let m = ((last % 100) + (every % 100)) % 60
        h += ((last % 100) + (every % 100)) / 60 | 0
        output.push(h * 100 + m)
        last = output[output.length - 1]
      }

      return output.map(t => {
        let h = t / 100 | 0
        let m = t % 100
        h = h === 0 ? '00' : h < 10 ? `0${h}` : h
        m = m === 0 ? '00' : m < 10 ? `0${m}` : m
        return `${h}:${m}`
      })
    },
    getSteps () {
      return (this.getTimeline.length) * this.timeline.step
    },
    getFromPixel () {
      const h = (this.timeline.from / 100) | 0
      const m = this.timeline.from % 100
      return (h + (m / 60)) * 100
    }
  },
  methods: {
    menu () {
      return tableContext.bind(this)()
    },
    courseMenu (e, hour) {
      return courseContext.bind(this)(e, hour)
    },
    addPlaceholders (placeholders) {
      this.placeholders = placeholders
    },
    contextmenu (e, hour) {
      const isHour = e.path.find(e => e.classList && e.classList.contains('Hour'))
      if (isHour && hour) {
       this.$context.open(e, this.courseMenu(e, hour))
      } else if (!isHour && !hour) {
        this.$context.open(e, this.menu)
      }
    },

    search (e) {
      const hour = e.path.find(e => e.classList && e.classList.contains('Hour'))
      if (!hour) return false
      const title = hour.querySelector('.title').innerText
      const course = title.split('-')[0]
      const instructor = hour.querySelector('.instructor').innerText
      window.open(`https://www.stkfupm.com/forum/search/1/?q=${instructor}&o=date`)
    },
    cutTable (e) {
      const text = `Table ${this.selected + 1} has been copied!`
      this.$store.commit('TOAST', {text, color: 'rgba(23, 27, 31, 0.7)'})
      tableContext.bind(this)().find(el => el.text === 'Cut').action()
    },
    copyTable () {
      const text = `Table ${this.selected + 1} has been copied!`
      this.$store.commit('TOAST', {text, color: 'rgba(23, 27, 31, 0.7)'})
      tableContext.bind(this)().find(el => el.text === 'Copy').action()
    },
    pasteTable () {
      const text = `Table has been pasted!`
      this.$store.commit('TOAST', {text, color: 'rgba(23, 27, 31, 0.7)'})
      tableContext.bind(this)().find(el => el.text === 'Paste').action()
    },
  },
  mounted () {
    this.$el.addEventListener('cut', this.cutTable)
    this.$el.addEventListener('copy', this.copyTable)
    this.$el.addEventListener('paste', this.pasteTable)
  },
  beforeDestroy() {
    this.$el.removeEventListener('cut', this.cutTable)
    this.$el.removeEventListener('copy', this.copyTable)
    this.$el.removeEventListener('paste', this.pasteTable)
  },
}
</script>

<style lang="sass" scoped>
@import '@/_Color.sass'
.Timetable
  height: 640px
  border: 1px solid $color-card-border
  border-radius: 4px
  //box-shadow: 0 2px 4px rgba(173, 181, 189, 0.1)
  display: flex
  &Selector
    float: left
    width: 100%
    text-align: right
    user-select: none
    button
      padding: 0
      margin: 0
      margin-left: 32px
  .header
    margin-left: 64px
    height: 32px
    display: flex
    border-left: 1px solid $color-card-border
    color: $color-initial
    user-select: none
    position: absolute
    background: rgba($color-card-primary, .95)
    box-shadow: 0 2px 4px rgba($color-card-primary, .5)
    top: 0
    width: calc(100% - 64px)
    will-change: width
    transition: .5s width ease-in-out
    z-index: 2
    &.shrink
      width: calc(100% - 28rem)

    span
      flex: 1
      text-align: center
      font-size: 12px
      line-height: 32px
  .main
    height: 100%
    overflow-y: auto !important
    flex: 1
    display: flex
    padding-top: 32px
    $bg: $color-card-primary
    $top-shadow: rgba(black, .1)
    $bottom-shadow: rgba($color-card-border, .8)
    background: linear-gradient(180deg,$bg 30%, rgba($bg ,0)), linear-gradient(180deg,rgba($bg, 0), $bg 70%) 0 100%,linear-gradient(180deg, $top-shadow, rgba($top-shadow, 0)),linear-gradient(180deg,rgba($bottom-shadow, 0), $bottom-shadow 70%) 0 100%
    background-repeat: no-repeat
    background-size: 100% 12px,100% 32px,100% 6px,100% 16px
    background-position: 0 32px,0 100%,0 32px,0 100%
    background-attachment: local, local, scroll, scroll
  .timeline
    background-color: $color-card-secondary
    margin-top: -32px
    padding-top: 32px
    width: 64px
    display: flex
    flex-direction: column
    user-select: none
    overflow: auto
    min-height: calc(100% + 32px)
    height: calc(32px + 604px * (var(--steps) / 22))
    span
      flex: 1
      text-align: right
      padding-right: 12px
      font-size: 14px
      box-sizing: border-box
      line-height: 2px
      color: rgba($color-initial, .7)
  .body
    flex: 1
    position: relative
  .hours
    // height: calc(100% - 2px)
    height: 602px
    width: calc(100% - 1px)
    top: 1px
    left: 1px
    z-index: 1
    position: absolute
    display: grid
    grid-template-columns: repeat(5, 1fr)
    grid-template-rows: repeat(11, 1fr)
  .hour
    --duration: calc((var(--end) - var(--start)) / 100)
    grid-column: var(--day)
    position: absolute
    transform: translateY(calc(var(--start) * 1% / var(--duration)))
    height: calc(100% * var(--duration) / 11)
    width: calc(100% / (6 - var(--day)))
    top: 0
    left: 0
    .container
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
    &_title
      grid-row: 1
      grid-column: 1
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
  .grid
    min-height: 100%
    height: calc(604px * (var(--steps) / 22))
    background-size: calc(100% / var(--cols)) calc(100% / var(--steps))
    background-image: linear-gradient(to right, $color-card-border 1px, transparent 1px), linear-gradient(to bottom, $color-card-border 1px, transparent 1px)
</style>