var input = document.getElementById("input");
var code = document.getElementById("code");
var convert = document.getElementById("convert"); //button

convert.addEventListener("click", function() {
	code.textContent = input.value;
	applySyntaxHighlighting(code);
});
