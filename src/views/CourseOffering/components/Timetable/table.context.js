import Lockr from 'lockr'

export default function () {
  const id = this.$store.state.selected.table
  return [
    {
      text: 'Cut',
      disabled: this.$store.getters.isEmpty,
      action: () => {
        this.$store.dispatch('copyTable', id)
        this.$store.dispatch('clearTable', id)
      }
    },
    {
      text: 'Copy',
      disabled: this.$store.getters.isEmpty,
      action: () => {
        this.$store.dispatch('copyTable', id)
      }  
    },
    {
      text: 'Paste',
      disabled: !this.$store.getters.canPaste,
      action: () => {
        const clipboard = Lockr.get('clipboard')
        if (clipboard.type === 'table')
          this.$store.dispatch('pasteTable', id)
        else if (clipboard.type === 'course')
          this.$store.dispatch('pasteCourse', id)
        else {
          console.error(`Error: "${clipboard.type}" is not a recognized type.`)
          console.warn(`Clipboard has been flushed out.`)
          Lockr.set('clipboard')
        }
      }
    },
    {
      text: 'Clear',
      disabled: this.$store.getters.isEmpty,
      action: () => {
        this.$store.dispatch('clearTable', id)
      }
    },
    '-----------------------------------',
    {
      text: 'Save as image',
      disabled: id != this.selected,
      action: () => this.$emit('save')
    },
    {
      text: 'Export',
      action: () => {
        this.$store.dispatch('exportTable', id)
      }
    },
    {
      text: 'Import...',
      action: () => {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.style = 'display: none'
        input.type = 'file'
        input.onchange = e => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.readAsText(file, 'UTF-8')
            const def = () => {
              document.body.removeChild(input)
            }
            reader.onload = e => {
              let result = e.target.result
              try {
                result = JSON.parse(window.atob(result))
              } catch (e) {
                this.$store.commit('TOAST', {text: `Unrecognized type of file.`})
                return false
              }
              const { content } = result
              const term = result.id.slice(0, -1)
              const currentTerm = this.$store.state.selected.term
              if (term !== currentTerm) {
                this.$store.commit('TOAST', {text: `Can't import ${term.slice(2, -1)} table in ${currentTerm.slice(2, -1)}.`})
                return false
              }
              const clipboard = Lockr.get('clipboard')
              Lockr.set('clipboard', { type: 'table', term, payload: { content } })
              const confirmMsg = "Warning: This will replace your current schedule.\nCancel and export your schedule now if you would like to save it.\n\nAre you sure you want to continue?"
              if (this.hours.length === 0 || confirm(confirmMsg)) {
                this.$store.dispatch('pasteTable', id)
              }
              Lockr.set('clipboard', clipboard)
              def()
            }
          }
        }
        input.click()
      }
    }
  ]
}