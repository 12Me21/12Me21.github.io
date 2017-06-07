var code = document.getElementById("code");
code.textContent = decodeURIComponent(window.location.hash.substr(1));
applySyntaxHighlighting(code);
