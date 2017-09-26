var input = document.getElementById("input");
var code = document.getElementById("code");

var putText = document.getElementById("puttext");
putText.addEventListener("click", function() {
	code.textContent = input.value;
});
putText.click();

var highlight = document.getElementById("highlight");
highlight.addEventListener("click", function() {
	applySyntaxHighlighting(code);
});
highlight.click();
