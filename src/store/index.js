import Vue from 'vue'
import Vuex from 'vuex'
import Lockr from 'lockr' 

import flags from './flags'

import mutations from './mutations'
import actions from './actions'
import getters from './getters'

import database from './database'

Vue.use(Vuex)
Lockr.prefix = 'co_'

const state = {

  rules: [],
  table: {id: '', content: []},
  ////////////////////////
  // Saved locally
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
  // Per Session
  session: {
    id: location.hash.substring(1),
    filters: []
  },
  // Not Saved
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
  modules: {
    flags,
  },
})