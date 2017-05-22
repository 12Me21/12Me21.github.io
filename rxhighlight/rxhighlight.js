class Highlighter{
	constructor(find){
		this.find=find.find;
	}
	
	//apply highlighting to an HTML element
	apply(codeElement){
		var text=codeElement.textContent;
		//find potential things to highlight
		var list=[];
		var fallback=0;
		for(var i=0;i<this.find.length;i++){
			var classname=this.find[i].classname;
			var regex=this.find[i].regex;
			var match;
			
			while(match=regex.exec(text)){
				list.push({
					start: match.index,
					end: match.index+match[0].length,
					classname: classname,
					fallback: fallback++
				});
			}
		}
		
		//highlight the correct ones
		list=list.sort(function(a,b){
			return a.start-b.start||b.end-a.end||a.fallback-b.fallback;
		});
		
		var pos=0,output="";
		for(var i=0;i<list.length;i++){
			var word=list[i];
			if (word.start>=pos){ //only highlight if it's past the end of the previous keyword
				if (word.classname)
					output+=text.substring(pos,word.start).escapeHTML()+'<span class="'+word.classname+'">'+text.substring(word.start, word.end).escapeHTML()+"</span>";
				else
					output+=text.substring(pos,word.end).escapeHTML();
				pos=word.end;
			}
		}
		output+=text.substring(pos).escapeHTML();
		codeElement.innerHTML=output;
	}
}

String.prototype.escapeHTML=(function(){
	var converter=document.createElement("textarea");
	return function(){
		converter.textContent = this;
		return converter.innerHTML;
	}
})()
