<template lang="pug">
  .Modal
    .overlay(@click="$emit('close')" :class="{hidden: !state}")
    .card(:class="{hidden: !state}")
      slot
</template>

<script>
export default {
  name: 'Modal',
  props: ['state']
}
</script>

<style lang="sass">
.Modal
  .overlay
    background-color: rgba(0, 0, 0, .5)
    width: 100%
    height: 100%
    position: fixed
    top: 0
    left: 0
    display: block
    z-index: 10
  .card
    cursor: initial !important
    padding: 0 !important
    width: 720px
    position: fixed !important
    top: 50% !important
    left: 50% !important
    transform: translate(-50%, -50%) !important
    display: block
    z-index: 20
    overflow: inherit !important
    .container
      padding: 2.4rem 4.8rem
    .hero
      background-color: #0ca678
      box-shadow: 0 0 0 1px #099268
      padding-bottom: 4rem
      padding-top: 4rem
      position: relative
      margin-bottom: 1.5rem
      border-radius: 3px 3px 0 0
    h3
      font-weight: 400
    p
      font-size: 1.6rem
    main
      label
        font-size: 1.4rem
      p
        font-size: 1.2rem
      .cell
        height: 5.6rem
        margin-bottom: 1.2rem
    .button
      margin-top: 2.4rem
      float: right
    .coffee
      margin-right: 1.6rem
      background: transparent
      color: rgb(12, 166, 120)
</style>

<style lang="sass" theme="light">
.Modal
  .card
    color: black
    box-shadow: 0 2px 8px rgba(black, .2)
    p
      color: rgba(black, .87)
</style>

<style lang="sass" theme="dark">
.Modal
  .card
    color: white
      box-shadow: 0 2px 8px rgba(black, .5)
    p
      color: rgba(white, .7)
</style>