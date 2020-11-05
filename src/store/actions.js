import Lockr from 'lockr' 
import database from './database'

const url = chrome.runtime.getURL('/')
const audios = {
  alert: url + 'sounds/alert.mp3',
  more: url + 'sounds/more.mp3',
  less: url + 'sounds/less.mp3'
}

export default {

  playSound ({}, type) {
    const audio = audios[type] || audios.alert
    if (localStorage.getItem('sound') == 'true')
    new Audio(audio).play()
  },

  addFilter ({ commit, state }) {
    const filters = state.session.filters
    if (filters.length > 0 && filters[filters.length - 1].keyword == '')
      return false
    commit('ADD_FILTER')
    commit('UPDATE_FILTERS')
  },

  removeFilter ({ commit }, i) {
    commit('REMOVE_FILTER', i)
    commit('UPDATE_FILTERS')
  },

  updateFilters ({ commit }, filter) {
    commit('UPDATE_FILTERS', filter)
  },

  updateScroll ({ commit }, scroll) {
    commit('UPDATE_SCROLL', scroll)
  },

  addCourse ({ commit, state, getters }, activities) {
    // Check if there is any late section
    if (activities.filter(section => section.time.split('-')[1] > 2200).length) // was 1800
    return commit('TOAST', {
      text: 'Sorry! late sections is not supported for now.'
    })
    
    // Get duplicate section if exists
    let duplicate = false
    const course = activities[0].id.split('-')[0]
    const activityTypes = activities.map(section => section.activity)
    
    getters.hours.forEach(hour => {
      if (hour.title.startsWith(course) && activityTypes.includes(hour.activity))
      duplicate = hour.crn
    })
    
    // Check if collision
    let collision = false
    
    for (let hour of getters.hours) {
      // break if already marked as conflicted section
      if (collision) break
      // Exclude duplicated section from checking process
      if (hour.crn === duplicate) continue
      for (let section of activities) {
        // break if already marked as conflicted section
        if (collision) break
        for (let day of section.day.split('')) {
          // break if already marked as conflicted section
          if (collision) break
          // End this iteration if they are not on the same day
          if (day != hour.day) continue
          
          const [a1, b1] = hour.time.split('-')
          const [a2, b2] = section.time.split('-')
          
          // End this iteration they are not conflicting
          if (a1 < b2 && b1 < a2) continue
          if (a2 < b1 && b2 < a1) continue
          
          // Mark as conflicted section
          collision = true
        }
      }
    }
    
      if (collision)
        return commit('TOAST', {
          text: 'Time conflict! please remove conflicted section first.'
        })

      if (duplicate)
        commit('REMOVE_COURSE', duplicate)

      const usedColors = [... new Set(getters.table.content.map(section => section.color))]

      let colors = [
        '#c92a2a', '#a61e4d', '#862e9c', '#5f3dc4',
        '#364fc7', '#1864ab', '#0b7285', '#087f5b',
        '#2b8a3e', '#5c940d', '#e67700', '#d9480f'
      ]

      if (usedColors.length < colors.length)
        colors = colors.filter(color => !usedColors.includes(color))

      const color = colors[colors.length * Math.random() | 0]
      commit('ADD_COURSE', activities.map(section => ({color, ...section})))
      commit('TOAST', {
        text: `${duplicate ? 'REPLACED' : 'ADDED'} ${activities[0].id.split('-')[0]}`,
        color: 'rgba(81, 207, 102, .5)'
      })
  },

  removeCourse({ commit, state, getters }, crn) {
    const section = getters.table.content.find((section) => section.crn === crn)
    commit('REMOVE_COURSE', crn)
    commit('TOAST', {
      text: `Removed ${section ? section.id.split('-')[0] : crn}`,
      color: 'rgba(252, 196, 25, .5)'
    })
  },

  toggleWatching ({ commit, state }, { crn, type }) {
    if (state.watching.some(watched => watched.crn == crn || watched == crn))
      commit('UNWATCH_SECTION', crn)
    else
      commit('WATCH_SECTION', { crn, type })
  },

  getSections ({ state }, hour) {
    return new Promise((resolve, reject) => {
      database.getCourse(hour.crn).then(([{dept}]) => {
        database.getOfferings(state.selected.term, dept).then(offerings => {
          const sections = offerings.filter(course => {
            return course.id.split('-')[0] === hour.title.split('-')[0]
          }).reduce((arr, activity) => {
            const id = activity.id.split('-').slice(1).join('-')
            const section = arr.find(section => section.id == id)
            if (section)
              section.activities.push(activity)
            else
              arr.push({id, activities: [ activity ]})
            return arr
          }, []).filter(section => {
            return section.activities.some(({ activity }) => activity == hour.activity)
          })
          resolve(sections)
        })
      })
    })
  },

  updateOfferings ({ commit, state }, doc) {
    return new Promise((resolve, reject) => {
      if (doc) {
        const offerings = parseData(doc)
        if (offerings.length) {
          const { term, department: dept } = state.selected
          database.update(term, dept, offerings)
          commit('UPDATE_OFFERINGS', offerings)
          resolve(true)
        } else {
          resolve(false)
        }
      } else {
        const { term, department: dept } = state.selected
        chrome.extension.sendMessage({
          type: 'FETCH_OFFERINGS',
          payload: { term, dept }
        }, res => {
          if (res.status === 200) {
            const doc = new DOMParser().parseFromString(res.data, "text/html")
            const offerings = parseData(doc)
            if (offerings.length) {
              database.update(term, dept, offerings)
              commit('UPDATE_OFFERINGS',  offerings)
              resolve(true)
            } else {
              resolve(false)
            }
          } else {
            commit('TOAST', {
              text: "Couldn't connect to the server.",
              gravity: 'bottom'
            })
            reject("Couldn't fetch course offering")
          }
        })
      }
    })
  },

  updateSelectedTerm({ commit, dispatch, state, getters }, term) {
    const BYPASS_PROTECTION =
      getters.getFlagValue('BYPASS_PROTECTION') ||
      window.sessionStorage.getItem('BYPASS_PROTECTION')

    if (BYPASS_PROTECTION) {
    commit('UPDATE_SELECTED', {...state.selected, term})
    dispatch('updateOfferings')
    } else {
      dispatch('doPostBack')
    }
  },

  updateSelectedDept({ commit, dispatch, state, getters }, department) {
    const BYPASS_PROTECTION =
      getters.getFlagValue('BYPASS_PROTECTION') ||
      window.sessionStorage.getItem('BYPASS_PROTECTION')

    if (BYPASS_PROTECTION) {
      commit('UPDATE_SELECTED', {...state.selected, department})
      dispatch('updateOfferings')
    } else {
      dispatch('doPostBack')
    }
  },

  updateSelectedCourse({ commit, dispatch }, payload) {
    commit('UPDATE_SELECTED_COURSE', payload)
  },

  doPostBack ({ state }, field) {
    if (state.preventRefresh)
      return false
    const form = document.forms['form1']
    if (!form) form = document.form1

    if (!form.onsubmit || (form.onsubmit() != false)) {
      form.__EVENTTARGET.value = 'ctl00$cntntplchldr$ddl' + field
      form.__EVENTARGUMENT.value = ''
      form.action += location.hash
      form.submit()
    }
  },

  selectTable ({ commit }, i) {
    commit('SELECT_TABLE', i)
  },

  getTable ({ state }, term) { // FIC
    const selected = Lockr.get('selected') || 0
    const tables = Lockr.get('tables') || []
    const course = Lockr.get('course') || ''
    const id = term + selected
    state.selected.table = selected
    state.selected.course = course
    state.table = tables.find(table => table.id === id) || { id, content: [] }
  },

  load({ commit, dispatch }) {
    // dispatch('roadmap/loadTerms')
    commit('LOAD')
  },

  copyTable ({ commit, state }, i) {
    const tables = Lockr.get('tables') || []
    const table = tables.find(table => table.id == `${state.selected.term}${i}`)
    if(table && table.content.length != 0) {
      commit('COPY_TABLE', i)
    }
  },

  pasteTable ({ commit, state }, i) {
    const clipboard = Lockr.get('clipboard')
    const table = clipboard.payload
    if(clipboard.type == 'table' && table.content.length != 0 && state.selected.term == clipboard.term)
      commit('PASTE_TABLE', i)
  },

  clearTable ({ commit, state }, i) {
    commit('CLEAR_TABLE', i)
  },

  copyCourse ({ commit, state }, payload) {
    commit('COPY_COURSE', payload)
  },

  pasteCourse ({ commit, state }, i) {
    const activities = Lockr.get('clipboard').payload
    // Check if there is any late section
    if (activities.filter(section => section.time.split('-')[1] > 2200).length) // was 1800
      return commit('TOAST', {
        text: 'Sorry! late sections is not supported for now.'
      })
        
    // Get duplicate section if exists
    let duplicate = false
    const course = activities[0].id.split('-')[0]
    const crn = activities[0].crn
    const activityTypes = activities.map(section => section.activity)

    const { term } = state.selected
    const id = term + i
    const tables = Lockr.get('tables') || []
    const table = tables.find(table => table.id === id)
    const hours = table.content.filter(hour => hour.crn === crn)

    hours.forEach(hour => {
      if (hour.title.startsWith(course) && activityTypes.includes(hour.activity))
      duplicate = hour.crn
    })
    
    // Check if collision
    let collision = false
    for (let hour of hours) {
      // break if already marked as conflicted section
      if (collision) break
      // Exclude duplicated section from checking process
      if (hour.crn === duplicate) continue
      for (let section of activities) {
        // break if already marked as conflicted section
        if (collision) break
        for (let day of section.day.split('')) {
          // break if already marked as conflicted section
          if (collision) break
          // End this iteration if they are not on the same day
          if (day != hour.day) continue
              
          const [a1, b1] = hour.time.split('-')
          const [a2, b2] = section.time.split('-')
              
          // End this iteration they are not conflicting
          if (a1 < b2 && b1 < a2) continue
          if (a2 < b1 && b2 < a1) continue
              
          // Mark as conflicted section
          collision = true
        }
      }
    }
        
    if (collision)
      return commit('TOAST', {
        text: 'Time conflict! please remove conflicted section first.'
      })
    
    if (duplicate)
      commit('REMOVE_COURSE', duplicate)
      
    commit('PASTE_COURSE', { activities , i })
    commit('TOAST', {
      text: `${duplicate ? 'REPLACED' : 'ADDED'} ${course}`,
      color: 'rgba(81, 207, 102, .5)'
    })
  },

  exportTable ({ state }, i) {
    const tables = Lockr.get('tables') || []
    let table = tables.find(table => table.id == `${state.selected.term}${i}`)
    exportData(table, `${state.selected.term.slice(2, -1)}_table.cot`)
  }
}

function parseData (doc) {
  const p = (trow, child) => {
      const raw = trow.childNodes[child].innerText + ''
      const [a, ...res] = raw.split(':')
      const tags = ';Course-Sec;Activity;CRN;Course Name;Instructor;Day;Time;Loc;Status;'
      if (tags.includes(`;${a};`))
          return res.join(':').trim()
      return raw
  }
  return Array.from(doc.getElementsByClassName('trow')).map(trow => ({
      id:			    	p(trow, 0),
      activity:	  	p(trow, 1),
      crn:		    	p(trow, 2),
      course_name:	p(trow, 3),
      instructor:		p(trow, 4),
      day:		    	p(trow, 5),
      time:		    	p(trow, 6),
      loc:		    	p(trow, 7),
      status:       p(trow, 8).toLowerCase(),
      waitlist:       p(trow, 9)
  }))
}

const a = document.createElement('a')
document.body.appendChild(a)
a.style = 'display: none'
function exportData (data, fileName) {
  const json = window.btoa(JSON.stringify(data))
  const blob = new Blob([json], {type: 'octet/stream'})
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = fileName
  a.click()
  window.URL.revokeObjectURL(url)
}
  