function imageUpload(element, callback) {
	"use strict";
	element.onchange = function () {
		var reader = new FileReader();
		reader.onload = function () {
			var image = new Image();
			image.onload = callback;
			image.src = this.result;
		};
		reader.readAsDataURL(this.files[0]);
	};
}

function convertImage(canvas) { //convert an image to 16 bit color and apply dithering
	"use strict";
	var c2d = canvas.getContext("2d");
	var width = canvas.width * 4;
	var data = c2d.getImageData(0, 0, canvas.width, canvas.height);
	var pix;
	var col;
	var err;
	for (pix = 0; pix < data.data.length; pix += 4) {
		for (col = 0; col < 3; col += 1) {
			err = (data.data[pix + col] & 7) / 16; //7 is &B00000111, 248 is &B11111000
			data.data[pix +             col] &= 248;     //this pixel
			data.data[pix +         4 + col] += err * 7; //right
			data.data[pix + width - 4 + col] += err * 3; //down left
			data.data[pix + width     + col] += err * 5; //down
			data.data[pix + width + 4 + col] += err;     //down right
		}
	}
	c2d.putImageData(data, 0, 0);
}

window.onload = function () {
	"use strict";
	var canvas = document.getElementById("canvas");
	var c2d = canvas.getContext("2d");
	
	function put() {
		canvas.width = this.width;
		canvas.height = this.height;
		if (/^((https?:)?\/\/|\.{0,2}\/)/.test(this.src)) { //bad sorry
			alert("can't load image from another domain");
		} else {
			c2d.drawImage(this, 0, 0);
			convertImage(canvas);
		}
	}
	
	imageUpload(document.getElementById("imageUpload"), put);
	imagePaste(document.getElementById("imagePaste"), put);
	
};
