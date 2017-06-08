```javascript
applySyntaxHighlighting(codeElement);
```

`codeElement` (usually `<code>`) is the element containing the code to highlight.
It should have `white-space` set to `pre` or `pre-wrap` and `display` set to `block` or `inline-block`.

The classes used for highlighting are:
* `.keyword` - keywords (`FOR`, `NEXT`, `PRINT` etc.)
* `.number` - number literals (`37`, `#FALSE`, `1.4e+17`, etc.)
* `.function` - built-in functions and variables (`LOCATE`, `GCLS`, `MILLISEC`, etc.)
* `.label` - labels and label literals (`@LOOP`, `@BGM17`, etc.)
* `.string` - string literals (`"Hello, world!"`, `"A"`, etc.)
* `.comment` - comments (`'sets I to 0`, etc.)
* `.operator` - operators (`AND`, `+`, `==`, etc.)
* `.variable` - user defined variables, functions, and function arguments (`X`, `TYPEOF`, `ARRAY[]`, etc.)
* `.separator` - all other symbols (`,`, `=`, `TO`, etc.)

Known bug:
In `DEF PI():END`,
`PI()` is highlighted as a constant

Files:
* Pages:
  * `index.html` - demo
  * `link.html` - highlights code stored in the url
  * `mml.html` - MML highlighter
  * `README.md` - don't read this
* Scripts:
  * `sbhighlight.js` - highlighter
  * `link.js` - script for `link.html`
  * `mmlhighlight.js` - MML highlighter
* Styles:
  * `style.css` - style
  * `theme.css` - highlighted code
