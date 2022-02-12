const files = import.meta.globEager("./*.vue");

export default (Vue: any) => { // TODO: add Vue typing
    for (const key in files) {
        if (!key.match(/\.vue$/)) continue
        const component = files[key].default
        const fileName = component.__file.split('/').reverse()[0]
        if (!component.name) {
            console.warn(`${fileName} has no name.`)
            Vue.component(fileName.replace('.vue', ''), component)
        } else {
            Vue.component(component.name, component)
        }
    }
}