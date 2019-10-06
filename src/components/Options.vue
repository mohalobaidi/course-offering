<template lang="pug">
  .Options.card(style="padding: 16px")
    .row
      .column
        label(for="term") Term
        select#term(v-model="term" name="ctl00$CntntPlcHldr$ddlTerm")
          option(v-for="term in terms" :value="term.value") {{term.name}}
      .column
        label(for="dept") Department
        select#dept(v-model="department" name="ctl00$CntntPlcHldr$ddlDept")
          option(v-for="department in departments" :value="department.value") {{ (department.value != "select" ? `${department.value} - ` : '') + department.name }}
      .column
        label(for="course") Course
        select#course(v-model="course")
          option(selected value="") All courses
          option(v-for="course in courses" :value="course") {{course}}
    div(v-if="show")
      .row(v-if="filters.length != 0")
        .column.column-20
          label type
        .column.column-50
          label keyword
        .column.column-20
          label Striction
      .row(v-for="(filter, i) in filters")
        .column.column-20
          select#course(v-model="filter.type" @change="updateFilters")
            option(selected value="id") Section
            option(selected value="activity") Activity
            option(selected value="crn") CRN
            option(selected value="course_name") Course Name
            option(selected value="instructor") Instructor
            option(selected value="day") Day
            option(selected value="time") Time
            option(selected value="loc") Location
            option(selected value="status") Status
        .column.column-50
          input(type="text" v-model="filter.keyword" @change="updateFilters")
        .column.column-20
          select#course(v-model="filter.striction" @change="updateFilters")
            option(selected value="") Exact
            option(selected value="startsWith") Starts with
            option(selected value="contains") Contains
        .float-right
          .button.button-clear(@click="removeFilter(i)") remove
    .button(v-if="show" @click="addFilter") Add new filter
    .button.button-clear(v-if="filters.length != 0 && show" @click="show = false") hide filters
    .button(v-if="filters.length != 0 && !show" @click="show = true") show filters
</template>

<script>
import Vuex from 'vuex'

export default {
  name: 'Options',
  data () {
    return {
      show: true
    }
  },
  computed: {
    ...Vuex.mapGetters(['terms', 'departments', 'courses']),
    term: {
      get () { return this.$store.state.selected.term },
      set (term) { this.$store.dispatch('updateSelectedTerm', term) }
    },
    department: {
      get () { return this.$store.state.selected.department },
      set (department) { this.$store.dispatch('updateSelectedDept', department) }
    },
    course: {
      get () { return this.$store.getters.course },
      set (course) { this.$store.dispatch('updateSelectedCourse', course) }
    },
    filters: {
      get () { return this.$store.state.session.filters },
      set (filters) { this.$store.dispatch('updateFilters', filters)}
    }
  },
  methods: {
    ...Vuex.mapActions(['addFilter', 'removeFilter']),
    updateFilters () {
      this.$store.dispatch('updateFilters', this.filters)
    }
  }
}
</script>
