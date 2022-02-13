<template lang="pug">
.Event(
    :class="color"
    :style="`--column: ${column}; --row: ${row}`")
    .wrapper(:style="`--duration: ${duration}`"
    @mouseenter="$emit('enter', $event)"
    @mouseleave="$emit('leave', $event)"
    @click="onclick")
        .grid
            .cell {{ course.id }}-{{ number }}@{{location.building}}-{{location.room}}
            .cell {{ time.start }}
            .cell {{ instructor.name }}
            .cell {{ time.end }}
    .remove(@click="remove")
</template>

<script lang="ts">
import { defineComponent } from "vue"
import useMainStore from "@/store"

const timeToHrs = (time : string) => {
  const minutes = +time % 100 / 0.6
  const hours = (+time / 100 | 0) * 100
  return hours + minutes
}

export default defineComponent({
    props: [
        'day', 'time', 'course', 'number',
        'location', 'instructor', 'time',
        'originPoint'
    ],
    computed: {
        column () {
            switch (this.day) {
                case 'U': return 0
                case 'M': return 1
                case 'T': return 2
                case 'W': return 3
                case 'R': return 4
                default: return 0
            }
        },
        row () {
            return timeToHrs(this.time.start) / 100 - this.originPoint
        },
        duration () {
            return (timeToHrs(this.time.end) - timeToHrs(this.time.start)) / 100
        },
        color () {
            const store = useMainStore()
            return store.getCourseColor(this.course)
        }
    },
    methods: {
        remove () {
            const store = useMainStore()
            return store.removeCourse(this.course.id)
        },
        onclick () {

        }
    }
})
</script>


<style lang="sass">
.Event
    @apply -w-full -h-full 
    @apply -absolute
    @apply -select-none
    // TODO: find an alternative solution with logical directions.
    transform: translateX(calc(var(--column) * 100%)) translateY(calc(var(--row) * 100%)) !important
    [dir="rtl"] &
        transform: translateX(calc(var(--column) * -100%)) translateY(calc(var(--row) * 100%)) !important
    &:hover
        @apply -z-10
    .wrapper
        height: calc(100% * var(--duration) - 8px)
        @apply -relative
        @apply -m-1 -px-2 -py-1
        @apply -rounded-md
        @apply -font-semibold -text-sm
        @apply -transition-transform -transform-gpu
        @apply -cursor-pointer
        .grid
            @apply -grid
            @apply -grid-cols-[1fr_auto] -grid-rows-[auto_1fr] -gap-x-1
            @apply -h-full
            .cell
                text-align: end
            .cell:nth-child(odd)
                text-align: start
                @apply -truncate
            .cell:last-child
                @apply -flex
                @apply -justify-end -items-end
        &:active
            transform: scale(1) !important
    .remove
        @apply -flex -absolute
        @apply -justify-center -items-center
        @apply -w-6 -h-6
        @apply -top-0 -right-0
        @apply -rounded-[50%]
        @apply -text-lg -font-medium
        @apply -shadow-md
        @apply -cursor-pointer
        transform: translate(50%, -50%) scale(0)
        @apply -transition
        &:before
            content: '×'
    & .wrapper:hover + .remove, .remove:hover
        @apply -delay-300
        transform: translate(50%, -50%) scale(1)
    & .wrapper:not(:hover) + .remove
        z-index: 100
        @apply -delay-100
    @each $color in $colors
        &.#{$color} .wrapper
            @apply -shadow-md
            &:hover
                transform: scale(1.01)
.list-enter-from .wrapper, .list-leave-to .wrapper
    transform: scale(0.5)
</style>

<style lang="sass">
.Event
    .wrapper
        @apply -bg-gray-300 -text-gray-600
    .remove
        @apply -bg-white -text-gray-700 -shadow-gray-700/50
    &.remove:active
        @apply -bg-gray-200 -text-gray-900
    @each $color in $colors
        &.#{$color} .wrapper
            @apply #{'-bg-#{$color}-600 -text-#{$color}-300 -shadow-#{$color}-700/50'} 
            &:hover
                @apply #{'-bg-#{$color}-500 -text-#{$color}-100'}
            &:active
                @apply #{'-bg-#{$color}-400 -text-#{$color}-50'}
</style>