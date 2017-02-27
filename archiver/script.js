window.onload=function(){
	var canvas=document.createElement("canvas")
	var c2d=canvas.getContext("2d")
	var out=document.getElementById("out")
	uploadImage(document.getElementById("imageUpload"),function(){
		canvas.width=this.width
		canvas.height=this.height
		c2d.drawImage(this,0,0)
		out.value=convert(c2d.getImageData(0,0,canvas.width,canvas.height).data)
	})
}
 
function uploadImage(uploader,callback){
	uploader.onchange=function(){
		var reader=new FileReader()
		reader.onload=function(){
			var image=new Image()
			image.onload=callback
			image.src=this.result
		}
		reader.readAsDataURL(this.files[0])
	}
}

function convert(data) { //do the thing
	var string=""
	for(var byte=0;byte<data.length;byte+=8){
		var char=0
		for(var bit=0;bit<8;bit++) char|=(data[(byte+bit)*4]>127)<<7-bit
		if(char==0) break
		string+=String.fromCharCode(char)
	}
	return decodeURIComponent(escape(string))
}
