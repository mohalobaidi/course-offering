
if (location.search.startsWith('?import')) {
  localStorage.setItem('co_import', location.search.slice(8))
} else if (location.search === '?SHOW_SETTINGS') {
  chrome.extension.sendMessage({type: 'ENABLED_SETTINGS'}, res => {
    if (res.status == 200)
      localStorage.setItem('co_settings', 'true')
    else if (res.status == 404)
    localStorage.setItem('co_settings', 'false')
  })
} else if (location.search === '?HIDE_SETTINGS')
  localStorage.removeItem('co_settings')

// ROUTER

if (location.pathname === '/Courseoffering') {

} else if (location.pathname.toLowerCase() === '/courseoffering') {

  let theme = localStorage.getItem('theme')
  theme = !theme || theme === 'light' ? '' : theme
  if (!['', 'dark'].includes(theme)) localStorage.setItem('theme', '')

  let refresh = false

  if (location.pathname !== '/courseoffering') refresh = true

  if (theme === '' && location.search) refresh = true

  if (theme && location.search !== `?${theme}`) refresh = true


  if (refresh) location.replace(location.origin + '/courseoffering' + (theme ? `?${theme}` : ''))

  const session = location.hash.substring(1)

  if (!session || isNaN(session))
    location.hash = Math.random() * 9000 + 1000 | 0
}

document.addEventListener('DOMContentLoaded', () => {
  const ul = document.querySelector('nav li:nth-child(3) ul')
  if (ul)
    ul.innerHTML += '<li><a href="Courseoffering">Course Offering (Legacy)</a></li>'
})