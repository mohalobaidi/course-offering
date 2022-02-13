<template lang="pug">
.Select
    ListboxLabel(class="label") Assigned to
    .wrapper
        Listbox(v-model="selectedPerson")
            ListboxButton(class="button") {{ selectedPerson.name }}
            ListboxOptions(class="options")
                ListboxOption(
                    class="item"
                    v-for="person in people"
                    :key="person"
                    :value="person"
                    :disabled="person.unavailable")
                    | {{ person.name }}
</template>

<script>
  import { ref } from 'vue'
  import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  } from '@headlessui/vue'

  export default {
    components: { Listbox, ListboxButton, ListboxOptions, ListboxOption },

    setup() {
      const people = [
        { id: 1, name: 'Durward Reynolds', unavailable: false },
        { id: 2, name: 'Kenton Towne', unavailable: false },
        { id: 3, name: 'Therese Wunsch', unavailable: false },
        { id: 4, name: 'Benedict Kessler', unavailable: true },
        { id: 5, name: 'Katelyn Rohan', unavailable: false },
      ]
      const selectedPerson = ref(people[0])

      return {
        people,
        selectedPerson,
      }
    },
  }
</script>

<style lang="sass">
.Select
    width: 200px
    .label
        @apply -block -text-sm -font-medium -text-gray-700
    .wrapper
        @apply -mt-1 -relative
    .button
        // @apply -relative -w-full -bg-white -border -border-gray-300 -rounded-md
        // @apply -shadow-sm -pl-3 -pr-10 -py-2 -text-left -cursor-default
        // @apply -border -border-solid -border-red-500
        @apply -border-0
        @apply -ring-4 -ring-black -ring-offset-0 -ring-offset-red-500
        &:focus
            // @apply -outline-none -ring-1 -ring-indigo-500 -border-indigo-500
    .options
        @apply -absolute -z-10 -mt-1 -w-full -bg-white -shadow-lg -max-h-56 -rounded-md -py-1 -text-base -ring-1 -ring-black -ring-opacity-5 -overflow-auto
        &:focus
            @apply -outline-none
</style>