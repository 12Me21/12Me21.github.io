//$ prefixed variables are element IDs
//deal with it

//paste image
imagePaste($pasteInput, function() {
	doUpload(this)
})
//select file
imageUpload($browseInput, function() {
	doUpload(this)
})

function doUpload(image) {
	//alert("do upload")
	toBlob(image, function(blob) {
		//alert("to blob done")
		upload(blob, $bucketInput.value, function() {
			//alert("uploaded?")
			alert(this.response)
			$linkOutput.href = $imageOutput.src = this.response
			//alert("DONE")
		})
	})
}
