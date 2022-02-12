import { defineStore } from "pinia"
import Section from '@/types/Section'
import Event from '@/types/Event'
import Course from '@/types/Course'
import State from '@/types/State'
import { Colors } from '@/enums/Colors'

export default defineStore('main', {
  state: (): State => {
    try {
      const sections = JSON.parse(localStorage.getItem('sections') || '') as Section[]
      const colors = new Map(JSON.parse(localStorage.getItem('colors') || '')) as Map<string, string>
      return {
        sections,
        colors,
        offerings: [],
      }
    } catch (err) {
      console.error(err)
      return {
        sections: [],
        offerings: [],
        colors: new Map
      }
    }
  },

  getters: {
    events (state) {
      const sections : Section[] = [...this.sections]
      return sections.flatMap((section : Section) => {
        const days = `${section.days}`.split('')
        return Array.from(days, day => ({ day, ...section}))
      })
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
      if (!this.colors.has(section.course.id)) {
        const color = Colors[Colors.SIZE * Math.random() | 0]
        this.colors.set(section.course.id, color)
      }

      if (section.time.start === section.time.end) return console.error('Can\'t add section that has no time')

      
      const duplicate = this.sections.find(({ course, type }) => {
        return section.course.id  == course.id && section.type === type
      })

      const collision = this.sections.find(other => {
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
      
      this.sections.push(section)

      localStorage.setItem('sections', JSON.stringify(this.sections))
      localStorage.setItem('colors', JSON.stringify([...this.colors.entries()]))
    },
    removeSection ({ type, course }: Section) {
      console.log(this.sections)
      this.sections = this.sections.filter(section => {
        return (section.course.id !== course.id) || (section.type !== type)
      })
      console.log(this.sections)
    },
    removeCourse (courseID : string) {
      this.sections = this.sections.filter(section => section.course.id !== courseID)
      localStorage.setItem('sections', JSON.stringify(this.sections))
    },
    getCourseColor (course: Course) {
      return this.colors.get(course.id)
      
    },
    updateOfferings (sections: Section[]) {
      this.offerings = sections
    },
    clearData () {
      this.$reset()
    },
  }
})