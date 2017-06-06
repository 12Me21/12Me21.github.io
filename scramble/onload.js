var textarea = document.getElementById("input")
document.getElementById("convert").onclick = function () {
	textarea.value = shuffle(textarea.value.split(/\u0020+/g)).join(" ")
}
