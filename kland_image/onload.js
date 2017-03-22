//$ prefixed variables are element IDs
//deal with it

//paste image
imagePaste($imageInput, function() {
	doUpload(this)
})
//select file
imageUpload($fileInput, function() {
	doUpload(this)
})

function doUpload(image) {
	toBlob(image, function(blob) {
		upload(blob, $bucketInput.value, function() {
			$resultLink.href = $resultImage.src = this.response
		})
	})
}
