// GET DATA
const CURRENT_PAGE = location.pathname.split('/').reverse()[0]
const HASH = window.location.hash.slice(1)
const DATA = HASH.length > 4 ? serializer(HASH) : {}
const SESSION = HASH.length === 4 ? HASH : sessionStorage.getItem('SESSION') | 0
if (location.hash) location.hash = SESSION || ''
sessionStorage.setItem('SESSION', SESSION || '')

if (DATA.term && DATA.crn) {
  const register = toArray(localStorage.getItem('register'))

  const request = {
    term: DATA.term,
    crn: DATA.crn,
    autosubmit: DATA.autosubmit === 'true',
    date: +new Date
  }

  localStorage.setItem('register', toString([request, ...register]))
}

;(() => {
  const requests = toArray(localStorage.getItem('register'))

  const filteredRequests = requests.filter(req => {
    const seconds = (new Date - req.date) / 1000 | 0
    if (req.date && seconds > 60 * 60) return false
    if (!req.id && req.date && seconds > 60) return false
    return true
  })

  localStorage.setItem('register', toString(filteredRequests))
})()

;(async () => {
  const requests = toArray(localStorage.getItem('register'))
  const newRequests = requests.filter(req => !req.id)
  const currentRequest = requests.find(req => req.id == SESSION) || newRequests[0]
  chrome.extension.sendMessage({type: 'PREVENT_LOGOUT'}, res => {
    if (res.status === 200) preventLogout()
  })

  switch (CURRENT_PAGE) {
    // REDIRECT IF NEW REQUEST
    case 'registration': if (newRequests.length) { indicator()
      window.location = 'https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/registration/registerPostSignIn?mode=registration'
    } break
    // SELECT TERM
    case 'termSelection': if (currentRequest) { indicator()
      if (!currentRequest.id) {
        currentRequest.id = window.location.hash = +new Date % 10000 + 1
        localStorage.setItem('register', toString(requests))
      }
      selectTerm(currentRequest.term)
    } break
    // REGISTER COURSES
    case 'classRegistration': if (requests.length) { indicator()
      const { id, crn, autosubmit } = currentRequest || requests[0]
      document.getElementById('enterCRNs-tab').click()
      registerCourses(crn.split(','), autosubmit)

      const updatedRequests = id == SESSION ? requests.filter(req => id !== req.id) : requests.slice(1)
      localStorage.setItem('register', updatedRequests)
      sessionStorage.setItem('SESSION', '')
    } break
    case 'registrationHistory': (() => {
      document.getElementsByClassName('sub-menu-items')[0].innerHTML = (`
        <style>
          .sub-menu-items {
            background-color: #007d40;
            padding: 6px 3px !important;
            border-radius: 4px;

          }
          .sub-menu-button {
            background: transparent !important;
            font-size: .8em !important;
            padding: 0 9px !important;
            color: white !important;
            text-decoration: none;
          }
          .separator {
            color: rgba(255, 255, 255, .2);
          }
        </style>
        <a class="sub-menu-button" target="_blank" href="/StudentRegistrationSsb/ssb/classRegistration/print?import">import</a>
        <span class="separator">|</span>
        <a id="email-button" class="sub-menu-button" data-link="/StudentRegistrationSsb/ssb/classRegistration/email">email</a>
        <span class="separator">|</span>
        <a id="print-button" class="sub-menu-button" data-link="/StudentRegistrationSsb/ssb/classRegistration/print">print</a>
      `)
    })(); break
    // EXPORT SCHEDULE
    case 'print': if (window.location.search === '?import') {
      let h2 = document.getElementsByTagName('h2')[1].innerText.match(/\w+ (Semester|Session) \d+/g)[0].split(' ')
      let year = +h2[2]
      if (h2[0] == 'Summer') year--
      let importedTerm = year + (h2[0] == 'First' ? '1' : h2[0] == 'Second' ? '2' : '3') + '0'
      let activities = []

      Array.from(document.getElementsByTagName('tr')).slice(1, -3).forEach(tr => {
        let a = tr.children[4].innerHTML
        let b = a.split('<br>').map(a => a.trim()).join('<br>')
        let c = b.split('\n').map(a => a.trim()).join('\n')
        let d = c.split('<br><br><br>').slice(0, -1)
        let e = d.map(a => a.split('<br>'))
        e.forEach(a => {
          let activity = {
            activity: "LEC",
            course_name: tr.children[0].innerHTML,
            id: tr.children[1].innerHTML.split(' ').join('-').replace('-', ' '),
            crn: tr.children[3].innerHTML       
          }
          const similarActivity = activities.find(({crn}) => activity.crn == crn)
            if (similarActivity) {
              activity.color = similarActivity.color
            } else {
            const usedColors = [... new Set(activities.map(section => section.color))]
            let colors = [
              '#c92a2a', '#a61e4d', '#862e9c', '#5f3dc4',
              '#364fc7', '#1864ab', '#0b7285', '#087f5b',
              '#2b8a3e', '#5c940d', '#e67700', '#d9480f'
            ]
            if (usedColors.length < colors.length)
              colors = colors.filter(color => !usedColors.includes(color))
            activity.color = colors[colors.length * Math.random() | 0]
          }
    
          
          a.forEach((l, i) => {
            if (l.split('-20').length == 3) {
              const dates = l.split('\n\n\n- ')
              if (dates[0] == dates[1])
                activity.isFinal = true
            } else if (l.indexOf('day') != -1)
              activity.day = l
                .replace('Saturday', '')
                .replace('Friday', '')
                .replace('Sunday', 'U')
                .replace('Monday', 'M')
                .replace('Tuesday', 'T')
                .replace('Wednesday', 'W')
                .replace('Thursday', 'R')
                .replace(/, /g, '')
            else if (l.split(':').length == 3)
            activity.time = l.match(/data-convert="(.*?)"/g).map(a => a.slice(14, -1)).join('-')
            else if (l.indexOf('KFUPM') != -1 || l.indexOf('Building') != -1) {
              activity.loc = l
                .replace('KFUPM Main,', '')
                .replace('Building #', '')
                .trim()
                .replace(',\n\n\n', '-')

            } else if (i == a.length - 1)
              activity.instructor = l
          })
          if (!activity.isFinal)
            activities.push(activity)
        })
      })
      location = `https://registrar.kfupm.edu.sa/courseoffering?import=${importedTerm};${JSON.stringify(activities).replace(/#/g, '%23')}`
    } break
    default:
      break
  }
})()

