function Highlighter (languageDefinition) {
	for (var i = 0; i < languageDefinition.find.length; i++)
		if (!languageDefinition.find[i].regex.global)
			throw "Highlighter regex must have global flag set";
	this.find = languageDefinition.find; //only this part is used currently
}

//apply highlighting to an HTML element
Highlighter.prototype.apply = function (codeElement) {
	var text = codeElement.textContent;
	
	//find potential things to highlight
	var highlightList = [];
	for (var i = 0; i < this.find.length; i++) {
		var className = this.find[i].class;
		var regex = this.find[i].regex;
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
				output += Highlighter.escapeHTML(text.substring(pos, highlight.start)) +
				          "<span class=\"" + highlight.className + "\">"+
				          Highlighter.escapeHTML(text.substring(highlight.start, highlight.end)) +
				          "</span>";
			else
				output += Highlighter.escapeHTML(text.substring(pos, highlight.end));
			pos = highlight.end;
		}
	}
	output += text.substring(pos).escapeHTML();
	
	codeElement.innerHTML = output;
}

//This should've been a builtin function, but oh well.
Highlighter.converterElement = document.createElement("textarea");
Highlighter.prototype.escapeHTML = function (text) {
	this.converterElement.textContent = text;
	return this.converterElement.innerHTML;
}
