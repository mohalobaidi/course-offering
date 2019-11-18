export default function (e, hour) {
  return () => [
    {
      text: 'Search on stKFUPM',
      action: () => this.search(e)
    },
    {
      text: 'Cut',
      action: () => {
        const { crn } = hour
        const i = this.$store.state.selected.table
        this.$store.dispatch('copyCourse', { crn, i })
        this.$store.dispatch('removeCourse', crn)
      }
    },
    {
      text: 'Copy',
      action: () => {
        const { crn } = hour
        const i = this.$store.state.selected.table
        this.$store.dispatch('copyCourse', { crn, i })
      }
    },
    {
      text: 'Remove',
      action: () => this.$store.dispatch('removeCourse', hour.crn),
    },
    '------------------------------------------------',
    {
      text: 'Change section...',
      action: () => {
        this.$store.dispatch('getSections', hour).then(res => {
          this.isSidebarOpen = true
          this.sections = res.filter(section => section.activities[0].crn != hour.crn)
        })
      }
    }
  ]
}