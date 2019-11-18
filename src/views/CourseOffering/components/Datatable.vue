<template lang="pug">
.Datatable.card(style="min-height: 512px;")
  table
    colgroup
      col(width="0%")
      col(width="0%")
      col(width="0%")
      col(width="50%")
      col(width="50%")
      col(width="0%")
      col(width="0%")
      col(width="0%")
      col(width="0%")
      col(width="0%")
      col(width="0%")
    thead
      tr
        th(v-for="header in headers") {{ header.name }}
        th(style="text-align:center;min-width:118px") Status
        th(v-context="refreshMenu()")
          Icon.refresh(
            v-if="AUTO_REFRESH && department != '' && department != 'select'"
            :class="{disabled: refreshDisabled, auto: autoRefresh !== 0}"
            @click="refresh")
            | refresh
    tbody
      tr(v-for="(section, i) in sections" :key="i")
        td(style="white-space: nowrap") {{ section.id }}

        td(): .tag(:class="section.activity.toLowerCase().trim()") {{ section.activity }}

        td(): .crn(
          @click="onCrnClick($event, section.crn)"
          :onclick="onclick('copy/register', section)") {{ section.crn }}

        td(v-for="header in headers.slice(3)") {{ section[header.value] }}



        td(v-if="watchType(section.crn) != 'NOT_WATCHED' && section.status == 'open'")
          .pill.open {{ notify(section.crn, watchType(section.crn)) }}
        td(v-else-if="SECTION_MONITOR && watchType(section.crn) == 'WATCHED'")
          .pill.watching(
            :class="{disabled: !refreshDisabled && autoRefresh == 0}"
            @click="toggleWatching(section.crn, $event)"
            :onclick="onclick('unwatch', section)"
            :key="`${i}-${watchType(section.crn)}`")
        td(v-else-if="SECTION_MONITOR && watchType(section.crn) == 'AUTO'")
          .pill.auto(
            :class="{disabled: !refreshDisabled && autoRefresh == 0}"
            @click="toggleWatching(section.crn, $event)"
            :onclick="onclick('unauto', section)"
            :key="`${i}-${watchType(section.crn)}`")
        td(v-else-if="SECTION_MONITOR && section.status == 'closed'")
          .pill.closed(
            @click="toggleWatching(section.crn, $event)"
            :onclick="onclick('watch/auto', section)"
            :key="`${i}-${watchType(section.crn)}`")
        td(v-else-if="section.status == 'closed'")
          .pill.closed(style="cursor: inherit")
        td(v-else-if="section.status == 'open'")
          .pill.open
        td(v-else)
          .pill.unknown

        td(v-if="isInTable(section.crn)" :onclick="onclick('remove', section)" :key="i + '-remove'")
          .toggle.remove(@click="remove(section.crn)")
        td(v-else :onclick="onclick('add', section)" :key="i+'-add'")
          .toggle.add(@click="add(section.crn)")

  .message(v-if="department == '' || department == 'select'") Select department first
  .message(v-else-if="!sections || sections.length == 0") No courses available
</template>

