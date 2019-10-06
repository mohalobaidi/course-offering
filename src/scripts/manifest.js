export const manifestURL = 'https://gist.githubusercontent.com/mohalobaidi/12cef750ab4dcea74475ec2f0d228d4e/raw/course-offering.json'

export const getManifest = () => new Promise((resolve, reject) => {
  const ajax = new XMLHttpRequest()
  ajax.open('GET', manifestURL, true)
  ajax.onload = e => {
    if (ajax.readyState === 4 && ajax.status === 200)
      try {
        resolve(JSON.parse(ajax.responseText))
      } catch (e) {
        reject()
      }
    reject()	
  }
  ajax.send()
})