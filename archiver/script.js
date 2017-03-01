window.onload=function(){
	var canvas=document.createElement("canvas")
	var c2d=canvas.getContext("2d")
	var out=document.getElementById("out")
	var link=document.getElementById("link")
	uploadImages(document.getElementById("imageUpload"),function(images){
		var code=""
		for(var i=0;i<images.length;i++){
			canvas.width=images[i].width
			canvas.height=images[i].height
			c2d.drawImage(images[i],0,0)
			code+=convert(c2d.getImageData(0,0,canvas.width,canvas.height).data)
		}
		out.value=code
		link.href="//12Me21.github.io/syntax/link#"+encodeURIComponent(code);
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
	try{
		return decodeURIComponent(escape(string))
	}catch(e){
		return "Error: Invalid UTF-8 Sequence"
	}
}

//uploader is the <input> element.
//callback is called
//callback2 is called MULTUPLE TIMES, when each image loads.
function uploadImages(uploader,callback){
	uploader.onchange=function(){
		var reader=new FileReader()
		var i=0
		var images=new Array(uploader.files.length)
		reader.onload=function(){
			images[i]=new Image()
			images[i].onload=function(){
				if(++i<uploader.files.length)
					reader.readAsDataURL(uploader.files[i])
				else
					callback(images)
			}//image.onload
			images[i].src=reader.result
		}//reader.onload
		reader.readAsDataURL(uploader.files[0])
	}//uploader.onchange
}
