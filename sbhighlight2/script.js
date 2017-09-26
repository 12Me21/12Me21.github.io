var input = document.getElementById("input");
var code = document.getElementById("code");

var putTextButton = document.getElementById("puttext");
putTextButton.addEventListener("click", function() {
	code.textContent = input.value;
});
putTextButton.click();

var highlightButton = document.getElementById("highlight");
highlightButton.addEventListener("click", function() {
	applySyntaxHighlighting(code);
});
highlightButton.click();