<script>
import { setTimeout, clearInterval, setInterval } from 'timers';
export default {
  name: 'Datatable',
  data () {
    return {
      title: '',
      lastUpdate: new Date,
      refreshDisabled: false,
      refreshReminder: null,
      autoRefresh: 0,
      headers: [
        { name: 'Section', value: 'id' },
        { name: 'Activity', value: 'activity' },
        { name: 'CRN', value: 'crn' },
        { name: 'Course Name', value: 'course_name' },
        { name: 'Instructor', value: 'instructor' },
        { name: 'Day', value: 'day' },
        { name: 'Time', value: 'time' },
        { name: 'Location', value: 'loc' }
      ] 
    }
  },
  computed: {
    SECTION_MONITOR () { return this.$store.getters.getFlagValue('SECTION_MONITOR') },
    AUTO_REGISTER () { return this.$store.getters.getFlagValue('AUTO_REGISTER') },
    AUTO_REFRESH () { return this.$store.getters.getFlagValue('AUTO_REFRESH') },
    sections () { return this.$store.getters.sections},
    watching () { return this.$store.state.watching},
    department () { return this.$store.state.selected.department },
    table () { return this.$store.getters.table.content }
  },
  methods: {
    onCrnClick (e, crn) {
      if (e.altKey)
        this.register(crn)
      else {
        const input = document.createElement('input')
        input.style = `
          position: absolute !important;
          top: 1000px;
          left: 1000px;
        `
        input.value = e.target.innerText
        e.target.appendChild(input)
        input.select()
        input.setSelectionRange(0, 99999)
        document.execCommand('copy')
        this.$store.commit('TOAST', {
          text: input.value + ' has been copied!',
          color: 'rgba(23, 27, 31, 0.7)'
        })
        e.target.removeChild(input)
      }
    },
    watchType (crn) {
      const watched = this.watching.find(watched => watched.crn == crn || watched == crn)
      if (!watched)
        return 'NOT_WATCHED'
      if (watched.type == 'AUTO')
        return 'AUTO'
      else
        return 'WATCHED'
    },
    refresh () {
      let loader
      if (document.title.charAt(0) == 'K')
        this.title = document.title
      const title = this.title || document.title
      this.refreshDisabled = true
      const lastRefresh = new Date
      const enableRefresh = () => {
        let delta = lastRefresh - new Date
        if (delta > 500) {
          this.refreshDisabled = false
          clearInterval(loader)
          document.title = title
        } else
          setTimeout(() => {
            this.refreshDisabled = false
            clearInterval(loader)
            document.title = title
          }, 500 - delta)
      }
      if (this.AUTO_REFRESH) {
        loader = setInterval(() => {
          const c = document.title[0]
          document.title = (c == '⣾' ? '⣽' :
                            c == '⣽' ? '⣻' :
                            c == '⣻' ? '⢿' :
                            c == '⢿' ? '⡿' :
                            c == '⡿' ? '⣟' :
                            c == '⣟' ? '⣯' :
                            c == '⣯' ? '⣷'  : '⣾') + " KFUPM | Refreshing..."
        }, 100)
        const beforeLength = this.sections.length
        this.$store.dispatch('updateOfferings').then(() => {
          const afterLength = this.sections.length

          if (beforeLength < afterLength)
            this.$store.dispatch('playSound', 'more')
          else if (beforeLength > afterLength)
            this.$store.dispatch('playSound', 'less')
          this.lastUpdate = new Date
          enableRefresh()
          if (this.autoRefresh !== 0)
            setTimeout(this.refresh, this.autoRefresh * 1000)
        }).catch(() => {
          enableRefresh()
          this.autoRefresh = 0
        })
      } else {
        this.refreshDisabled = false
        this.autoRefresh = 0
      }
    },
    refreshMenu () {
      return () => {
        const h = this.lastUpdate.getHours()
        const HH = h > 9 ? h : '0' + h
        const m = this.lastUpdate.getMinutes()
        const MM = m > 9 ? m : '0' + m
        const s = this.lastUpdate.getSeconds()
        const SS = s > 9 ? s : '0' + s
      return [
        {
          text: `Last: ${HH}:${MM}:${SS}`,
          disabled: true
        },
         '------------------------------------------------',
        {
          text: 'refresh every 15s',
          disabled: this.isRefreshDisabled(15),
          action: () => this.startAutoRefresh(15)
        },
        {
          text: 'refresh every 10s',
          disabled: this.isRefreshDisabled(10),
          action: () => this.startAutoRefresh(10)
        },
        {
          text: 'refresh every 5s',
          disabled: this.isRefreshDisabled(5),
          action: () => this.startAutoRefresh(5)
        },
        {
          text: 'refresh every 2s',
          disabled: this.isRefreshDisabled(2),
          action: () => this.startAutoRefresh(2)
        },
        '------------------------------------------------',
        {
          text: 'Stop Refreshing',
          disabled: !this.isRefreshDisabled(),
          action: () => {
            this.autoRefresh = 0
          }
        },
      ]}
    },
    isRefreshDisabled (sec) {
      if (this.refreshDisabled && this.autoRefresh === 0)
        return true
      if (this.autoRefresh === sec)
        return true
      if (!sec && this.autoRefresh !== 0)
        return true
      return false
    },
    startAutoRefresh (sec) {
      this.autoRefresh = sec
      if (!this.refreshDisabled)
        this.refresh()
    },
    add (crn) {
      const activities = this.$store.getters.offerings.filter(section => section.crn === crn)
      this.$store.dispatch('addCourse', activities)
    },
    remove (crn) {
      this.$store.dispatch('removeCourse', crn)
    },
    isInTable (crn) {
      return this.table.filter(section => section.crn === crn).length
		},
		toggleWatching (crn, e) {
      let type = (this.AUTO_REGISTER && e && e.altKey) ? 'AUTO': ''
      this.$store.dispatch('toggleWatching', { crn, type })
    },
    register (crn) {
      if (this.AUTO_REGISTER) {
        const term = this.$store.state.selected.term
        const autosubmit = this.$store.state.autosubmit
        const query = `term=${term}&crn=${crn}&autosubmit=${autosubmit}`
        const hash = window.btoa(query)
        window.open(`https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/term/termSelection?mode=registration#${hash}`)
      }
    },
    notify (crn, type) {
      if (this.SECTION_MONITOR && type == 'AUTO') {
        this.register()
      }
      this.$store.dispatch('playSound', 'alert')
      this.toggleWatching(crn)
    },
    onclick (_type, section) {
      const [type, altType] = _type.split('/')
      return `ga(
        'extensionAnalytics.send',
        'event',
        'Course',
        event.altKey ? '${altType || type}' : '${type}',
        '${section.crn}'
      )`
    }
  },
}
</script>

