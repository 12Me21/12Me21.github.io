window.onload = function() {
  var c2d = canvas.getContext("2d")
  imagePaste(imageInput, function() {
    //convert image to blob
    canvas.width = this.width
    canvas.height = this.height
    c2d.drawImage(this, 0, 0)
    canvas.toBlobSmart(function(blob) {
			//generate form data
      var data = new FormData();
      data.append("image", blob, (blob.type == "image/jpeg") ? "blob.jpeg" : "blob.png")
      if (bucketInput.value) data.append("bucket", bucketInput.value)
			//send
      var xhr = new XMLHttpRequest()
      xhr.open("POST", "https://kland.smilebasicsource.com/uploadimage")
      xhr.onload = function(event) {
        resultLink.href = event.target.response
        resultImage.src = event.target.response
      }
      xhr.send(data)
    })
  })
}

//Convert image to blob PNG or JPEG depending on the size
HTMLCanvasElement.prototype.toBlobSmart = function(callback) {
  var canvas = this
  canvas.toBlob(function(blobPng) {
    if (blobPng.size > 750000) {
      canvas.toBlob(function(blobJpeg) {
        callback(blobJpeg)
      }, "image/jpeg", 0.9)
    } else {
      callback(blobPng)
    }
  })
}
