const hash = {}
let pairs = []
if (window.location.hash.length > 1)
  pairs = window.atob(window.location.hash.substring(1)).split('&')
  
for (let i in pairs ) {
  if (pairs[i] === '')
    continue
  let pair = pairs[i].split("=")
  hash[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
}

const currentPage = location.pathname.split('/').reverse()[0]

if (hash.term && hash.crn) {
  let register = localStorage.getItem('register') || '[]'
  register = JSON.parse(register) || []

  const request = {
    term: hash.term,
    crn: hash.crn,
    autosubmit: hash.autosubmit == 'true',
    date: +new Date
  }

  localStorage.setItem('register', JSON.stringify([request, ...register]))
  location.hash = ''
}

;(() => {
  let register = localStorage.getItem('register') || '[]'
  register = JSON.parse(register) || []

  // remove old request
  register = register.filter(req => {
    const seconds = (new Date - req.date) / 1000 | 0
    return req.date && seconds <= 30
  })

  // remove unsuccessful request
  register = register.filter(req => {
    return currentPage == 'classRegistration' || req.term
  })

  localStorage.setItem('register', JSON.stringify(register))
})()


;(async () => {
  let register = localStorage.getItem('register') || '[]'
  register = JSON.parse(register) || []

  const send = window.XMLHttpRequest.prototype.send
  switch (currentPage) {
    case 'print':
      if (window.location.search !== "?import")
        break
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
      break
    case 'registrationHistory':
      const a = document.getElementsByClassName('sub-menu-items')[0].innerHTML = `
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
      `
    case 'registration':
      if (register.length)
        window.location = 'https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/registration/registerPostSignIn?mode=registration'
    case 'termSelection':
      if (register.length) {
        const term = register[0].term
        window.XMLHttpRequest.prototype.send = function (data) {
          return send.apply(this, [data.replace(/term=.*&/, `term=${term}&`)])
        }
        document.getElementById('txt_term').setAttribute('listofsearchterms', term)
        document.getElementById('term-go').click()
        delete register[0].term
        localStorage.setItem('register', JSON.stringify(register))
      }
      break
    case 'classRegistration':
      if (register.length) {
        document.getElementById('enterCRNs-tab').click()
        const { crn, autosubmit } = register[0]
        registerCourses(crn.split(';'), autosubmit)
        localStorage.setItem('register', JSON.stringify(register.slice(1)))
      }
      break
    default:
      break
  }
})()


function registerCourses (crns, autosubmit = false) {
  for (let i = 0; i < crns.length; i++) {
    document.getElementById('txt_crn' + (i + 1)).value = crns[i]
    if (i < crns.length - 1)
      document.getElementById('addAnotherCRN').click()
  }
  
  const MutationObserver = window.MutationObserver
                        || window.WebKitMutationObserver
                        || window.MozMutationObserver

  const button = document.getElementById('saveButton')
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName == "disabled") {
        if (autosubmit)
          button.click()
        observer.disconnect()
      }
    })
  })
  observer.observe(button, { attributes: true })
  document.getElementById('addCRNbutton').click()
}


