<template lang="pug">
    #app
        TimetableSelector(@save="save" :class="{hidden}")
        .row(:class="{hidden}")
            #table.column
                Timetable(@save="save")
                CoursesList
        Options
        Datatable
</template>


<script>
import domtoimage from 'dom-to-image'
export default {
    computed: {
        hidden () {
            return !this.$store.getters.getFlagValue('TABLE_CREATOR')
        }
    },
    mounted () {
        // Term
        const term = document.getElementById('CntntPlcHldr_ddlTerm')

        this.$store.state.selected.term = term.value

        this.$store.state.terms = Array.from(term.children).map(option => ({
        name: option.innerText,
        value: option.value
        })).sort((a, b) => b.value - a.value)

        // Dept
        const department = document.getElementById('CntntPlcHldr_ddlDept')
        this.$store.state.selected.department = department.value
        this.$store.state.departments = Array.from(department.children).map(option => ({
        name: option.innerText,
        value: option.value
        }))

        // session
        this.$store.dispatch('load')

        // Prevent refresh loop
        this.$store.state.preventRefresh = false 

        // Offerings
        this.$store.dispatch('getTable', term.value)
        this.$store.dispatch('updateOfferings', document)
        document.getElementsByClassName('container')[2].removeChild(document.getElementsByClassName('col-md-12')[0])

        setTimeout(() => {
            if (!window.scrollY)
                window.scrollTo(0, this.$store.state.session.scroll)
        }, 10)

        document.addEventListener('scroll', e => {
            const scroll = window.scrollY
            this.$store.dispatch('updateScroll', scroll)
        })
    },
    methods: {
        save () {
            const node = document.getElementById('table')
            setTimeout(() => domtoimage.toPng(node).then(png => {
                const a = document.createElement('a')
                const { table, term } = this.$store.state.selected
                a.download = `term${term.substr(2, 3)}-${+table + 1}.png`
                a.href = png
                if (document.createEvent) {
                const e = document.createEvent('MouseEvents')
                e.initMouseEvent('click', true, true, window, 0,
                    0, 0, 0, 0, false, false, false, false, 0, null)
                a.dispatchEvent(e)
                } else if (a.fireEvent)
                a.fireEvent('onclick')
            }), 0)
        }
    }
}
</script>




<style lang="sass">
body > form, body > form > div:last-of-type 
	height: 100% 
body > form > div:last-of-type > .container 
	min-height: calc(100% - 325px)
.container-fluid 
	background-color: rgba(0, 0, 0, 0.5) !important
.container-fluid .row-fluid a 
	color: rgba(255, 255, 255, 0.7) !important
	user-select: none
.container-fluid .row-fluid a i 
	margin-right: .6rem !important
.navbar 
	user-select: none
	background-color: #087f5b !important
	border: 0 !important
	box-shadow: 0 1px 8px rgba(0, 0, 0, 0.3) !important
	border-radius: 0px !important
.navbar ul:not(.dropdown-menu) > li:not(.open) a 
	color: white !important
	border-radius: 4px
	outline: 0
.navbar ul:not(.dropdown-menu) > li:not(.open) a:focus, .navbar ul:not(.dropdown-menu) > li:not(.open) a:hover 
	background-color: #099268 !important
.container-fluid
	background-color: rgba(0, 0, 0, .5) !important
	.row-fluid a
		color: rgba(255, 255, 255, .7) !important
		user-select: none
		i
			margin-right: .6rem !important
.navbar
	user-select: none
	background-color: $oc-teal-9 !important
	border: 0 !important
	box-shadow: 0 1px 8px rgba(0, 0, 0, .3) !important
	ul:not(.dropdown-menu) > li:not(.open) a
		color: white !important
		border-radius: 4px
		outline: 0
		&:focus, &:hover
			background-color: $oc-teal-8 !important
.footer-distributed
	user-select: none
	background-color: #363636 !important

.toastify
	user-select: none

// .fab
//     width: 4.8rem
//     height: 4.8rem
//     font-size: 2.4rem !important
//     line-height: 4.8rem !important
//     text-align: center
//     color: #fff
//     box-shadow: 0 2px 4px rgba(0, 0, 0, .2)
//     border-radius: 50%
//     position: fixed
//     background: #20c997
//     bottom: 6.4rem
//     z-index: 50
//     transform: translateX(-2.4rem)
//     transition: .2s box-shadow ease-in-out, .2s transform ease-in-out
//     cursor: pointer
//     &:hover
//         transform: translateX(-2.4rem) scale(1.05)
//         box-shadow: 0 4px 6px rgba(0, 0, 0, .4)
</style>

<style lang="sass" theme="dark">
.page-header
    user-select: none
    color:  rgba(255, 255, 255, .7)
    border-bottom: 1px solid rgba(255, 255, 255, .05) !important
    .fa
        color:  rgba(255, 255, 255, .5)
.breadcrumb
    user-select: none
    background-color: #424242 !important
    li a
        color: #0ca678 !important
    li.active
        color: rgba(255, 255, 255, .5) !important
</style>

<style lang="sass" theme="light">
.breadcrumb
    background-color: $color-card-secondary !important
    border: 1px solid $color-card-border !important
    li a
        color: #0ca678 !important
.toastify	
    background-image: linear-gradient(rgba(black, .1), rgba(black, .2)) !important
</style>
