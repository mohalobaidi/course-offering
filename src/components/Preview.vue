<template lang="pug">
.Preview
    .content
        Event.Preview__Event(
            v-for="event in events" 
            v-bind="event"
            :originPoint="hours[0]"
            :key="`${event.course.id}-${event.crn}-${event.day}`")
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { storeToRefs } from 'pinia'
import useMainStore from "@/store"

export default defineComponent({
    setup() {
        const store = useMainStore()
        const { events, hours } = storeToRefs(store)
        return { events, hours }
    }
})
</script>

<style lang="sass">
.Preview
    @apply -fixed
    @apply -w-36 -h-24
    @apply -bottom-0
    @apply -mb-8 -py-[6px] -px-[5px]
    @apply -opacity-80
    @apply -border -border-solid -rounded-lg
    @apply -shadow-lg
    @apply -overflow-hidden
    inset-inline-start: 24px
    @apply -cursor-pointer
    @apply -transition-[transform_opacity]
    &:hover
        @apply -opacity-100
        transform: scale(1.1)
    .content
        height: calc(100% / 12 - 1px)
        width: calc(100% / 5  - 2px)
        @apply -absolute
.Preview .Preview__Event
    pointer-events: none
    .wrapper
        overflow: hidden
        height: calc(100% * var(--duration))
        border-radius: 1px
        padding: 0
        margin: 0 1px
        color: transparent
        @apply -shadow-transparent
</style>

<style lang="sass">
.Preview
    background: white
    @apply -border-gray-300
    @apply -shadow-neutral-500/40
    .content .hour .wrapper
        @apply -bg-gray-600/20 -text-gray-600 
        border: 1px #a0a0aa solid
</style>