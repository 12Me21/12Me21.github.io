//get image from file browser
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

//Convert image to blob PNG or JPEG depending on the size
var toBlob = (function () {
	"use strict";
	var canvas = document.createElement("canvas");
	return function (image, callback) {
		if (image.constructor === Blob) {
			callback(image);
			return;
		}
        //draw on canvas
		canvas.width = image.width;
		canvas.height = image.height;
        canvas.getContext("2d").drawImage(image, 0, 0);
        if (!HTMLCanvasElement.prototype.toBlob) {
            alert("Browser does not support canvas.toBlob.\nTry using 12Me21.github.io/kland_image/simple");
            return;
        }
        //get png blob
        canvas.toBlob(function (blobPng) {
            if (blobPng.size <= 750000) {
                console.log("Converted to PNG");
                callback(blobPng);
                return;
            }
            //get jpeg blob if png is too big
            canvas.toBlob(function (blobJpeg) {
                console.log("Converted to JPEG");
                callback(blobJpeg);
                return;
            }, "image/jpeg", 0.9);
        });
    };
}());

//upload image to kland
function upload(blob, bucket, callback) {
    "use strict";
    //generate form data
    var data = new FormData();
    data.append("image", blob, "blob." + (blob.type === "image/jpeg" ? "jpg" : "png"));
    data.append("bucket", bucket);
    //send
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://kland.smilebasicsource.com/uploadimage");
    xhr.onload = callback;
    xhr.send(data);
}
