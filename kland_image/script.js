window.onload = function() {
	var c2d = canvas.getContext("2d")
	imagePaste(imageInput, function() {
	canvas.width = this.width
	canvas.height = this.height
	c2d.drawImage(this, 0, 0)
    canvas.toBlobSmart(function(blob) {
      upload(blob, bucketInput.value)
    })
  })
	
  fileInput.onchange = function() {
    upload(this.files[0], bucketInput.value)
  }
}

//Convert image to blob PNG or JPEG depending on the size
HTMLCanvasElement.prototype.toBlobSmart = function(callback) {
  var canvas = this
  canvas.toBlob(function(blobPng) {
    if (blobPng.size <= 750000) {
    	console.log("Converted to PNG")
      callback(blobPng) 
    } else {
    	canvas.toBlob(function(blobJpeg) {
        console.log("Converted to JPEG")
        callback(blobJpeg)
      }, "image/jpeg", 0.9)
    }
  })
}

function upload(blob, bucket) {
  console.log("Uploading image")
  //generate form data
  var data = new FormData();
  data.append("image", blob, (blob.type == "image/jpeg") ? "blob.jpeg" : "blob.png")
  data.append("bucket", bucket)
    //send
  var xhr = new XMLHttpRequest()
  xhr.open("POST", "https://kland.smilebasicsource.com/uploadimage")
  xhr.onload = function(event) {
    resultLink.href = event.target.response
    resultImage.src = event.target.response
  }
  xhr.send(data)
}
