onmessage=function(event){
	var text=event.data[0];
	var find=event.data[1];

	//find potential things to highlight
	var highlightList = [];
	for (var i = 0; i < find.length; i++) {
		var className = find[i].class;
		var regex = find[i].regex;
		//there really needs to be a better way get all matches:
		var match;
		while (match = regex.exec(text)) {
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
				output += escapeHTML(text.substring(pos, highlight.start)) +
						  "<span class=\"" + highlight.className + "\">"+
						  escapeHTML(text.substring(highlight.start, highlight.end)) +
						  "</span>";
			else
				output += escapeHTML(text.substring(pos, highlight.end));
			pos = highlight.end;
		}
	}
	output += escapeHTML(text.substring(pos));

	postMessage(output);
}

//slow but it's all we have :(
function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
}
