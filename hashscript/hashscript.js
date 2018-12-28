function rh(){
	runHash(decodeURIComponent(window.location.hash.substr(1)));
}
function runHash(hash){
	if(hash){
		//split on ~, but ~~ is an escape sequence for ~.
		hash=hash.split("~");
		var concat=false;
		hash=hash.reduce(function(acc,val){
			if(val){
				if(concat){
					acc[acc.length-1]+="~"+val;
					concat=false;
				}else{
					acc.push(val);
				}
			}else{
				concat=true;
			}
			return acc;
		},[]);
		//run each command
		hash.forEach(function(part){
			//regex matching...
			part=part.match(/^([^])([^]*?)(?:(?:;([^]*))?;([^]*))?$/);
			assert(part);
			console.log(part);
			var elem=document.querySelector(part[2]); 
			assert(elem);
			var data=part[4];
			var process=part[3];
			if(process){
				process.split("").forEach(function(process){
					switch(process){
						case "L":
							data=syncLoad(data);
						break;case "S":
							data=data.replace(/\\/g,"¥").replace(/\u007F/g,"\\");
						break;case "P": //hacked together paste.ee loader
							data=JSON.parse(syncLoad("https://api.paste.ee/v1/pastes/"+data+"?key=adJOQ0Hs6iASwsDNpNURNSvban8WKfCJnKGG1Mbnr"));
							assert(data.success,"paste.ee load failed "+data.error);
							assert(data.paste && data.paste.sections && data.paste.sections[0] && data.paste.sections[0].contents,"too complex");
							data=data.paste.sections[0].contents;
						break;case "E": //hacked together PPCG SE loader
							data=JSON.parse(syncLoad("https://api.stackexchange.com/2.2/answers/"+data+"?site=codegolf&filter=withbody"));
							assert(data.items && data.items[0] && data.items[0].body,"SE load failed.");
							data=data.items[0].body;
							console.log(data);
						break;case "C": //get contents of <code> tag
							var element=document.createElement("div");
							element.innerHTML=data;
							data=element.getElementsByTagName("code")[0];
							assert(data,"code not found");
							data=data.textContent;
							element=undefined;
						break;default:
							assert(false,"invalid action "+process);
					}
				});
			}
			switch(part[1]){
				case "V":
					elem.value=data;
					break;
				case "H":
					elem.innerHTML=data;
					break;
				case "T":
					elem.textContent=data;
					break;
				case "C":
					elem.click();
					break;
				case "W":
					elem.innerText=data;
					break;
				case "Y":
					elem.checked=true;
					break;
				case "N":
					elem.checked=false;
					break;
				default:
					assert(false);
			}
		});
	}
	function syncLoad(url){
	var xhr=new XMLHttpRequest();
	xhr.open("GET",url,false); //SYNCHRONOUS REQUEST!!! aaaaa
	xhr.send();
	return xhr.responseText;
	}
	
	function assert(condition,message){
		if(!condition){
			var error=new Error();
			error.message=message||"Assertion failed";
			throw error;
		}
	}
}
