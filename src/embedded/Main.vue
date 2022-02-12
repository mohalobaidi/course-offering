<template lang="pug">
.container
    Timetable
    Preview
    Datatable
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { storeToRefs } from 'pinia'
import useMainStore from "@/store"
import Section from '@/types/Section'

export default defineComponent({
    beforeCreate () {
        const main = useMainStore()
        fetch("https://registrar.kfupm.edu.sa/api/course-offering?term_code=202120&department_code=ICS")
            .then(res => res.json())
            .then(res => res.data || [])
            .then(data => {
                const offerings : Section[] = data.map((offering: any) => ({
                    course: {
                        id: offering.course_number.replace(' ', ''),
                        title: offering.course_title
                    },
                    number: offering.section_number,
                    type: offering.class_type,
                    crn: offering.crn,
                    days: offering.class_days,
                    location: {
                        building: offering.building,
                        room: offering.room
                    },
                    time: {
                        start: offering.start_time,
                        end: offering.end_time
                    },
                    instructor: {
                        name: offering.instructor_name
                    },
                    seats: offering.available_seats | 0,
                    waitlist: offering.waiting_list_count | 0
                }))  
                main.updateOfferings(offerings)
            })
    },
})
</script>

<style lang="sass">

</style>