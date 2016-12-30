//this is the same as script.js but it adds line break symbols.

var applySyntaxHighlighting = (function()
{
	//find matches and add them to the list.
	var index=0;
	function find(classname,regex,text,list)
	{
		while (match=regex.exec(text)){
			list.push({
				start: match.index,
				end: match.index+match[0].length,
				classname: classname,
				index: index++
			});
		}
	}
	
	//sort by lower start pos, then longer length
	function listCompare(a,b)
	{
		return a.start-b.start || b.end-a.end || a.index-b.index;
	}
	
	//highlight
	return function(codeElement)
	{
		var text=codeElement.innerHTML;
		//Each highlightable word has the properties "start", "end", and "classname"
		var list=[]; 
		//find potential things to highlight
		find("keyword" ,/ELSEIF|ENDIF|AND|BREAK|CALL|COMMON|CONTINUE|DATA|DEC|DEF|DIM|DIV|ELSE|END|EXEC|FALSE|FOR|GOSUB|GOTO|IF|INC|INPUT|LINPUT|MOD|NEXT|NOT|ON|OUT|OR|PRINT|READ|REM|REPEAT|RESTORE|RETURN|STEP|STOP|SWAP|THEN|TO|TRUE|UNTIL|USE|VAR|WEND|WHILE|XOR/igm,text,list);
		find("function",/ABS|ACCEL|ACLS|ACOS|ARYOP|ASC|ASIN|ATAN|ATTR|BACKCOLOR|BACKTRACE|BEEP|BGANIM|BGCHK|BGCLIP|BGCLR|BGCOLOR|BGCOORD|BGCOPY|BGFILL|BGFUNC|BGGET|BGHIDE|BGHOME|BGLOAD|BGMCHK|BGMCLEAR|BGMCONT|BGMPAUSE|BGMPLAY|BGMPRG|BGMPRGA|BGMSET|BGMSETD|BGMSTOP|BGMVAR|BGMVOL|BGOFS|BGPAGE|BGPUT|BGROT|BGSAVE|BGSCALE|BGSCREEN|BGSHOW|BGSTART|BGSTOP|BGVAR|BIN\$|BIQUAD|BREPEAT|BQPARAM|BUTTON|CALLIDX|CEIL|CHKCALL|CHKCHR|CHKFILE|CHKLABEL|CHKVAR|CHR\$|CLASSIFY|CLIPBOARD|CLS|COLOR|COPY|COS|COSH|CSRX|CSRY|CSRZ|DATE\$|DEG|DELETE|DIALOG|DISPLAY|DLCOPEN|DTREAD|EFCOFF|EFCON|EFCSET|EFCWET|ERRNUM|ERRLINE|ERRPRG|EXP|EXTFEATURE|FADE|FADECHK|FFT|FFTWFN|FILL|FILES|FLOOR|FONTDEF|FORMAT\$|FREEMEM|GBOX|GCIRCLE|GCLIP|GCLS|GCOLOR|GCOPY|GFILL|GLINE|GLOAD|GOFS|GPAGE|GPAINT|GPRIO|GPSET|GPUTCHR|GSAVE|GSPOIT|GTRI|GYROA|GYROV|GYROSYNC|HARDWARE|HEX\$|IFFT|INKEY\$|INSTR|KEY|LEFT\$|LEN|LOAD|LOCATE|LOG|MAINCNT|MAX|MICDATA|MICPOS|MICSAVE|MICSIZE|MICSTART|MICSTOP|MID\$|MILLISEC|MIN|MPCOUNT|MPEND|MPGET|MPHOST|MPLOCAL|MPNAME\$|MPRECV|MPSEND|MPSET|MPSTART|MPSTAT|OPTION|PCMCONT|PCMPOS|PCMSTOP|PCMSTREAM|PCMVOL|POW|POP|PRGDEL|PRGEDIT|PRGGET\$|PRGINS|PRGNAME\$|PRGSET|PRGSIZE|PRGSLOT|PROJECT|PUSH|RAD|RANDOMIZE|RENAME|RESULT|RGB|RGBREAD|RIGHT\$|RINGCOPY|RND|RNDF|ROUND|RSORT|SAVE|SCROLL|SGN|SHIFT|SIN|SINH|SNDSTOP|SORT|SPANIM|SPCHK|SPCHR|SPCLIP|SPCLR|SPCOL|SPCOLOR|SPCOLVEC|SPDEF|SPFUNC|SPHIDE|SPHITINFO|SPHITRC|SPHITSP|SPHOME|SPLINK|SPOFS|SPPAGE|SPROT|SPSCALE|SPSET|SPSHOW|SPSTART|SPSTOP|SPUSED|SPUNLINK|SPVAR|SQR|STICK|STICKEX|STR\$|SUBST\$|SYSBEEP|TABSTEP|TALK|TALKCHK|TALKSTOP|TAN|TANH|TIME\$|TMREAD|TOUCH|UNSHIFT|VAL|VERSON|VISIBLE|VSYNC|WAIT|WAVSET|WAVSETA|WIDTH|XOFF|XON|XSCREEN/igm,text,list);
		find(false     ,/[A-Z_][A-Z0-9_]*[$%#]?/igm,text,list); //must be after keyword and function. Prevents functions/keywords from being highlighted in the middle of user variable/function names
		find(false     ,/(?:\d*\.)?\d+(?=E)/igm,text,list); //must be before number. Causes numbers using E without a digit after to not be highlighted
		find(false     ,/&amp;&amp;|&&/igm,text,list); //must be before number. Makes sure code like 7&&HEAD is not interpreted as a hex number.
		find("number"  ,/-?(?:(?:\d*\.(?:\d+(?:E-?\d+)?)?)|(?:\d+(?:E-?\d+)?))#?|(?:&amp;|&)H[\dA-F]+|(?:&amp;|&)B[01]+|#[A-Z\d]+/igm,text,list);
		find("label"   ,/@[0-9A-Z_]*/igm,text,list);
		find("string"  ,/\".*?(?:\"|$)/igm,text,list);
		find("comment" ,/'[^'\n\r]*/igm,text,list);
		
		//highlight the correct ones
		list=list.sort(listCompare);
		var pos=0,output="";
		for(var i=0;i<list.length;i++)
		{
			var word=list[i];
			if (word.start>=pos) //only highlight if it's past the end of the previous keyword
			{ 
				if (word.classname)
					output+=text.substring(pos,word.start)+"<span class='"+word.classname+"'>"+text.substring(word.start,word.end)+"</span>";
				else
					output+=text.substring(pos,word.end);
				pos=word.end;
			}
		}
		output+=text.substring(pos); //text after last keyword
    output=output.replace(/$/gm,"<newline></newline>") //adding the newline symbols. Required CSS: newline::after{content:"\E20D";color:rgb(0,184,248);}
		codeElement.innerHTML=output;
	};
	
}) ();
