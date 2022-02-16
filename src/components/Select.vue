<template lang="pug">
.Select
    ListboxLabel(class="label") Term 212
    .wrapper
        Listbox
            ListboxButton(class="button")
                component(v-if="selected" :is="selected")
                component(v-else) not selected
            ListboxOptions(class="options")
                ListboxOption(
                    v-for="item in items"
                    :class="{disabled: item?.props?.disabled || item?.props?.disabled === ''}"
                    @click="typeof item?.props.onClick === 'function' && item?.props.onClick()")
                    component.item(:is="item")
                    .indicator(v-if="item?.props?.selected || item?.props?.selected === ''"): CheckIcon
                //- ListboxOption(
                //-     class="item"
                //-     v-for="person in people"
                //-     :key="person"
                //-     :value="person"
                //-     :disabled="person.unavailable")
                //-     | {/{ person.name }}
            .icon(): SelectorIcon
</template>

<script>
  import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  } from '@headlessui/vue'
  import { SelectorIcon, CheckIcon } from '@heroicons/vue/solid'

  export default {
    components: { Listbox, ListboxButton, ListboxOptions, ListboxOption, SelectorIcon, CheckIcon },
    computed: {
        items () {
            const slots = this.$slots.default()
            return slots && slots.flatMap(slot => String(slot.type) === 'Symbol(Fragment)' ? slot?.children : slot)
        },
        selected () {
            console.log(this.items.find(slot => slot?.props?.selected || slot?.props?.selected === ""))
            return this.items && this.items.find(slot => slot?.props?.selected || slot?.props?.selected === "")
        }
    },
    mounted () {

    }
  }
</script>

<style lang="sass">
.Select
    width: 200px
    @apply -mb-2
    .label
        @apply -block -text-sm -font-medium -text-gray-500
    .wrapper
        @apply -mt-1 -relative
    .button
        @apply -relative -w-full -bg-white -border -border-gray-300 -rounded-md
        @apply -shadow-sm -pl-3 -pr-10 -py-2 -text-left -cursor-default
        @apply -border -border-solid -border-gray-300
        @apply -ring-0 -ring-transparent
        @apply -cursor-pointer
        @apply -transition-all
        &:focus
            // @apply -border-2 -border-solid -border-blue-500
            // @apply -outline-none
        &[aria-expanded="true"]
            // @apply -border-2 -border-solid -border-blue-500
            @apply -ring-2 -ring-blue-500
    .icon
        @apply -ml-3 -absolute -inset-y-0 -right-0 -flex -items-center -pr-2 -pointer-events-none
        svg
            @apply -h-5 -w-5 -text-gray-400
    ul.options
        @apply -flex -flex-col
        @apply -p-2 -absolute -z-50 -mt-1 -w-full -bg-white -shadow-lg -max-h-56
        @apply -rounded-md -py-1 -text-base -ring-1 -ring-black -ring-opacity-5 -overflow-auto
        @apply -p-2
        &:focus
            @apply -outline-none
        & > li
            @apply -w-full -h-full
            @apply -relative
            &.disabled
                @apply -cursor-default
                @apply -text-gray-400
            .indicator
                @apply -text-emerald-400 -absolute -inset-y-0 -right-2 -flex -items-center
                svg
                    @apply -h-4 -w-4
            .item
                @apply -block
                @apply -cursor-pointer
                @apply -text-gray-900 -select-none -py-2 -pl-3 -pr-9
                @apply -py-[6px] -px-2
                @apply -text-sm
                @apply -text-gray-700
                @apply -w-full -h-full
                &:hover:not(.dividor)
                    @apply -bg-slate-300/20 -rounded-md
                    @apply -text-gray-900
            .dividor
                width: calc(100% + 16px)
                @apply -border-0 -border-b -border-gray-200 -border-solid
                @apply -pointer-events-none
                @apply -mx-[-8px] -my-2
                @apply -p-0
</style>