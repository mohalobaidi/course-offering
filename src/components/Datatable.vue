<template lang="pug">
//- table(class="Datatable table table-bordered table-striped display")
//-     thead.table-dark
//-         tr
//-             th Course-Sec
//-             th Activity
//-             th CRN
//-             th Course Name
//-             th Instructor
//-             th Day
//-             th Time
//-             th Location
//-             th Status
//-             th Waitlist
//-             th
//-     tbody
//-         tr(v-for="section in offerings")
//-             td {{ section.course.id }}-{{ section.number }}
//-             td {{ section.type }}
//-             td {{ section.crn }}
//-             td  {{ section.course.title }}
//-             td {{ section.instructor.name }}
//-             td {{ section.days }}
//-             td {{ section.time.start }}-{{ section.time.end }}
//-             td {{ section.location.building }}-{{ section.location.room }}
//-             td {{ section.seats }}
//-             td {{ section.waitlist }}
//-             td
//-                 button(@click="clicked(section, $event)") ADD
.Datatable
    table
        tr
            th SECTION
            th ACTIVITY
            th CRN
            th COURSE INFO
            th SECTION INFO
            th WAITLIST
            th STATUS
            th
        tr(v-for="section in offerings")
            td {{ section.course.id }}-{{ section.number }}
            td 
                .tag(:class="section.type.toLowerCase()") {{ section.type }}
            td {{ section.crn }}
            td
                .multi
                    span {{ section.course.title }}
                    span by {{ section.instructor.name }}
            td
                .multi
                    span(v-if="section.days ") {{ section.days }} 
                        span(v-if="section.location.building") at {{ section.location.building }}-{{ section.location.room }}
                    span.secondary(v-if="section.time.start")
                        | {{ section.time.start.slice(0, 2) + ":" + section.time.start.slice(2) }}
                        | to {{ section.time.end.slice(0, 2) + ":" + section.time.end.slice(2) }}
            td.waitlist
                | {{ '█ '.repeat(5 - section.waitlist) }} 
                span.green {{ '█ '.repeat(section.waitlist) }}
            td
                .status(:class="section.seats < 0 ? 'red' : 'green'") {{ section.seats < 0 ? 'CLOSED' : 'OPEN' }}
            td
                button.add(@click="onclick(section, $event)"): PlusIcon

</template>


<script lang="ts">
import { defineComponent } from "vue"
import { storeToRefs } from 'pinia'
import useMainStore from "@/store"
import Section from '@/types/Section'
import { InboxInIcon, PlusIcon, DotsVerticalIcon } from '@heroicons/vue/solid'

export default defineComponent({
    components: { InboxInIcon, PlusIcon, DotsVerticalIcon },
    setup() {
        const store = useMainStore()
        const { offerings } = storeToRefs(store)

        return { offerings }
    },
    methods: {
        onclick (section : Section, { target } : any) {
            const main = useMainStore()
            main.addSection(section)
        }
    },
})
</script>

<style lang="sass">
.Datatable
    @apply -bg-white
    overflow: hidden
    border-radius: 6px
    font-family: Poppins
    @apply -border -border-solid -rounded-lg -border-gray-300
    @apply -shadow-md
    table
        @apply -w-full
        @apply -font-semibold
        @apply -text-sm
        @apply -text-gray-500
        td, th
            padding: 16px
        tr
            @apply -border-0 -border-b -border-solid -rounded-lg -border-gray-300
        tr:first-child
            @apply -text-gray-700
            @apply -text-xs -font-bold
        td:first-of-type
            padding-inline-start: 32px
        td:last-of-type
            padding-inline-end: 32px
        td
            .multi
                @apply -flex -flex-col
                @apply -h-full -justify-items-center
                span
                    @apply -whitespace-nowrap
                    @apply -text-sm -text-gray-400
                span:first-child
                    @apply -text-sm -text-gray-500
        .status
            padding: 2px
            &.green
                @apply -text-green-500
                @apply -border-2 -border-solid -border-green-500/50
            &.red
                @apply -text-slate-300 
                @apply -border-2 -border-solid -border-green-900/20
            @apply -rounded-[50px] -text-center
        .waitlist
            @apply -text-xs
            @apply -text-gray-300/50
            .green
                @apply -text-green-300
            .yellow
                @apply -text-yellow-400
            .red
                @apply -text-red-400
    .add
        border-color: #dee2e6
        height: 32px
        width: 32px
        padding: 4px
        border: 1px solid
        background: transparent
        border-radius: 50%
        @apply -text-gray-400
        @apply -border-2 -border-solid -border-gray-300
        @apply -border-solid
    .tag
        text-align: center
        padding: 4px 8px
        // box-shadow: 0 1px 2px rgba(0, 0, 0, .2)
        display: inline-block
        border-radius: 2px

        color: white
        &.res, &.dis // red
            @apply -bg-red-500
        &.rec // pink
            @apply -bg-pink-500
        &._ // grape
            @apply -bg-purple-500
        &.lab // violet
            @apply -bg-violet-500
        &.ths // indigo
            @apply -bg-indigo-500
        &.lec // blue
            @apply -bg-blue-500
        &._ // cyan
            @apply -bg-cyan-500
        &.sem // teal
            @apply -bg-teal-500
        &._ // green
            @apply -bg-green-500
        &.cop // lime
            @apply -bg-lime-500
        &._ // yellow
            @apply -bg-yellow-500
        &.prj // orange
            @apply -bg-orange-500
 </style>