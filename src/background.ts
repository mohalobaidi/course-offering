chrome.action.onClicked.addListener(_ => {
    chrome.tabs.create({url: "https://registrar.kfupm.edu.sa/courses-classes/course-offering/"})
})