<style lang="sass" scoped>
@import '~/open-color/open-color.scss'

.Datatable
  overflow: initial !important
  display: flex
  flex-direction: column
  overflow-x: auto !important
  table
    overflow: initial !important
    .refresh
      cursor: pointer
      margin: .4rem
      transition: .1s transform ease-in-out, animation .1s ease-in-out
      user-select: none
      @keyframes rotation
        from
          transform: rotate(15deg)
        to
          transform: rotate(359deg)
      &.disabled
        animation: rotation 1s infinite ease-in-out
        pointer-events: none
        opacity: 0.5
      &.auto
        color: #40c057
        pointer-events: none
        opacity: 0.6
      &:hover
        transform: rotate(15deg)
    .crn
      text-align: center
      margin: 0 -6px
      padding: 6px
      cursor: pointer
      border-radius: 2px
      background: rgba(white, 0)
      border: 1px solid transparent
      box-shadow: 0 1px 1px rgba(black, 0)
      transition: background 0.4s ease-in-out, box-shadow .1s ease-in-out, border .1s ease-in-out
      overflow: hidden
      position: relative
      background-position: center
      &.disabled
        pointer-events: none
      &:hover
        // background: rgba(white, .05)
        box-shadow: 0 2px 4px rgba(black, .2)
        border: 1px solid $color-card-border
    .pill
      width: 96px
      height: 32px
      padding: 0 16px
      border-radius: 16px
      border: 2px solid
      font-weight: 500
      line-height: 28px
      margin: 0 auto   
      text-align: center
      transition: border-color .2s ease-in-out
      &.disabled
        opacity: 0.7
        border: 1px solid
        padding: 1px 16px
      &::before
        content: "Unknown"
      &.open  
        &::before
          content: "Open"
      &.closed
        cursor: pointer
        &::before
          content: "Closed"
      &.watching
        cursor: pointer
        &::before
          content: "Watching"
      &.auto
        cursor: pointer
        &::before
          content: "AUTO"
      td
        border: 0 !important
        border-top: 2px solid transparent !important
        &:first-of-type
          margin-left: -10px !important
        &:last-of-type
  .toggle
    float: right
    cursor: pointer
    height: 32px
    width: 32px
    border: 2px solid
    border-radius: 50%
    background-position: center
    background-repeat: no-repeat
  .tag
    text-align: center
    padding: .4rem .8rem
    // box-shadow: 0 1px 2px rgba(0, 0, 0, .2)
    display: inline-block
    border-radius: .2rem
    font-weight: 500
    font-size: 1.4rem
    background: #484848
    background-color: rgba($oc-gray-9, .7)
    color: white !important
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
      

  .message
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    flex-direction: column
    color: $color-secondary
    padding-bottom: 2.4rem
    &::before
      content: ''
      display: inline-block
      width: 128px
      height: 128px
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 7c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1zm-.01-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-3h-2v-2h2v2z'/%3E%3C/svg%3E")
      background-size: 128px
      opacity: .2
    &:nth-of-type(2)
      display: none
  @media (max-width: 1200px)
    thead tr
      display: flex
      align-items: center
      &::before
        content: "Results"
        flex: 1
        padding: 1.2rem 1.6rem
        display: inline-block
        font-weight: bold
      th:not(:last-child)
        display: none
      th:last-child
        display: inline-block
    tbody tr
      align-items: center
      display: grid
      grid-template-columns: repeat(4, 1fr) repeat(2, min-content)
      grid-template-rows: repeat(2, 1fr)
      border-bottom: 1px solid $color-card-secondary
      width: 100%
      td
        border: 0 !important
      td:nth-child(1)::before
        content: 'Course-Sec: '
        font-weight: 500
      td:nth-child(3) .crn
        width: min-content
        white-space: nowrap
        &::before
          content: 'CRN: '
          font-weight: 500
      td:nth-child(4)::before
        content: 'Course Name: '
        font-weight: 500
      td:nth-child(5)::before
        content: 'Instructor: '
        font-weight: 500
      td:nth-child(6)::before
        content: 'Day: '
        font-weight: 500
      td:nth-child(7)::before
        content: 'Time: '
        font-weight: 500
      td:nth-child(8)::before
        content: 'Loc: '
        font-weight: 500
      td:nth-child(9)
        grid-column: 5
        grid-row: 1 / span 2
      td:nth-child(10)
        grid-column: 6
        grid-row: 1 / span 2
  @media (max-width: 800px)

    tbody tr
      grid-template-columns: repeat(3, 1fr) repeat(2, min-content)
      grid-template-rows: repeat(3, 1fr)
      td:nth-child(9)
        grid-column: 4
        grid-row: 1 / span 3
      td:nth-child(10)
        grid-column: 5
        grid-row: 1 / span 3
