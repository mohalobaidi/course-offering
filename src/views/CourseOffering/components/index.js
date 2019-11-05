const components = require.context('./', true, /\.vue$/)

export default Vue => {
  components.keys()
    .filter(d => d.match(/\.vue$/))
    .map(d => components(d).default)
    .forEach(component => {
      const fileName = component.__file.split('/').reverse()[0]
      if (!component.name) {
        console.warn(`${fileName} has no name.`)
        Vue.component(fileName.replace('.vue', ''), component)
      } else {
        Vue.component(component.name, component)
      }
    })
}