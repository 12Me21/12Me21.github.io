
function Highlighter (languageDefinition) {
	for (var i = 0; i < languageDefinition.syntax.length; i++)
		if (!languageDefinition.syntax[i].regex.global)
			throw "Highlighter regex must have global flag set";
	this.syntax = languageDefinition.syntax;
}

//Escape < > & for setting innerHTML
Highlighter.escapeHTML = function (text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

//Actual highlighter
Highlighter.prototype.highlight = function (code) {
	
	//find potential things to highlight
	var highlightList = [];
	for (var i = 0; i < this.syntax.length; i++) {
		var className = this.syntax[i].className;
		var regex = this.syntax[i].regex;
		var match;
		while (match = regex.exec(code))
			highlightList.push({
				start: match.index,
				end: match.index + match[0].length,
				className: className,
				index: highlightList.length
			});
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
				output += Highlighter.escapeHTML(code.substring(pos, highlight.start)) +
				          "<span class=\"" + highlight.className + "\">" +
				          Highlighter.escapeHTML(code.substring(highlight.start, highlight.end)) +
				          "</span>";
			else
				output += Highlighter.escapeHTML(code.substring(pos, highlight.end));
			pos = highlight.end;
		}
	}
	output += Highlighter.escapeHTML(code.substring(pos));
	
	return output;
}

//Highlight an element
Highlighter.prototype.highlightElement = function (codeElements) {
	codeElements.innerHTML = this.highlight(codeElements.textContent);
}

//Highlight a list of elements.
Highlighter.prototype.highlightElements = function (codeElements) {
	for (var i = 0; i < codeElements.length; i++)
		this.highlightElement(codeElements[i])
}

//Highlight a list of elements asynchronosly using web workers.
if (window.Worker) {
	Highlighter.prototype.workerHighlightElements = function (codeElements) {
		//Get a list of code to highlight
		var textContents=new Array(codeElements.length)
		for(var i=0;i<codeElements.length;i++)
			textContents[i]=codeElements[i].textContent;
		//Create worker
		var worker = new Worker("rxhighlightworker.js");
		worker.onmessage = function (event) {
			for(var i=0;i<codeElements.length;i++)
				codeElements[i].innerHTML = event.data[i];
			worker.terminate();
		};
		worker.postMessage({code:textContents,syntax:this.syntax});
	}
} else {
	//fallback for old browsers
	Highlighter.prototype.workerHighlightElements=Highlighter.prototype.highlightElements;
}

