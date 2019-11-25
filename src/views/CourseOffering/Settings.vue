<template lang="pug">
  #settings
    Icon(v-if="AUTO_REGISTER" :hover="autosubmit ? 'flash_off' : 'flash_on'" @click="toggleAutosubmit") {{ autosubmit ? 'flash_on' : 'flash_off' }}
    Icon(:hover="sound ? 'volume_off' : 'volume_up'" @click="toggleSound") {{ sound ? 'volume_up' : 'volume_mute' }}
    Icon(@click="changeTheme") invert_colors
    Icon(v-if="settings == 'true'" @click="open") settings
    .overlay(:class="{hidden}" @click="close")
    .card(:class="{hidden}")
      h3 Options
      p
        span(style="color: #f03e3e; font-weight: 500") WARNING:
        |  Some of these features are still experimental. By enabling these features, Some KFUPM websites may not work properly, including "
        span(style="font-weight: 500") Registration website
        | ".
      main
          .row
            .column.column-80
              .cell
                label Timetable Creator
                p By disabling this flag, the timetable will be hidden. No data will be lost.
              .cell
                label Section Monitor
                p This flag will add the ability to monitor sections.
              .cell
                label Course Auto Registrar
                p Automatically register the monitored section (Use it with "Section Monitor")
              .cell
                label Auto Refresh
                p Refreshes the page Automatically (Use it with "Section Monitor")
              .cell
                label Export/Import Timetable
                p When this flag is enabled, a new option will appear in the context menu for table to Export/Import tables.
              .cell
                label Import Timetable from Banner 9
                p Enables you to import your registered courses to a timetable.
              .cell
                label KFUPM Planner
                p Create your whole academic plan with an easy to use planner.
            .column.column-20
              .cell(v-for="flag in flags")
                select(:value="getFlag(flag)" @change="onFlagChange($event, flag)")
                  option(selected value="default") Default
                  option(value="enabled") Enabled
                  option(value="disabled") Disabled
              .cell
                select(disabled)
                  option(selected value="default") Default
                  option(value="enabled") Enabled
                  option(value="disabled") Disabled
              .cell
                select(disabled)
                  option(selected value="default") Default
                  option(value="enabled") Enabled
                  option(value="disabled") Disabled
              .cell
                select(disabled)
                  option(selected value="default") Default
                  option(value="enabled") Enabled
                  option(value="disabled") Disabled
      .button(@click="close") save & close
      .button.coffee(@click="coffee") Buy me a Coffee!
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Settings',
  data () {
    return {
      autosubmit: this.$store.state.autosubmit,
      sound: localStorage.getItem('sound') == 'true',
      hidden: true
    }
  },
  computed: {
    ...mapGetters( [
      'getFlag',
      'getFlagValue'
    ]),
    settings () {
      return localStorage.getItem('co_settings')
    },
    flags () {
      return Object.keys(this.$store.state.flags).filter(flag => flag !== 'default')
    },
    AUTO_REGISTER () { return this.$store.getters.getFlagValue('AUTO_REGISTER') },
  },
  mounted () {
    this.$store.dispatch('loadFlags')
  },
  methods: {
    toggleAutosubmit () {
      const enableMssage =
        'Are you sure you want to turn "Auto Submit" on?\n'
      + 'It will certainly fail if there are any conflictions.'
      const disableMssage =
        'Are you sure you want to turn "Auto Submit" off?\n'
      + 'It will no longer submit after auto-filling crns.\n\n'
      + 'This is applied only for this tab.'
      if (!this.autosubmit && !confirm(enableMssage))
        return false
      if (this.autosubmit && !confirm(disableMssage))
        return false
      this.$store.state.autosubmit = this.autosubmit = !this.autosubmit
    },
    toggleSound () {
      const sound = localStorage.getItem('sound') || ''
      this.sound = sound == 'true' ? false : true
      localStorage.setItem('sound', this.sound)
      if (this.sound == true)
        this.$store.dispatch('playSound', 'alert')
    },
    changeTheme () {
      const theme = localStorage.getItem('theme') || ''
      localStorage.setItem('theme', theme ? '' : 'dark')

      location = location.pathname + (theme ? '' : '?dark') + location.hash
    },
    onFlagChange (e, name) {
      const value = e.target.value
      this.$store.dispatch('setFlag', { name, value })
    },
    open () {
      this.hidden = false
      document.body.classList.add('noscroll')
    },
    close () {
      this.hidden = true
      document.body.classList.remove('noscroll')
    },
    coffee () {
      window.open('https://www.buymeacoffee.com/IxJ0CWU')
    }
  }
}
</script>

<style lang="sass">
#settings
  height: 20px
  user-select: none
  color: rgba(255, 255, 255, .7) !important
  float: right
  font-size: 1.2rem
  transition: color .2s ease-in-out
  cursor: pointer
  .Icon
    font-size: 1.6rem
    line-height: 20px
    margin-left: 1.2rem
    &:hover
      color: #fff !important
  .overlay
    background-color: rgba(0, 0, 0, .5)
    width: 100%
    height: 100%
    position: fixed
    top: 0
    left: 0
    display: block
    z-index: 10
  .card
    cursor: initial !important
    padding: 2.4rem 4.8rem
    width: 720px
    position: fixed
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    display: block
    z-index: 20
    h3
      font-weight: 400
    p
      font-size: 1.6rem
    main
      label
        font-size: 1.4rem
      p
        font-size: 1.2rem
      .cell
        height: 5.6rem
        margin-bottom: 1.2rem
    .button
      margin-top: 2.4rem
      float: right
    .coffee
      margin-right: 1.6rem
      background: transparent
      color: rgb(12, 166, 120)
</style>

<style lang="sass" theme="light">
#settings
  .card
    color: black
    box-shadow: 0 2px 8px rgba(black, .2)
    p
      color: rgba(black, .87)
</style>

<style lang="sass" theme="dark">
#settings
  .card
    color: white
      box-shadow: 0 2px 8px rgba(black, .5)
    p
      color: rgba(white, .7)
</style>


