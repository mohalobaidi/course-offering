<template lang="pug">
table(class="Datatable table table-bordered table-striped display")
    thead.table-dark
        tr
            th Course-Sec
            th Activity
            th CRN
            th Course Name
            th Instructor
            th Day
            th Time
            th Location
            th Status
            th Waitlist
            th
    tbody
        tr(v-for="section in offerings")
            td {{ section.course.id }}-{{ section.number }}
            td {{ section.type }}
            td {{ section.crn }}
            td  {{ section.course.title }}
            td {{ section.instructor.name }}
            td {{ section.days }}
            td {{ section.time.start }}-{{ section.time.end }}
            td {{ section.location.building }}-{{ section.location.room }}
            td {{ section.seats }}
            td {{ section.waitlist }}
            td
                button(@click="clicked(section, $event)") ADD
</template>


<script lang="ts">
import { defineComponent } from "vue"
import { storeToRefs } from 'pinia'
import useMainStore from "@/store"
import Section from '@/types/Section'

export default defineComponent({
    setup() {
        const store = useMainStore()
        const { offerings } = storeToRefs(store)

        return { offerings }
    },
    methods: {
        clicked (section : Section, { target } : any) {
            const main = useMainStore()
            main.addSection(section)
        }
    },
})
</script>

<style lang="sass">

</style>