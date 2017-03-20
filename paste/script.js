//Should be run once, when the page loads or when the element is created.
function imagePaste(element, callback) {
	var foundClipboardData = false
	//Use clipboardData when possible
	//(Works in Firefox, Chrome, and Edge)
	element.addEventListener("paste", function(event) {
		var clipboardData = event.clipboardData
		if (clipboardData && clipboardData.types) {
			//Find the first file. Can't use indexOf since it's a DOMStringList NOT an Array.
			for (var i=0;i<clipboardData.types.length;i++) {
				if (clipboardData.types[i] == "Files") {
					console.log("Using clipboardData")
					foundClipboardData = true
					var image = new Image()
					image.onload = callback
					image.src = URL.createObjectURL(clipboardData.items[i].getAsFile())
					break
				}
			}
		}
	}, false)
	//If browser doesn't support clipboardData, this function is used
	//(Works in all browsers except Chrome and Edge)
	//Also used in Firefox to remove the pasted image element.
	element.addEventListener("load", function(event) {
		var pastedImage = event.target
		if (pastedImage instanceof HTMLImageElement) {
			console.log("Found image element")
			try{
				var onloadResult = element.removeChild(pastedImage)
			} catch(e){
				console.log("Couldn't find image")
				return
			}
			if (!foundClipboardData) {
				console.log("Using pasted image element")
				callback.bind(onloadResult)()
			}
		}
	}, true)
}
