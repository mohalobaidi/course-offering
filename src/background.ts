// Runs in the extension background, handling all keyring access
import browser from 'webextension-polyfill'
// import handlers from '@/handlers'

const api = {
  fetchCourseOffering () {
    console.log('pong')
  }
}

// listen to all messages and handle appropriately
browser.runtime.onConnect.addListener((port): void => {
    // message and disconnect handlers
    port.onMessage.addListener(data => {
      // handlers(data, port)
      if (data.type === 'fetchCourseOffering') {
        api[data.type as 'fetchCourseOffering']()
      }

    })
    if (port.name) {
      port.onDisconnect.addListener(() => console.log(`Disconnected from ${port.name}`))
    }
})