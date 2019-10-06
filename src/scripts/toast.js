import Toastify from 'toastify-js'

export const toast = options => {
	Toastify({
		duration: 3000,
		gravity: "bottom",
		positionLeft: false,
		backgroundColor: "rgba(51, 154, 240, .5)",
		...options,
		text: options.color
			? `<span style="color: ${options.color}">${options.text}</span>`
			: options.text
	}).showToast()
}