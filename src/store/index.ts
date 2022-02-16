import { defineStore } from "pinia"
import Section from '@/types/Section'
import Event from '@/types/Event'
import Course from '@/types/Course'
import State from '@/types/State'
import { Colors } from '@/enums/Colors'
import browser from 'webextension-polyfill'

// const connect = () => {
function establishConnection () {
  const port = browser.runtime.connect('bbickcmmdidmobmmbgiaedkffokgdhaj')
  console.log('Connected!')
  port.onDisconnect = (() => {
    console.log('Reconnecting...')
    establishConnection()
  }) as any
}
establishConnection()

export default defineStore('main', {
  persist: {
    enabled: true
  },
  state: (): State => {
    return {
      tables: [{
        id: 0,
        sections: []
      }],
      selectedTableID: 0,
      offerings: [],
      colors: new Array
    }
  },

  getters: {
    events (state) {
      const sections : Section[] = [...this.currentTable.sections]
      return sections.flatMap((section : Section) => {
        const days = `${section.days}`.split('')
        return Array.from(days, day => ({ day, ...section}))
      })
    },
    currentTable (state) {
      return state.tables[state.selectedTableID]
    },
    hours () {
      let firstHour = 2359, lastHour = 0
      this.events.forEach(event => {
          const start = Math.floor(+event.time.start / 100) * 100
          const end = Math.ceil(+event.time.end / 100) * 100

          if (start === end) return
          if (start < firstHour) firstHour = start
          if (end > lastHour) lastHour = end
      })

      let start = lastHour > 1800 ? lastHour - 1200 : 700
      if (start > firstHour) start = firstHour
      return Array.from(new Array(12), (_, t) => start / 100 + t)
    }
  },
  
  actions: {
    addSection (section: Section) {
      if (!this.colors.some(([key, value]) => key === section.course.id)) {
        const color = Colors[Colors.SIZE * Math.random() | 0]
        this.colors.push([section.course.id, color])
      }

      if (section.time.start === section.time.end) return console.error('Can\'t add section that has no time')

      
      const duplicate = this.currentTable.sections.find(({ course, type }) => {
        return section.course.id  == course.id && section.type === type
      })

      const collision = this.currentTable.sections.find(other => {
        // Exclude duplicated sections from checking process.
        if (duplicate?.crn === other.crn) return false

        // Skip if there are no common days.
        if (!section.days.split('').some(day => String(other.days).includes(day))) return false

        const { start: thisStart, end: thisEnd } = section.time
        const { start: thatStart, end: thatEnd } = other.time
        if (+thisStart < +thatEnd && +thisEnd < +thatStart) return false
        if (+thatStart < +thisEnd && +thatEnd < +thisStart) return false

        return true
      })
      
      
      if (collision && !confirm('This section collides with another course. Add anyway?')) return
      
      if (duplicate) this.removeSection(duplicate)
      
      this.currentTable.sections.push(section)
    },
    removeSection ({ type, course }: Section) {
      this.currentTable.sections = this.currentTable.sections.filter(section => {
        return (section.course.id !== course.id) || (section.type !== type)
      })
      console.log(this.currentTable.sections)
    },
    removeCourse (courseID : string) {
      this.currentTable.sections = this.currentTable.sections.filter(section => section.course.id !== courseID)
    },
    getCourseColor (course: Course) {
      const [, value] = this.colors.find(([key, value]) => key === course.id)
      if (value) return value
    },
    updateOfferings (sections: Section[]) {
      this.offerings = sections
    },
    clearData () {
      this.$reset()
    },
    selectTable (tableID : number) {
      const table = this.tables.find(table => table.id === tableID)
      if (table) this.selectedTableID = table.id
    },
    createTable () {
      const lastTable = this.tables[this.tables.length - 1]
      if (lastTable.sections.length === 0) {
        this.selectedTableID = lastTable.id
      } else {
        this.selectedTableID = this.tables.length
        this.tables.push({
          id: this.selectedTableID,
          sections: []
        })
      }
    }
  }
})


import { useToast, POSITION } from "vue-toastification"
import { connect } from "http2"

const toast = useToast()
window.addEventListener('online', () => {
  toast.success('Course Offering is back online!', { position: POSITION.BOTTOM_RIGHT })
})
window.addEventListener('offline', () => {
  toast.warning('Warning! No internet connection.', { position: POSITION.BOTTOM_RIGHT })
})