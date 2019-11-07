
<template lang="pug">
  .Timetable.card(:style="{'--from': this.getFromPixel, '--cols': days.length, '--steps': getSteps}"  @contextmenu.prevent)
    .header
      span(v-for="day in days") {{ day }}
    .main
      .timeline(:style="{'--steps': getSteps}")
        span(v-for="t in getTimeline") {{ t }}
      .body(@contextmenu.prevent="contextmenu")
        //- $event.target.classList.contains('hours') && $refs.courseMenu.close();
        transition(name="fade")
          .hours(:key="$store.state.selected.table")
            hour(
              v-for="(hour, i) in hours.sort((a, b) => +b.dayNumber - +a.dayNumber)"
              v-bind="hour"
              :key="i"
              :class="{hover: courseHovered === hour.crn}"
              @mouseover="courseHovered = hour.crn"
              @mouseout="courseHovered = ''"
              @contextmenu="contextmenu($event, hour)")
            hour.placeholder(
              v-for="(placeholder, i) in placeholders"
              v-bind="{...placeholder, isPlaceholder: true}"
              :key="'placeholder' + i")
            //- <div class="hour" :class="{hover: courseHovered === h.crn}" @mouseover="courseHovered = h.crn" @mouseout="courseHovered = ''">
        .grid
    .list(:class="{open: isSidebarOpen}")
      .overlay(@click="isSidebarOpen = false")
      .item(
        v-for="section in sections"
        @click="changeSection(section.id)"
        @mouseover="addPlaceholders(section.id)"
        @mouseout="placeholders = []"
        )
        .title SECTION {{section.id}}
        .activity(v-for="activity in section.activities") 
          .type(:class="activity.activity.toLowerCase()") {{activity.activity}}
          .instructor {{activity.instructor || 'To Be Announced'}}
          .info {{activity.loc}} {{activity.day}} 
            span.float-right {{activity.time}}
        Icon repeat
      .empty(v-if="sections.length == 0") No other section available.
</template>

<script>
import Lockr from 'lockr'

