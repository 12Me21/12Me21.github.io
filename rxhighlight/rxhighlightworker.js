onmessage=function(event){
	var syntax=event.data.syntax;
	var outputs=new Array(event.data.code.length);
	
	for(var j=0;j<event.data.code.length;j++){
		var code=event.data.code[j];
		
		//find potential things to highlight
		var highlightList = [];
		for (var i = 0; i < syntax.length; i++) {
			var className = syntax[i].class;
			var regex = syntax[i].regex;
			//there really needs to be a better way get all matches:
			var match;
			while (match = regex.exec(code)) {
				highlightList.push({
					start: match.index,
					end: match.index + match[0].length,
					className: className,
					index: highlightList.length
				});
			}
		}

		highlightList = highlightList.sort(function (a,b) {
			return a.start - b.start || b.end - a.end || a.index - b.index;
		});

		//insert highlighting
		var output = "";
		var pos = 0;
		for (var i = 0; i < highlightList.length; i++) {
			var highlight = highlightList[i];
			if (highlight.start >= pos) { //only highlight if it's past the end of the previous keyword
				if (highlight.className)
					output += escapeHTML(code.substring(pos, highlight.start)) +
							  "<span class=\"" + highlight.className + "\">"+
							  escapeHTML(code.substring(highlight.start, highlight.end)) +
							  "</span>";
				else
					output += escapeHTML(code.substring(pos, highlight.end));
				pos = highlight.end;
			}
		}
		output += escapeHTML(code.substring(pos));
		
		outputs[j]=output
	}
	postMessage(outputs);
}

//slow but it's all we have :(
function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
}