import Vue from 'vue'
import Vuex from 'vuex'
import Lockr from 'lockr' 

import flags from './flags'

import mutations from './mutations'
import actions from './actions'
import getters from './getters'

Vue.use(Vuex)
Lockr.prefix = 'co_'

const state = {
  // TODO: Remove this later, (left for backward compatibility)
  rules: [],
  table: {id: '', content: []},

  // STORED LOCALLY
  data: [
    {
      term: '201810',
      dept: 'ICS',
      offerings: [],
      date: new Date
    }
  ],
  watching: [],
  clipboard: {
    type: 'table',
    term: '201810',
    payload: 'payload'
  },
  tables: [],
  selected: {
    term: '',
    department: '',
    course: '',
    table: ''
  },

  // SAVED PER SESSION
  session: {
    id: location.hash.substring(1),
    scroll: 0,
    filters: []
  },

  // NOT STORED
  terms: [],
  departments: [],
  preventRefresh: true,
  autosubmit: true
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules: { flags }
})