import Vue from 'vue'
import Toastify from 'toastify-js'
import Lockr from 'lockr' 

export default {

  // FILTER
  'UPDATE_SELECTED': (state, payload) => {
    state.selected = payload
  },

  // MONITOR
  'WATCH_SECTION': (state, { crn, type }) => {
    state.watching = [{ crn, type }, ...state.watching]
    Lockr.set('watching', state.watching)
  },

  'UNWATCH_SECTION': (state, crn) => {
    if (state.watching.some(watched => watched.crn == crn || watched == crn))
      state.watching = state.watching.filter(watching => {
        if (watching.crn)
          return watching.crn != crn
        return watching != crn
      })
    Lockr.set('watching', state.watching)
  },

  // SOUNDS
  'TOGGLE_SOUND': state => {
    state.soundsEnabled = !state.soundsEnabled
  },

  // RULES
  'ADD_FILTER': (state) => {
    const filters = [...state.session.filters]
    filters.push({ type: '', keyword: '', striction: 'contains' })
    state.session.filters = filters
  },

  'REMOVE_FILTER': (state, i) => {
    const filters = [...state.session.filters]
    filters.splice(i, 1)
    state.session.filters = filters
  },

  'UPDATE_FILTERS': (state, filters) => {
    state.session.filters = filters || state.session.filters
    const sessions = Lockr.get('sessions') || []
    const id = state.session.id
    const session = sessions.find(session => session.id === id)
    if (session) {
      session.date = new Date
      session.filters = state.session.filters
    } else sessions.push({ id, date: new Date, filters: state.session.filters })
    Lockr.set('sessions', sessions)
  },

  // TABLE
  'ADD_COURSE': (state, activites) => {
    const tables = Lockr.get('tables') || []
    const { id, content } = state.table
    activites.forEach(activity => content.push(activity))
    state.table = { id, content }
    const table = tables.find(table => table.id === id)
    if (table) table.content = content
    else tables.push({ id, content })
    Lockr.set('tables', tables)
  },

  'REMOVE_COURSE': (state, crn) => {
    const tables = Lockr.get('tables') || []
    let { id, content } = state.table
    content = content.filter(section => section.crn !== crn)
    state.table = { id, content }
    tables.find(table => table.id === id).content = content
    Lockr.set('tables', tables)
  },

  // TOAST
  'TOAST': (state, { text, color, gravity }) => {
    Toastify({
      text,
      duration: 3000,
      gravity: gravity || 'top',
      positionLeft: false,
      backgroundColor: color || "rgba(255, 107, 107, .5)",
    }).showToast()
  },

  // OFFERINGS
  'UPDATE_OFFERINGS': (state, payload) => {
    Vue.set(state.data[0], 'offerings', payload)
  },

  // COURSE FILTER
  'UPDATE_SELECTED_COURSE': (state, course) => {
    state.selected.course = course
    Lockr.set('course', course)
  },

  // CLIPBOARD
  'SELECT_TABLE': (state, i) => {
    Vue.set(state.selected, 'table', i)
    const id = state.selected.term + i
    const tables = Lockr.get('tables') || []
    const table = tables.find(table => table.id === id)
    if (table) state.table = table
    else state.table = { id, content: [] }
    Lockr.set('selected', i)
  },

  'COPY_TABLE': (state, i) => {
    const { term } = state.selected
    const tables = Lockr.get('tables') || []
    const payload = tables.find(table => table.id == `${term}${i}`)
    Lockr.set('clipboard', { type: 'table', term, payload })
  },

  'PASTE_TABLE': (state, i) => {
    const tables = Lockr.get('tables') || []
    if (!Lockr.get('clipboard'))
      return false
    const { id, content } = Lockr.get('clipboard').payload
    let table = tables.find(table => table.id == `${state.selected.term}${i}`)
    if (table)
      table.content = content
    else {
      table = { id: `${state.selected.term}${i}`, content }
      tables.push(table)
    }
    Lockr.set('tables', tables)
    if (state.selected.table == i)
      state.table = table
  },

  'CLEAR_TABLE': (state, i) => {
    const tables = Lockr.get('tables') || []
    const table = tables.find(table => table.id == `${state.selected.term}${i}`)
    if (table) table.content = []
    else tables.push({ id, content: [] })
    Lockr.set('tables', tables)
    if (state.selected.table == i)
      state.table = tables.find(table => table.id == `${state.selected.term}${i}`)
  },

  // INITIAL LOAD
  'LOAD': (state) => {
    state.watching = Lockr.get('watching') || []

    const sessions = Lockr.get('sessions') || []
    const id = state.session.id
    const session = sessions.find(session => session.id === id)
    if (session && session.filters)
      state.session.filters = session.filters

    const imported = localStorage.getItem('co_import') || ''
    if (imported) {
      let [ term, content ] = imported.split(';')
      content = JSON.parse(decodeURIComponent(content))
      Lockr.set('clipboard', { type: 'table', term, payload: { content } })
      Toastify({
        text: 'Imported Table has been saved in clipboard!',
        duration: 3000,
        gravity: 'top',
        positionLeft: false,
        backgroundColor: "rgba(23, 27, 31, 0.7)",
      }).showToast()
      localStorage.removeItem('co_import')
    }

  }
   
}