</style>

<style lang="sass" theme="light" scoped>
.Datatable
  table
    .crn
      &:hover
        background: white radial-gradient(circle, transparent 1%, white 1%) center / 15000%
      &:active
        background-color: #ddd
        background-size: 100%
        transition: background 0s
    .pill
      border-color: #dee2e6
      color: #adb5bd
      &.open
        border-color: #8ce99a
        color: #2f9e44
      &.closed
        border-color: #ffa8a8
        color: #e03131
      &.watching
        border-color: #ffc078
        color: #ff922b
      &.auto
        border-color: #b197fc
        color: #845ef7
  .toggle
    &.add
      border-color: #dee2e6
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath d='M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z' fill='%23adb5bd'/%3E%3C/svg%3E")
      &:hover, &:focus
        border-color: #adb5bd
    &.remove
      border-color: #51cf66
      background-color: #b2f2bb
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath d='M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z' fill='%232f9e44'/%3E%3C/svg%3E")
      &:hover, &:focus
        background-color: #d3f9d8
        border-color: #adb5bd
</style>

<style lang="sass" theme="dark" scoped>
.Datatable
  .crn
    &:hover
      background: rgba(white, .1) radial-gradient(circle, transparent 1%, rgba(white, .1) 1%) center / 15000%
    &:active
      background-color: rgba(black, .1)
      background-size: 100%
      transition: background 0s
  table
    .pill
      color: #e0e0e0
      &.open
        border-color: #51cf66
      &.closed
        border-color: #ff6b6b
      &.watching
        border-color: #fcc419
      &.auto
        border-color: #845ef7
  .toggle
    &.add
      border-color: rgba(white, .1)
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath d='M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z' fill='%23a0a0a0'/%3E%3C/svg%3E")
      &:hover, &:focus
        border-color: #484848//#a0a0a0
    &.remove
      border-color: #51cf66
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath d='M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z' fill='%2351cf66'/%3E%3C/svg%3E")
      &:hover, &:focus
        border-color: #a0a0a0
</style>
