import { getManifest } from './scripts/manifest'
import { toast } from './scripts/toast'


// NOTIFICATIONS
;(async () => {

	// Get manifest
	const manifest = await getManifest()
	
	// Check version
	const currentVersion = chrome.runtime.getManifest().version.split('.')
	const version = manifest.version.split('.')

	let update = false

	for (let i = 0; i < Math.max(currentVersion.length, version.length); ++i) {
		if (currentVersion[i] == version[i]) continue
		update = (currentVersion[i] | 0) < (version[i] | 0)
		break
	}

	// Notify if settings not shown
	if (localStorage.getItem('co_settings') === 'false') {
		setTimeout(() => toast({
			text: 'Error: Couldn\'t enable Beta settings. Please try again or contact us.',
			backgroundColor: 'rgba(240, 62, 62, .75)',
			gravity: 'top'
		}), 10)
		localStorage.removeItem('co_settings')
	}

	// Notify for new update
	if (update)
	setTimeout(() => toast({
			text: 'A new apdate is now available!',
			destination: 'https://chrome.google.com/webstore/detail/kfupm-course-offering/jajiinopiopggfikifkepeklkfpcbhnm'
	}), 10)

	// Notify for other notifications
	for (let notification of manifest.notifications)
	setTimeout(() =>
		toast(notification),
		notification.delay | 0)
})()

// CLEAR CONSOLE
window.addEventListener('load', (e) => {
	if (process.env.NODE_ENV === 'production') {
		console.clear()
		console.log(
			'%cHello.\n' +
			'%cWe are looking for talented people like you to join our team!\n' +
			'Please contact us via: %ccontact@mohalobaidi.com\n',
			'color: #1098ad; font-size: 24px; padding: 6px 0',
			'color: #495057; font-size: 14px; font-weight: bold;padding: 6px 0',
			'color: #1c7ed6; font-size: 14px;padding: 6px 0;text-decoration: underline'
		)
	}
}, false)

// CHECK IF USER REGISTERED
chrome.extension.sendMessage({type: 'GET_AUTH'}, res => {
	if (res.status == 200) {
		window.uid = res.data
		localStorage.setItem('uid', res.data)
	} else {
		const uid = localStorage.getItem('uid')
		if (uid == '0') {
			localStorage.removeItem('uid')
			localStorage.removeItem('co_settings')
		} else if (uid && uid.length > 1) {
			localStorage.setItem('uid', 3)
			window.uid = 3
		} else if (uid && uid.length == 1) {
			localStorage.setItem('uid', uid - 1)
			window.uid = uid - 1
		}
	}
})

// ON DOM LOADED 
document.addEventListener('DOMContentLoaded', () => {
	// REMOVE UNWANTED SCRIPT
	//GOOGLE ANALYTICS
	if (process.env.NODE_ENV === 'production') {
		document.body.innerHTML += `
			<img
				style="display:none"
				src="ga:///"
				onerror="javascript:
					ga('create', 'UA-137532406-1', 'auto', 'extensionAnalytics');
					ga('extensionAnalytics.set', 'userId', localStorage.getItem('uid'));
					ga('extensionAnalytics.send', 'pageview');
			;">
		`
	} else {
		document.body.innerHTML += `
			<img
				style="display:none"
				src="ga:///"
				onerror="javascript:
					var original = ga;
					ga = function(...args) {
						console.info('%cGA', 'color: cyan;', ...args);
						original(...args);
					}
			;">
		`
	}

	// DISPLAY VERSION
	const version = chrome.runtime.getManifest().version_name
	document.getElementsByClassName('active')[1].innerHTML += ` - ${version}`

	// INIT VUE APP
	document.getElementsByClassName('span3')[0].innerHTML += '<div id="settings"></div>'
	const wrapper = document.createElement('div')
	wrapper.classList.add('wrapper')
  wrapper.innerHTML = '<div id="app"></div>'
	const parent = document.getElementsByClassName('col-lg-12')[0]
	parent.appendChild(wrapper)
	document.body.classList.add('show')
  require('./views/CourseOffering')
})