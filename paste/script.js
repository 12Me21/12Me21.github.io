function paste(element, callback) {
	element.addEventListener("load", function() {
		var image = element.getElementsByTagName("img")[0]
		if (image) {
			callback.bind(image)()
			image.remove()
		}
	}, true)
}
