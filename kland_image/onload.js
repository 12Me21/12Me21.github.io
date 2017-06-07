function doUpload(image) {
    "use strict";
    toBlob(image, function (blob) {
        upload(blob, document.getElementById("bucket").value, function () {
            document.getElementById("link").href = this.response;
            document.getElementById("image").src = this.response;
        });
    });
}

//paste image
imagePaste(document.getElementById("pastebox"), function () {
    "use strict";
    doUpload(this);
});

//select file
imageUpload(document.getElementById("browse"), function () {
    "use strict";
    doUpload(this);
});