export default {
  name: 'Timetable',
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
      return this.$store.getters.hours
    },
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
      const id = this.$store.state.selected.table
      return [
        {
          text: 'Cut',
          disabled: this.isEmpty(id),
          action: () => {
            this.$store.dispatch('copyTable', id)
            this.$store.dispatch('clearTable', id)
          }
        },
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
            this.$store.dispatch('pasteTable', id)
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
          text: 'Export',
          action: () => {
            this.$store.dispatch('exportTable', id)
          }
        },
        {
          text: 'Import...',
          action: () => {
            const input = document.createElement('input')
            document.body.appendChild(input)
            input.style = 'display: none'
            input.type = 'file'
            input.onchange = e => {
              const file = e.target.files[0]
              if (file) {
                const reader = new FileReader()
                reader.readAsText(file, 'UTF-8')
                const def = () => {
                  document.body.removeChild(input)
                }
                reader.onload = e => {
                  let result = e.target.result
                  try {
                    result = JSON.parse(window.atob(result))
                  } catch (e) {
                    this.$store.commit('TOAST', {text: `Unrecognized type of file.`})
                    return false
                  }
                  const { content } = result
                  const term = result.id.slice(0, -1)
                  const currentTerm = this.$store.state.selected.term
                  if (term !== currentTerm) {
                    this.$store.commit('TOAST', {text: `Can't import ${term.slice(2, -1)} table in ${currentTerm.slice(2, -1)}.`})
                    return false
                  }
                  const clipboard = Lockr.get('clipboard')
                  console.log(clipboard)
                  console.log({ type: 'table', term, payload: { content } })
                  Lockr.set('clipboard', { type: 'table', term, payload: { content } })
                  const confirmMsg = "Warning: This will replace your current schedule.\nCancel and export your schedule now if you would like to save it.\n\nAre you sure you want to continue?"
                  if (this.hours.length === 0 || confirm(confirmMsg)) {
                    console.log(id)
                    this.$store.dispatch('pasteTable', id)
                  }
                  Lockr.set('clipboard', clipboard)
                  def()
                }
                // reader.onerror = e => {
                // ##ERROR
                // }
              }
            }
            input.click()
          }
        }
        // {
        //   text: 'Print...',
        //   disabled: true,//id != this.selected,
        //   action: window.print
        // },
        // { text: 'Share...', disabled: true },
      ]
    },
    courseMenu (e, hour) {
      return () => [
        {
          text: 'Search on stKFUPM',
          action: () => this.search(e)
        },
        { text: 'Cut', disabled: true },
        { text: 'Copy', disabled: true },
        { text: 'Paste', disabled: true },
        {
          text: 'Remove',
          action: () => this.remove(hour.crn),
        },
        '------------------------------------------------',
        {
          text: 'Change section...',
          action: () => {
            this.$store.dispatch('getSections', hour).then(res => {
              this.isSidebarOpen = true
              console.log(res)
              this.sections = res.filter(section => section.activities[0].crn != hour.crn)
            })
          }
        }
      ]
    },
    changeSection (id) {
      const section = this.sections.find(section => section.id == id)
      if (!section)
        return false
      this.$store.dispatch('addCourse', section.activities)
      this.isSidebarOpen = false
      this.placeholders = []

      // PLACEHOLDERS
    },
    addPlaceholders (id) {
      // Hour to Pixel
      const h2p = hour => ((((hour / 100) | 0) - 7) + ((hour % 100) / 60)) * 100
      
      // Day to Number
      const d2n = day =>
        day == 'U' ? 1 :
        day == 'M' ? 2 :
        day == 'T' ? 3 :
        day == 'W' ? 4 :
        day == 'R' ? 5 : ''
      const section = this.sections.find(section => section.id == id)
      if (!section)
        return false
      this.placeholders = section.activities.reduce((hours, { crn, id, activity, instructor, day: days, time, loc, color }) => {
        return [...hours, ...days.split('').map(day => ({
          crn,
          instructor,
          activity,
          day,
          time,
          color,
          title: `${id}@${loc}`,
          start: h2p(time.split('-')[0]),
          end: h2p(time.split('-')[1]),
          dayNumber: d2n(day)
        }))]
      }, [])
    },
    contextmenu (e, hour) {
      const isHour = e.path.find(e => e.classList && e.classList.contains('Hour'))
      if (isHour && hour) {
       this.$context.open(e, this.courseMenu(e, hour))
      } else if (!isHour && !hour) {
        this.$context.open(e, this.menu)
      }
    },
    isEmpty () {
      const tables = Lockr.get('tables') || []
      const table = tables.find(table => table.id == `${this.term}${this.selected}`)
      return !table || table.content.length == 0
    },
    canPaste () {
      const clipboard = Lockr.get('clipboard')
      if (!clipboard)
        return false
      if (clipboard.type == 'table' && clipboard.term == this.term)
        return true
      return false
    },
    remove (crn) {
      this.$store.dispatch('removeCourse', crn)
    },
    search (event) {
      const hour = event.path.find(e => e.classList && e.classList.contains('Hour'))
      if (!hour) return false
      const title = hour.querySelector('.title').innerText
      const course = title.split('-')[0]
      const instructor = hour.querySelector('.instructor').innerText
      window.open(`https://www.stkfupm.com/forum/search/1/?q=${instructor}&o=date`)
    }
  }
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
    z-index: 10

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
    min-height: 100%
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
  .list
    background-color: darken(lighten($color-card-primary, 3%), 2%)
    border-left: 1px solid $color-card-border
    width: 21.6rem
    display: flex
    flex-direction: column
    padding: 1.8rem .6rem
    box-shadow: -1px 0 4px rgba(0, 0, 0, .0)
    z-index: 1
    overflow-y: scroll
    transition: .5s box-shadow ease-in-out, .5s margin ease-in-out
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