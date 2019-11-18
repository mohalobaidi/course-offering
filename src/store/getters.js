import Lockr from 'lockr'

export default {
  terms: ({ terms }) => terms,

  departments: ({ departments }) => departments,

  hours: (state, getters) => {
    const h2p = hour => ((hour / 100 | 0) - 7) * 100 + hour % 100 / 0.6
    const d2n = d => d == 'U' ? 1 : d == 'M' ? 2 : d == 'T' ? 3 : d == 'W' ? 4 : d == 'R' ? 5 : ''
    
    return getters.table.content.reduce((hours, { crn, id, activity, instructor, day: days, time, loc, color }) => {
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

  courses: (state, getters) => {
    const courses = getters.offerings.map(section => section.id.split('-')[0])
    return [...new Set(courses)]
  },

  sections: (state, getters) => {
    let sections = getters.offerings.filter(section => {
      if(!section || section.id.startsWith(getters.course))
        return true
      return false
    })

    if (sections.length === 0)
      sections = state.offerings
    else
      state.session.filters.forEach(({ type, keyword, striction }) => {
        let keywords = keyword.toLowerCase().split(';').filter(keyword => keyword != '')
        if (type != '' && keywords.length)
          sections = sections.filter(section => {
            const criteria = section[type].toLowerCase()
            let result = false
            for (let keyword of keywords) {
              switch (striction) {
                case 'startsWith':
                  result = criteria.startsWith(keyword)
                  break
                case 'contains':
                  result = criteria.includes(keyword)
                  break
                default:
                  result = criteria == keyword
                  break
              }
              if (result) return result
            }
          })
      })
    return sections
  },

  table: (state, getters) => {
    const { id, content } = state.table
    return { id, content: content || [] }
  },

  course: (state, getters) => {
    const course = state.selected.course
    if (getters.courses.includes(course))
      return course
    return ''
  },
  
  offerings: (state, getters) => {
    return state.data[0].offerings
  },

  isEmpty: (state) => {
    const tables = Lockr.get('tables') || []
    const table = tables.find(table => table.id == `${state.selected.term}${state.selected.table}`)
    return !table || table.content.length == 0
  },

  canPaste: (state) => {
    const clipboard = Lockr.get('clipboard')
    return clipboard && clipboard.term === state.selected.term
  }
} 