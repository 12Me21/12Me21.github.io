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
		
		//the order of these is important!
		//keyword
		find("keyword", /CONTINUE|RESTORE|ELSEIF|COMMON|LINPUT|REPEAT|RETURN|ENDIF|BREAK|GOSUB|INPUT|PRINT|UNTIL|WHILE|CALL(?:[\u0020\t]+(?:SPRITE|BG))?|DATA|ELSE|EXEC|GOTO|NEXT|READ|STOP|SWAP|THEN|WEND|DEC|DEF|DIM|END|FOR|INC|OUT|REM|USE|VAR|IF|ON|\?/igm, code, highlightList);
		//built-in function or variable
		find("function", /EXTFEATURE|BACKCOLOR|BACKTRACE|CLIPBOARD|PCMSTREAM|RANDOMIZE|SPHITINFO|BGMCLEAR|BGMPAUSE|BGSCREEN|CHKLABEL|CLASSIFY|GYROSYNC|HARDWARE|MICSTART|MILLISEC|PRGNAME\$|RINGCOPY|SPCOLVEC|SPUNLINK|TALKSTOP|BGCOLOR|BGCOORD|BGMCONT|BGMPLAY|BGMPRGA|BGMSETD|BGMSTOP|BGSCALE|BGSTART|BREPEAT|BQPARAM|CALLIDX|CHKCALL|CHKFILE|DISPLAY|DLCOPEN|ERRLINE|FADECHK|FONTDEF|FORMAT\$|FREEMEM|GCIRCLE|GPUTCHR|MAINCNT|MICDATA|MICSAVE|MICSIZE|MICSTOP|MPCOUNT|MPLOCAL|MPNAME\$|MPSTART|PCMCONT|PCMSTOP|PRGEDIT|PRGGET\$|PRGSIZE|PRGSLOT|PROJECT|RGBREAD|SNDSTOP|SPCOLOR|SPHITRC|SPHITSP|SPSCALE|SPSTART|STICKEX|SYSBEEP|TABSTEP|TALKCHK|UNSHIFT|VISIBLE|WAVSETA|XSCREEN|BGANIM|BGCLIP|BGCOPY|BGFILL|BGFUNC|BGHIDE|BGHOME|BGLOAD|BGMCHK|BGMPRG|BGMSET|BGMVAR|BGMVOL|BGPAGE|BGSAVE|BGSHOW|BGSTOP|BIQUAD|BUTTON|CHKCHR|CHKVAR|DELETE|DIALOG|DTREAD|EFCOFF|EFCSET|EFCWET|ERRNUM|ERRPRG|FFTWFN|GCOLOR|GPAINT|GSPOIT|INKEY\$|LOCATE|MICPOS|MPHOST|MPRECV|MPSEND|MPSTAT|OPTION([\u0020\t]+(STRICT|DEFINT|TOOL))?|PCMPOS|PCMVOL|PRGDEL|PRGINS|PRGSET|RENAME|RESULT|RIGHT\$|SCROLL|SPANIM|SPCLIP|SPFUNC|SPHIDE|SPHOME|SPLINK|SPPAGE|SPSHOW|SPSTOP|SPUSED|SUBST\$|TMREAD|VERSON|WAVSET|ACCEL|ARYOP|BGCHK|BGCLR|BGGET|BGOFS|BGPUT|BGROT|BGVAR|COLOR|DATE\$|EFCON|FILES|FLOOR|GCLIP|GCOPY|GFILL|GLINE|GLOAD|GPAGE|GPRIO|GPSET|GSAVE|GYROA|GYROV|INSTR|LEFT\$|MPEND|MPGET|MPSET|ROUND|RSORT|SHIFT|SPCHK|SPCHR|SPCLR|SPCOL|SPDEF|SPOFS|SPROT|SPSET|SPVAR|STICK|TIME\$|TOUCH|VSYNC|WIDTH|ACLS|ACOS|ASIN|ATAN|ATTR|BEEP|BIN\$|CEIL|CHR\$|COPY|COSH|CSRX|CSRY|CSRZ|FADE|FILL|GBOX|GCLS|GOFS|GTRI|HEX\$|IFFT|LOAD|MID\$|PUSH|RNDF|SAVE|SINH|SORT|STR\$|TALK|TANH|WAIT|XOFF([\u0020\t]+(?:MOTION|MIC|EXPAD|EXKB))?|ABS|ASC|CLS|COS|DEG|EXP|FFT|KEY|LEN|LOG|MAX|MIN|POW|POP|RAD|RGB|RND|SGN|SIN|SQR|TAN|VAL|XON(?:[\u0020\t]+(?:MOTION|MIC|EXPAD))?/igm, code, highlightList);
		//separator
		find("separator", /[()\[\]=:;,]|TO|STEP/igm, code, highlightList);
		//operator
		find("operator", /DIV|MOD|AND|XOR|NOT|OR|&&|\|\||<=|>=|==|!=|<<|>>|[+\-*\/!<>]/igm, code, highlightList);
		//invalid E number
		find("error", /(?:\d*\.)?\d+(?=E)/igm, code, highlightList);
		//invalid &H or &B number
		find("error", /&(H[\dA-F]{9,}|B[01]{33,})/igm, code, highlightList);
		//number "123." and "."
		find("number", /\d*\.#?/igm, code, highlightList);
		//number
		find("number", /(?:\d*\.)?\d+(?:E[+\-]?\d+)?#?|&H[\dA-F]+|&B[01]+/igm, code, highlightList);
		//constant
		find("number", /#(?:BGROT180|BGROT270|SPROT180|SPROT270|TMAGENTA|BGROT90|FUCHSIA|MAGENTA|PVRIGHT|SPROT90|TMAROON|TPURPLE|TROT180|TROT270|TYELLOW|AOPADD|AOPCLP|AOPDIV|AOPLIP|AOPMAD|AOPMUL|AOPSUB|BGREVH|BGREVV|BGROT0|MAROON|PURPLE|PVLEFT|SILVER|SPREVH|SPREVV|SPROT0|SPSHOW|TBLACK|TGREEN|TOLIVE|TROT90|TWHITE|WFBLKM|WFHAMM|WFHANN|WFRECT|YELLOW|BLACK|BQAPF|BQBPF|BQBSF|BQHPF|BQHSF|BQLPF|BQLSF|BQPEQ|CHKUV|CHKXY|GREEN|OLIVE|RIGHT|SPADD|TBLUE|TCYAN|TGRAY|TLIME|TNAVY|TREVH|TREVV|TROT0|TTEAL|WHITE|FALSE|AQUA|BLUE|CHKC|CHKI|CHKR|CHKS|CHKV|CHKZ|CYAN|DOWN|GRAY|LEFT|LIME|NAVY|TEAL|TRED|TRUE|OFF|RED|YES|NO|ON|UP|ZL|ZR|A|B|L|R|X|Y)|FALSE|TRUE|PI[\u0020\t]*\([\u0020\t]*\)/igm, code, highlightList);
		//invalid constant
		find("error", /#[A-Z0-9]*/igm, code, highlightList);
		//label 
		find("label", /@\w+/igm, code, highlightList);
		//invalid label
		find("error", /@/igm, code, highlightList);
		//string
		find("string", /"[^"]*?(?:"|$)/igm, code, highlightList);
		//comment
		find("comment", /'[^'\n\r]*/igm, code, highlightList);
		//user defined function or variable
		find("variable", /[A-Z_]\w*[$%#]?(?:[\u0020\t]*\[[\u0020\t]*\])?/igm, code, highlightList);
		
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
