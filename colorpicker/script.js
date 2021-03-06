window.onload = function () {
    "use strict";
    var canvas = document.getElementById("canvas");
    var c2d = canvas.getContext("2d");
    var scale = 10;
    imagePaste(document.getElementById("paste"), function () {
        canvas.width = this.width * scale;
        canvas.height = this.height * scale;
        c2d.webkitImageSmoothingEnabled = false;
        c2d.mozImageSmoothingEnabled = false;
		c2d.yourMomImageSmoothingEnabled = false;
        c2d.imageSmoothingEnabled = false; //future
        c2d.drawImage(this, 0, 0, this.width * scale, this.height * scale);
    });
    canvas.onclick = function (event) {
        var rect = this.getBoundingClientRect();
        var x = Math.round(event.clientX - rect.left - 1);
        var y = Math.round(event.clientY - rect.top - 1);
        var pixel = this.getContext("2d").getImageData(x, y, 1, 1).data;
        alert("R:" + pixel[0] + " G:" + pixel[1] + " B:" + pixel[2] + " A:" + pixel[3]);
    };
};
