window.onload=function(){
	var canvas=document.createElement("canvas")
	var c2d=canvas.getContext("2d")
	var out=document.getElementById("out")
	uploadImages(document.getElementById("imageUpload"),function(){
		out.value=""
	},function(){
		canvas.width=this.width
		canvas.height=this.height
		c2d.drawImage(this,0,0)
		out.value+=convert(c2d.getImageData(0,0,canvas.width,canvas.height).data)
	})
}

function convert(data) { //do the thing
	var string=""
	for(var byte=0;byte<data.length;byte+=8){
		var char=0
		for(var bit=0;bit<8;bit++)
			char|=(data[(byte+bit)*4]>127)<<7-bit
		if(char==0)
			break
		string+=String.fromCharCode(char)
	}
	return decodeURIComponent(escape(string))
}

//uploader is the <input> element.
//callback1 is called ONCE when user uploads files.
//callback2 is called MULTUPLE TIMES, when each image loads.
function uploadImages(uploader,callback1,callback2){
	uploader.onchange=function(){
		callback1()
		var reader=new FileReader()
		var i=0
		reader.onload=function(){
			var image=new Image()
			image.onload=callback2
			image.src=this.result
			console.log("a")
			if(++i<uploader.files.length)
				reader.readAsDataURL(uploader.files[i])
		}
		reader.readAsDataURL(uploader.files[i])
	}
}
