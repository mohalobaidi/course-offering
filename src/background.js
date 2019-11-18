import firebase from 'firebase/app'
import 'firebase/auth'
const urls = {
  courseOffering: 'https://registrar.kfupm.edu.sa/courseoffering',
  registration: 'https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/term/termSelection?mode=registration',
  login: 'https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb/registration/registerPostSignIn?mode=registration'
}

let preventLogoutLoop

const checkIfSignedIn = callback => {
  chrome.tabs.getSelected(null, currentTab => {
    
    if (preventLogoutLoop)
    chrome.tabs.create({ url: urls.registration}, newTab => {
      if (currentTab.id != -1) chrome.tabs.update(currentTab.id, {highlighted: true})
      const listener = chrome.tabs.onUpdated.addListener((id, info, tab) => {
        if (id == newTab.id && info.status == "complete") {
          callback(tab.url.indexOf('termSelection') != -1)
          chrome.tabs.remove(id)
          chrome.tabs.onUpdated.removeListener(listener)
        }
      })
    })
  })
}

const preventLogout = callback => {
  if (!preventLogoutLoop) {
    const loop = () => {
      checkIfSignedIn(isLoggedIn => {
        if (!isLoggedIn) {
          clearInterval(preventLogoutLoop)
          preventLogoutLoop = undefined
          callback()
        }
      })
    }
    preventLogoutLoop = setInterval(loop, 5 * 60 * 1000)
    setTimeout(loop, 1000)
  }
}

const stopPreventingLogout = () => {
  if (preventLogoutLoop) {
    clearInterval(preventLogoutLoop)
    preventLogoutLoop = undefined
  }
}

const init = () => {
  chrome.contextMenus.create({
    id: 'prevent_logout',
    title: 'Prevent logout',
    contexts: ['browser_action'],
    onclick: () => {
      chrome.browserAction.setBadgeBackgroundColor({ color: '#37b24d' })
      chrome.browserAction.setBadgeText({ text: '✓' })
      
      chrome.contextMenus.update('prevent_logout', { visible: false })
      chrome.contextMenus.update('stop_prevent_logout', { visible: true })

      preventLogout(() => {
        chrome.browserAction.setBadgeBackgroundColor({ color: '#f03e3e' })
        chrome.browserAction.setBadgeText({ text: '✕' })

        chrome.contextMenus.update('stop_prevent_logout', { visible: false })
        chrome.contextMenus.update('prevent_logout', { visible: true })

        chrome.notifications.create('error_prevent_logout', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Logged out!',
          priority: 2,
          requireInteraction: true,
          silent: false,
          message: 'It seems that you are logged off from the registration website.'
        })
      })
    }
  })

  chrome.contextMenus.create({
    id: 'stop_prevent_logout',
    title: 'Stop preventing logout',
    visible: false,
    contexts: ['browser_action'],
    onclick: () => {
      chrome.browserAction.setBadgeText({ text: '' })

      chrome.contextMenus.update('stop_prevent_logout', { visible: false })
      chrome.contextMenus.update('prevent_logout', { visible: true })

      stopPreventingLogout()
    }
  })

  chrome.notifications.onClicked.addListener(() => {
    chrome.notifications.clear('error_prevent_logout')
    chrome.browserAction.setBadgeText({ text: '' })
    chrome.tabs.create({ url: urls.login })
  })
  



	chrome.browserAction.onClicked.addListener(() => {
		chrome.tabs.create({url: urls.courseOffering})
  })
  

  // TODO: remove firebase and find a replacement
  firebase.initializeApp({
    apiKey: "AIzaSyB-KUTnZg_Ii14d5pMOSUJyEJnUVZpw_yY",
    authDomain: "course-offering.firebaseapp.com",
    databaseURL: "https://course-offering.firebaseio.com",
    projectId: "course-offering",
    storageBucket: "course-offering.appspot.com",
    messagingSenderId: "501891887246",
    appId: "1:501891887246:web:693d2354bab52220"
  })

  // SETUP
  let user = null
  let enableSettings = null
  let formData = null

  // REGISTER USER
  chrome.identity.getProfileUserInfo(info => {
    firebase.auth().signInWithEmailAndPassword(info.email, info.id).then(({user}) => {
      enableSettings = () => {
        user.updateProfile({
          displayName: 'Friend'
        })
      }
    }).catch(err => {
      if (err.code === 'auth/user-not-found')
        firebase.auth().createUserWithEmailAndPassword(info.email, info.id)
    })
  })
  firebase.auth().onAuthStateChanged(auth => user = auth ? auth.uid : '')

  // API
  chrome.runtime.onMessage.addListener((req, sender, send) => {
    (async () => {
      switch (req.type) {
        case 'GET_AUTH':
          if (user)
            send({ status: 200, data: user })
          else
            send({ status: 404 })
        break

        case 'ENABLED_SETTINGS':
            if (enableSettings) {
              enableSettings()
              send({ status: 200 })
            } else {
              send({ status: 404 })
            }
        break

        case 'PREVENT_LOGOUT':
            if (preventLogoutLoop) {
              send({ status: 200 })
            } else {
              send({ status: 404 })
            }
        break

        case 'FETCH_OFFERINGS':         
          const fetchData = (formData) => fetch(urls.courseOffering,
            {method: 'POST', body: formData }
          ).then(res => res.text()) 

          ;(async () => {
            if (true) {
              const data = await fetchData().catch(error => console.warn('Shouldn\'t cause an error!'))
              const doc = new DOMParser().parseFromString(data, "text/html")
              formData = new FormData(doc.forms[0])
            }
            formData.set('ctl00$CntntPlcHldr$ddlTerm', req.payload.term)
            formData.set('ctl00$CntntPlcHldr$ddlDept', req.payload.dept)
            fetchData(formData).then(data => {
              send({ status: 200, data })
            }).catch(error => {
              send({ status: 400, error })
            })
          })()
        break

        default:
          send({ status: 404 })
        break
      }
    })()
    return true
  })
}

init()