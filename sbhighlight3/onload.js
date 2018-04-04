function load(url,callback){
	var xhr=new XMLHttpRequest();
	
	xhr.onload=function(){
		callback(xhr.responseText);
	}
	
	xhr.open("GET",url,true);
	xhr.send();
}

var hash=unescape(location.hash);
if(hash){
	switch(hash.charAt(1)){
		case "f":
			load(hash.substr(2),function(text){
				$input.value=text;
				$button.click();
			});
		break;
		case "c":
			$input.value=hash.substr(2);
			$button.click();
		break;
		//SB file mode.
		//fixes yen and backslash
		case "t":
			load(hash.substr(2),function(text){
				$input.value=text.replace(/\\/g,"¥").replace(/\u007F/g,"\\");
				$button.click();
			});
		break;
	}
}
