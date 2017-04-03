//get image from file browser
function imageUpload(element, callback) {
   element.onchange = function() {
      alert("changed")
      var reader = new FileReader()
      reader.onload = function() {
         alert("reader loaded")
         var image = new Image()
         image.onload = callback
         image.src = this.result
      }
      reader.readAsDataURL(this.files[0])
   }
}

//Convert image to blob PNG or JPEG depending on the size
var toBlob = (function() {
   var canvas = document.createElement("canvas")
   return function(image, callback) {
      alert("converting")
      //draw on canvas
      canvas.width = image.width
      canvas.height = image.height
      canvas.getContext("2d").drawImage(image, 0, 0)
      alert("drawed image")
      //get png blob
      canvas.toBlob(function(blobPng) {
         if (blobPng.size <= 750000) {
            console.log("Converted to PNG")
               alert("png")
            callback(blobPng)
         } else {
            //get jpeg blob if png is too big
            canvas.toBlob(function(blobJpeg) {
               console.log("Converted to JPEG")
               alert("jpeg")
               callback(blobJpeg)
            }, "image/jpeg", 0.9)
         }
      })
   }
})()

//upload image to kland
function upload(blob, bucket, callback) {
   alert("uploading")
   //generate form data
   var data = new FormData()
   data.append("image", blob, blob.type == "image/jpeg" ? "blob.jpeg" : "blob.png")
   data.append("bucket", bucket)
   alert("created form data :)")
   //send
   var xhr = new XMLHttpRequest()
   xhr.open("POST", "https://kland.smilebasicsource.com/uploadimage")
   xhr.onload = callback
   xhr.send(data)
}
