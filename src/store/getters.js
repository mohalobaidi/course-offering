import database from './database'

export default {
  terms: ({ terms }) => terms,

  departments: ({ departments }) => departments,

  hours: (state, getters) => {
    // Hour to Pixel
    const h2p = hour => ((((hour / 100) | 0) - 7) + ((hour % 100) / 60)) * 100
    
    // Day to Number
    const d2n = day =>
      day == 'U' ? 1 :
      day == 'M' ? 2 :
      day == 'T' ? 3 :
      day == 'W' ? 4 :
      day == 'R' ? 5 : ''
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
  }
} 