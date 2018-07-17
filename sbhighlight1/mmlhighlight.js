//I tried doing the thing where { go on the next line, but it
//doesn't work in many situations so I just couldn't do it.
//} <- this is to make my text editor happy.

//I did use semicolons and jslint accepts my code
//(except for tab indenting and indenting empty lines)
//(and also that match = regex.exec thing)

var applySyntaxHighlighting = (function () {
	"use strict";
	
	//subroutine
	function find(className, regex, code, highlightList) {
		var match;
		//WHY IS THIS NOT A BUILT-IN FUNCTION?
		while (match = regex.exec(code)) {
			highlightList.push({
				start: match.index,
				end: match.index + match[0].length,
				className: className,
				order: highlightList.length
			});
		}
	}
	
	//escape & and < for setting innerHTML
	function escapeHTML(text) {
		return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
	}
	
	//main function
	return function (codeElement) {
		var code = codeElement.textContent;
		
		var highlightList = [];
		
		//keyword
		find("note", /N(?:\d+|\$\d)|[A-G][.#\-+]*(\d+|\$\d)?[.#\-+]*[_&]?[.#\-+]*/igm, code, highlightList);
		//built-in function or variable
		find("rest", /R\.*(\d+|\$\d)?\.*/igm, code, highlightList);
		//separator
		find("command", /[TQO]\d+|[@VP](\d+|\$\d)|@V(\d+|\$\d)|@D(-?\d+|\$\d)|[()]\d*|@(E|M[APL])(\d+|\$\d)(,(\d+|\$\d)){3}|@(ER|MO[NF])|[<>!]/igm, code, highlightList);
		//user defined function or variable
		find("block", /\[|\](\d*|\$\d)|{[A-Z_]\w{0,6}=|}|{[A-Z_]\w{0,7}}|:\d+/igm, code, highlightList);
		//operator
		find("variable", /\$\d=-?\d+/igm, code, highlightList);
		
		highlightList = highlightList.sort(function (a, b) {
			return a.start - b.start || b.end - a.end || a.order - b.order;
		});
		
		//insert highlighting
		var output = "";
		var pos = 0;
		highlightList.forEach(function (highlight) {
			if (highlight.start >= pos) {
				if (highlight.className) {
					output +=
						escapeHTML(code.substring(pos, highlight.start)) +
						"<span class=\"" + highlight.className + "\">" +
						escapeHTML(code.substring(highlight.start, highlight.end)) +
						"</span>";
				} else {
					output += escapeHTML(code.substring(pos, highlight.end));
				}
				pos = highlight.end;
			}
		});
		output += escapeHTML(code.substring(pos));
		
		codeElement.innerHTML = output;
	};
	
}());
