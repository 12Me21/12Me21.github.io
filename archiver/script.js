window.onload = function () {
	"use strict";
	var canvas = document.createElement("canvas");
	var c2d = canvas.getContext("2d");
	var out = document.getElementById("out");
	var link = document.getElementById("link");
	uploadImages(document.getElementById("imageUpload"), function (images) {
		var code = "";
		images.forEach(function (image) {
			canvas.width = image.width;
			canvas.height = image.height;
			c2d.drawImage(image, 0, 0);
			code += convert(c2d.getImageData(0, 0, canvas.width, canvas.height).data);
		});
		code = code.replace(/\0+$/,""); //remove trailing nulls
		out.value = code
		link.href = "//12Me21.github.io/sbhighlight/link#" + encodeURIComponent(code);
	});
};

//do the thing
function convert(imageData) {
	"use strict";
	var string = "";
	var byte;
	var char;
	var bit;
	for (byte = 0; byte < imageData.length; byte += 8) {
		char = 0;
		for (bit = 0; bit < 8; bit += 1) {
			char |= +(imageData[(byte + bit) * 4] > 127) << 7 - bit;
		}
		string += String.fromCharCode(char);
	}
	try {
		//I don't give a fuck if escape() is depricated, I NEED it to convert from UTF-8.
		return decodeURIComponent(escape(string));
	} catch (ignore) {
		return "Error: Invalid UTF-8 Sequence";
	}
}

//uploader is the <input> element.
function uploadImages(uploader, callback) {
	"use strict";
	uploader.onchange = function () {
		var reader = new FileReader();
		var i = 0;
		var images = [];
		//basically an async for() loop
		reader.onload = function () {
			images[i] = new Image();
			images[i].onload = function () {
				i += 1;
				if (i >= uploader.files.length - 1) {
					callback(images);
					return;
				}
				reader.readAsDataURL(uploader.files[i]);
			};
			images[i].src = reader.result;
		};
		reader.readAsDataURL(uploader.files[0]);
	};
}
