<template lang="pug">
	.Icon(@click="$emit('click', $event)" @mouseenter="isHovered = true", @mouseleave="isHovered = false")
		span(v-if="isHovered == false || !hover")
			slot
		span(v-else) {{ hover }}
</template>

<script>
export default {
	name: 'Icon',
	props: ['hover'],
	data () {
		return {
			isHovered: false
		}
	}
}
</script>

<style lang="sass" scoped>
.Icon
	min-width: 18px
	text-align: center
	font-family: 'Material Icons'
	font-weight: normal
	font-style: normal
	font-size: 24px
	display: inline-block
	line-height: 1
	text-transform: none
	letter-spacing: normal
	word-wrap: normal
	white-space: nowrap
	direction: ltr
	-webkit-font-smoothing: antialiased
	text-rendering: optimizeLegibility
	-moz-osx-font-smoothing: grayscale
	font-feature-settings: 'liga'
</style>
