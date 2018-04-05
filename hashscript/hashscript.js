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
			part=part.match(/^(.)(.*?)(?:(?:;(.*))?;(.*))?$/);
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
							break;
						case "S":
							data=data.replace(/\\/g,"¥").replace(/\u007F/g,"\\");
							break;
						default:
							assert(false);
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
	
	function assert(condition){
		if(!condition)
			throw "Assertion failed";
	}
}
