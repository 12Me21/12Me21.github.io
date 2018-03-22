//Taken from stack overflow:
//http://stackoverflow.com/questions/4229043/load-page-content-to-variable
function loadXMLDoc(theURL, callback, post)
{
	post = typeof post !== 'undefined' ? post : false;
	var xmlhttp;
	
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari, SeaMonkey
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			callback(xmlhttp.responseText);
		}
	};
	
	if(post)
	{
		//First, make sure the URL is even post worthy. If it's not,
		//simply call our function again as get.
		var parts = theURL.split("?");
		if (parts.length != 2)
			return loadXMLDoc(theURL, callback);
		
		var params = parts[1];
		xmlhttp.open("POST", parts[0], true);
		
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		
		xmlhttp.send(params);
	}
	else
	{
		xmlhttp.open("GET", theURL, true);
		xmlhttp.send();
	}
}

var hash=window.location.hash;
if(hash){
	loadXMLDoc(hash.substr(1),function(text){
		input.value=text;
		document.querySelector("button").click();
	});
}