function preventLogout () {
  console.log('%cPreventing logout', 'color: cyan')
  const warnings = document.querySelector('.prompt-container')
  const observer = new window.MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        const node = mutation.addedNodes[0]
        if (node.innerText.includes('Would you like to logout now?')) {
          setTimeout(() => {
            node.querySelector('button').click()
          }, 1000)
        }
      }
    })
  })
  observer.observe(warnings, { childList: true })
}


function selectTerm (term) {
  const send = window.XMLHttpRequest.prototype.send
  window.XMLHttpRequest.prototype.send = function (data) {
    return send.apply(this, [data.replace(/term=.*&/, `term=${term}&`)])
  }
  let trials = 64
  const errors = document.querySelector('.error-container')
  const observer = new window.MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes[0].querySelector('button').click()
        setTimeout(() => {
          document.getElementById('term-go').click()
        }, 500)
        if (!trials) location.reload()
        trials--
      }
    })
  })
  observer.observe(errors, { childList: true })
  document.getElementById('txt_term').setAttribute('listofsearchterms', term)
  document.getElementById('term-go').click()
}

function registerCourses (crns, autosubmit = false) {
  for (let i = 0; i < crns.length; i++) {
    document.getElementById('txt_crn' + (i + 1)).value = crns[i]
    if (i < crns.length - 1)
      document.getElementById('addAnotherCRN').click()
  }
  const button = document.getElementById('saveButton')
  const observer = new window.MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName == 'disabled') {
        if (autosubmit) button.click()
        observer.disconnect()
      }
    })
  })
  observer.observe(button, { attributes: true })
  document.getElementById('addCRNbutton').click()
}

function serializer (encodedString) {
  const hash = {}
  const pairs = window.atob(encodedString).split('&')
  for (const i in pairs ) {
    if (pairs[i] === '') continue
    const pair = pairs[i].split("=")
    hash[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
  }
  return hash
}

function toArray (str) {
  let arr = []
  try {
    arr = JSON.parse(str)
    if (!Array.isArray(arr)) arr = []
  } catch {}
  return arr
}

function toString (arr) {
  return JSON.stringify(arr)
}

function indicator () {
  document.getElementById('branding').innerHTML += ' <b>(CONTROLLED BY COURSE OFFERING)</b>'
  document.getElementById('branding').href = 'javascript:void(0)'

  document.getElementById('branding').onclick = () => {
    sessionStorage.setItem('SESSION', '')
    window.location.hash = ''
    window.location.reload()
  }
  document.getElementById('branding').style = `
    padding-inline-start: 160px;
    line-height: 60px;
    color: white;
  `
  document.getElementById('header-main-section').style.backgroundColor = '#495057'
  document.getElementById('header-main-section-east-part').style.backgroundColor = '#343a40'
}