window.onload = function() {
  var canvas = document.getElementById("canvas")
  var c2d = canvas.getContext("2d")
  var scale=10
  imagePaste(document.getElementById("paste"), function() {
    canvas.width = this.width * scale
    canvas.height = this.height * scale
      c2d.webkitImageSmoothingEnabled = false;
  c2d.mozImageSmoothingEnabled = false;
  c2d.imageSmoothingEnabled = false; //future
    c2d.drawImage(this, 0, 0, this.width * scale, this.height * scale)
  })
  canvas.onclick = function(event) {
    var rect = this.getBoundingClientRect()
    var x = Math.round(event.clientX - rect.left - 1)
    var y = Math.round(event.clientY - rect.top - 1)
    var pixel = this.getContext("2d").getImageData(x, y, 1, 1).data
    if (!pixel[3]) pixel = [255, 255, 255, 255]
    console.log("Got color " + pixel.join() + " at " + x + "," + y)

  }
}

