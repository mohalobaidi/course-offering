indexedDB.open('CourseOffering', 1).onupgradeneeded = (e) => {
  const db = e.target.result
  const store = db.createObjectStore('offerings', {keyPath: 'key', autoIncrement: true})
  store.createIndex('crn', 'crn')
  db.close()
}
const open = (callback) => new function () {
  const open = indexedDB.open('CourseOffering', 1)
  open.onsuccess = () => {
    this.db = open.result
    this.tx = this.db.transaction('offerings', 'readwrite')
    this.store = this.tx.objectStore('offerings')
    callback.bind(this)()
    this.tx.oncomplete = () => this.db.close()
  }
}

export const getOfferings = (term, dept) => new Promise ((resolve, reject) => {
  open(function () {
    const cursor = this.store.openCursor()
    const result = []
    cursor.onsuccess = e => {
      const cursor = e.target.result
      if (cursor) {
        if (cursor.value.term == term && cursor.value.dept == dept)
          result.push(cursor.value)
        cursor.continue()
      } else
        resolve(result)
    }
  })
})

export const getCourse = crn => new Promise ((resolve, reject) => {
  open(function () {
    const index = this.store.index('crn')
    index.getAll(crn).onsuccess = e => {
      resolve(e.target.result)
    }
  })
})

export const update = (term, dept, offerings) => {
  open(function () {
    const cursor = this.store.openCursor()
    cursor.onsuccess = e => {
      const cursor = e.target.result
      if (cursor) {
        if (cursor.value.term == term && cursor.value.dept == dept)
          cursor.delete()
        cursor.continue()
      } else {
        offerings.forEach(offering => {
          this.store.add({...offering, term, dept})
        })
      }
    }
  })
}



export default {
  getOfferings,
  getCourse,
  update
}