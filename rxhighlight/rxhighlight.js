function Highlighter (languageDef) {
	
	this.syntax=new Array(languageDef.syntax.length);
	this.language=languageDef.language;
	
	for (var i = 0; i < languageDef.syntax.length; i++) {
		
		this.syntax[i] = {
			className: languageDef.syntax[i].className,
			priority: languageDef.syntax[i].priority || 0
		};
		
		//prepare regex flags
		var flags = "gm";
		//if match has ignoreCase flag:
		if (languageDef.syntax[i].ignoreCase !== undefined) {
			if (languageDef.syntax[i].ignoreCase)
				flags += "i";
		//otherwise use global flag
		} else if (languageDef.ignoreCase) {
			flags += "i";
		}
		
		//regex stored as string (for JSON)
		if (languageDef.syntax[i].stringRegex !== undefined) {
			this.syntax[i].regex=new RegExp(languageDef.syntax[i].stringRegex, flags);
		//regex
		} else if (languageDef.syntax[i].regex !== undefined) {
			this.syntax[i].regex = new RegExp(languageDef.syntax[i].regex.source, flags);
		//list of keywords separated by spaces
		} else if (languageDef.syntax[i].keywords !== undefined) {
			var keywords = languageDef.syntax[i].keywords.split(/\s+/g).sort(function(a,b){return b.length-a.length});
			for (var j = 0; j < keywords.length; j++)
				keywords[j]=keywords[j].replace(/([\.\[\]^$()+*?{}|\\])/ig, "\\$&");
			this.syntax[i].regex = new RegExp(keywords.join("|"), flags);
		//oops
		} else {
			throw "Missing regex or keyword list in language definition";
		}
		
	}
	
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
		var priority = this.syntax[i].priority;
		var match;
		while (match = regex.exec(code))
			highlightList.push({
				start: match.index,
				end: match.index + match[0].length,
				className: className,
				priority: priority,
			});
	}
	highlightList = highlightList.sort(function (a,b) {
		return a.start - b.start || b.end - a.end || b.priority - a.priority;
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
