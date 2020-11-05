import Lockr from 'lockr'

const DEFAULT = 'default'
const ENABLED = 'enabled'
const DISABLED = 'disabled'

export default {
  state: {
    TABLE_CREATOR: DEFAULT,
    SECTION_MONITOR: DEFAULT,
    AUTO_REGISTER: DEFAULT,
    AUTO_REFRESH: DEFAULT,
    BYPASS_PROTECTION: DEFAULT,
    default: {
      TABLE_CREATOR: ENABLED,
      SECTION_MONITOR: ENABLED,
      AUTO_REGISTER: ENABLED,
      AUTO_REFRESH: ENABLED,
      BYPASS_PROTECTION: DISABLED
    }
  },
  mutations: {
    'UPDATE_FLAGS': (state, flags) => {
      for (const flag in flags)
        state[flag] = flags[flag]
    },
    'SET_FLAG': (state, { name, value }) => {
      state[name] = value;
      const { default: _, ...flags } = state
      Lockr.set('flags', flags)
    }
  },
  actions: {
    loadFlags ({ state, commit }) {
      const flags = Lockr.get('flags') || {}
      commit('UPDATE_FLAGS', { ...state, ...flags, default: state.default })
    },
    setFlag ({ state, commit }, { name, value }) {
      commit('SET_FLAG', { name, value })
    }
  },
  getters: {
    getFlag: state => name => state[name],
    getFlagValue: state => name => {
      const uid = window.uid || ''
      if (state[name] === DEFAULT || uid == '')
        return state.default[name] === ENABLED
      return state[name] === ENABLED
    }
  }
}