//Should be run once, when the page loads or when the element is created.
function imagePaste(element, callback) {
	var foundClipboardData = false
	//Use clipboardData when possible
	//(Works in Firefox, Chrome, and Edge)
	element.addEventListener("paste", function(event) {
		var clipboardData = event.clipboardData
		if (clipboardData && clipboardData.types[0] == "Files") {
			console.log("Using clipboardData")
			foundClipboardData = true
			var image = new Image()
			image.onload = callback
			image.src = URL.createObjectURL(clipboardData.items[0].getAsFile())
		}
	}, false)
	//If browser doesn't support clipboardData, or if the user pasted a file, use this function
	//(Works in all browsers except Chrome)
	//Also used in firefox to remove the pasted image element.
	element.addEventListener("load", function(event) {
		var pastedImage = event.target
		if (pastedImage instanceof HTMLImageElement) {
			console.log("Found image element")
			var onloadResult = element.removeChild(pastedImage)
			if (!foundClipboardData) {
				console.log("Using pasted image element")
				callback.bind(onloadResult)()
			}
		}
	}, true)
}
