<template lang="pug">
.CoursesList.row(v-if="sections.length != 0")
	.column(style="max-width: calc(100% - 146px)")
		.list
			.section(v-for="section in sections" :key="section")
				.name {{ section.split(',')[0] }}
					span.remove(@click="remove(section.split(',')[1])") ×
				.crn {{ section.split(',')[1] }}
					span(style='font-size:1px;') &nbsp;
	.column(v-if="AUTO_REGISTER" style="max-width: 126px; margin: 12px 0px 36px;")
		.button(@click="register" :onclick="onclick()") Register
</template>

<script>
export default {
  name: 'CoursesList',
  computed: {
    sections () {
      const table = this.$store.getters.table.content
      return Array.from(new Set(table.map(({ id, crn }) =>  id + ',' + crn)))
		},
		AUTO_REGISTER () { return this.$store.getters.getFlagValue('AUTO_REGISTER') },
  },
  methods: {
    remove (crn) {
      this.$store.dispatch('removeCourse', crn)
		},
		register () {
      if (this.AUTO_REGISTER) {
				const term = this.$store.state.selected.term
				const crns = this.sections.map(section => section.split(',')[1])
        const autosubmit = this.$store.state.autosubmit
        const query = `term=${term}&crn=${crns}&autosubmit=${autosubmit}`
        const hash = window.btoa(query)
        window.open(`https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/term/termSelection?mode=registration#${hash}`)
      }
		},
		onclick (type, section) {
			const term = this.$store.state.selected.term
      return `ga(
        'extensionAnalytics.send',
        'event',
        'Table',
        'register',
        '${term}'
      )`
    }
  }
}
</script>

<style lang="sass" scoped>
.list
	width: min-content
	max-width: 100%
	white-space: nowrap
	margin-bottom: 24px
	display: flex
	background-color: $color-card-primary
	border: 1px solid $color-card-border
	border-radius: 4px
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1)
	overflow-x: auto
	position: relative
	.section
		display: inline-block
		&:not(:last-of-type)
			border-right: 1px solid $color-card-border
		.name
			user-select: none
			white-space: nowrap
			font-size: 12px
			text-align: center
			background-color: $color-card-secondary
			color: rgba($color-initial, .7)
			padding: 0 8px
		.remove
			margin-left: 8px
			cursor: pointer
		.crn
			text-align: center
			color: $color-initial
			padding: 8px 16px
			font-size: 12px
</style>


