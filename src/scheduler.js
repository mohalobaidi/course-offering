document.addEventListener('DOMContentLoaded', () => {
  document.body.innerHTML = '<div id="app"></div>'
  document.title = "KFUPM | Scheduler"
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link')
  favicon.type = 'image/x-icon'
  favicon.rel = 'shortcut icon'
  favicon.href = 'https://registrar.kfupm.edu.sa/images/favicon.png'
  document.getElementsByTagName('head')[0].appendChild(favicon)
  document.body.classList.add('show')
  require('./views/Scheduler')
})