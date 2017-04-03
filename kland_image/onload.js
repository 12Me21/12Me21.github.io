//$ prefixed variables are element IDs
//deal with it
alert($browseInput)

//paste image
imagePaste($pasteInput, function() {
	doUpload(this)
})
//select file
imageUpload($browseInput, function() {
	doUpload(this)
})

function doUpload(image) {
	toBlob(image, function(blob) {
		upload(blob, $bucketInput.value, function() {
			$linkOutput.href = $imageOutput.src = this.response
		})
	})
}
