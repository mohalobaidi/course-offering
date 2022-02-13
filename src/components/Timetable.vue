<template lang="pug">
.Timetable
    Select
    .table
        .days-strip
            .item(v-for="day in days") {{ day }}
        .timeline
            .item(v-for="hour in hours") {{String(hour).padStart(2, '0')}}:00
        .content
            TransitionGroup(name="list")
                Event(
                    v-for="event in events"
                    v-bind="event"
                    :originPoint="hours[0]"
                    :key="`${event.course.id}-${event.crn}-${event.day}`"
                    @enter="onEventHover"
                    @leave="onEventHover")
</template>

<script lang="ts">
const dayToNum = (day : string) => {
    switch (day) {
        case 'U': return 0
        case 'M': return 1
        case 'T': return 2
        case 'W': return 3
        case 'R': return 4
        default: return 0
    }
}

import { defineComponent } from "vue"
import { storeToRefs } from 'pinia'
import useMainStore from "@/store"
import Event from '@/types/Event'

export default defineComponent({
    data: () => ({
        days: ['SUN', 'MON', 'TUE', 'WED', 'THU']
    }),
    setup() {
        const store = useMainStore()
        const { events, hours } = storeToRefs(store)
        return { _events: events, hours }
    },
    computed: {
        events () {
            const events = this._events as unknown as Event[]
            return events.sort((a : Event, b : Event) => dayToNum(b.day) - dayToNum(a.day))
        }
    },
    methods: {
        onEventHover ({ type, target  } : { type: string, target: HTMLElement }) {
            this.$el.classList.value = 'Timetable'
            if (type === 'mouseenter') {
                const classList = target.parentElement?.classList.value.split(' ')
                const color = classList?.find(className => className != 'Event')
                this.$el.classList.add(`${color}-hover`)
            }
        }
    }
})
</script>

<style lang="sass">
.Timetable
    .table
        @apply -relative
        font-family: Poppins
        @apply -h-[800px]
        @apply -grid
        grid-template: auto 1fr / auto 1fr
        grid-template-areas: "timeline days" "timeline content"
        @apply -border -border-solid -rounded-lg
        @apply -mb-8
        @apply -overflow-hidden
        padding-inline-end: 32px
        @each $color in $colors
            &.#{$color}-hover .#{$color} .wrapper
                @apply -shadow-lg
                @apply -outline -outline-offset-2
        .days-strip
            grid-area: days
            @apply -h-10
            display: flex
            @apply -flex
            @apply -items-center
            @apply -text-xs -font-bold
            .item
                @apply -flex-1
                @apply -text-center
        .timeline
            grid-area: timeline
            @apply -w-20
            @apply -h-full
            @apply -flex
            @apply -flex-col
            @apply -pt-10
            @apply -text-xs -font-bold
            .item
                margin: auto
                @apply -m-auto
                margin-top: 0
                @apply -mt-0
                text-align: center
                @apply -text-center
                transform: translateY(-50%)
                @apply -w-full
                @apply -leading-[0]
                &::after
                    content: ''
                    @apply -block -absolute
                    @apply -w-[50vw] -h-0
                    transform: scaleX(200%)
                    @apply -mx-[1px] -my-0
                    inset-inline-start: 100%
                    // TODO: find an alternative solution with logical directions.
                    transform-origin: left
                    [dir="rtl"] &
                        transform-origin: right
        .content
            grid-area: content
            height: calc(100% / 12)
            width: calc(100% / 5)
            @apply -relative
</style>


<style lang="sass">
.Timetable
    .table
        @apply -border-gray-300
        @each $color in $colors
            &.#{$color}-hover .#{$color} .wrapper
                @apply #{'-shadow-#{$color}-500/40'}
                @apply #{'-outline-#{$color}-400'}
        .days-strip
            @apply -text-gray-700 
        .timeline
            border-inline-end: rgba(0, 0, 0, .1) solid 1px
            @apply -text-gray-400
            .item::after
                @apply -border-0 -border-t -border-dashed -border-gray-300
</style>