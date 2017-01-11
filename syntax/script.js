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
		console.log(match)
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
		find("keyword" ,/CONTINUE|RESTORE|ELSEIF|COMMON|LINPUT|REPEAT|RETURN|ENDIF|BREAK|FALSE|GOSUB|INPUT|PRINT|UNTIL|WHILE|CALL|DATA|ELSE|EXEC|GOTO|NEXT|READ|STEP|STOP|SWAP|THEN|TRUE|WEND|AND|DEC|DEF|DIM|DIV|END|FOR|INC|MOD|NOT|OUT|REM|USE|VAR|XOR|IF|ON|OR|TO/igm,text,list);
		find("function",/EXTFEATURE|BACKCOLOR|BACKTRACE|CLIPBOARD|PCMSTREAM|RANDOMIZE|SPHITINFO|BGMCLEAR|BGMPAUSE|BGSCREEN|CHKLABEL|CLASSIFY|GYROSYNC|HARDWARE|MICSTART|MILLISEC|PRGNAME\$|RINGCOPY|SPCOLVEC|SPUNLINK|TALKSTOP|BGCOLOR|BGCOORD|BGMCONT|BGMPLAY|BGMPRGA|BGMSETD|BGMSTOP|BGSCALE|BGSTART|BREPEAT|BQPARAM|CALLIDX|CHKCALL|CHKFILE|DISPLAY|DLCOPEN|ERRLINE|FADECHK|FONTDEF|FORMAT\$|FREEMEM|GCIRCLE|GPUTCHR|MAINCNT|MICDATA|MICSAVE|MICSIZE|MICSTOP|MPCOUNT|MPLOCAL|MPNAME\$|MPSTART|PCMCONT|PCMSTOP|PRGEDIT|PRGGET\$|PRGSIZE|PRGSLOT|PROJECT|RGBREAD|SNDSTOP|SPCOLOR|SPHITRC|SPHITSP|SPSCALE|SPSTART|STICKEX|SYSBEEP|TABSTEP|TALKCHK|UNSHIFT|VISIBLE|WAVSETA|XSCREEN|BGANIM|BGCLIP|BGCOPY|BGFILL|BGFUNC|BGHIDE|BGHOME|BGLOAD|BGMCHK|BGMPRG|BGMSET|BGMVAR|BGMVOL|BGPAGE|BGSAVE|BGSHOW|BGSTOP|BIQUAD|BUTTON|CHKCHR|CHKVAR|DELETE|DIALOG|DTREAD|EFCOFF|EFCSET|EFCWET|ERRNUM|ERRPRG|FFTWFN|GCOLOR|GPAINT|GSPOIT|INKEY\$|LOCATE|MICPOS|MPHOST|MPRECV|MPSEND|MPSTAT|OPTION|PCMPOS|PCMVOL|PRGDEL|PRGINS|PRGSET|RENAME|RESULT|RIGHT\$|SCROLL|SPANIM|SPCLIP|SPFUNC|SPHIDE|SPHOME|SPLINK|SPPAGE|SPSHOW|SPSTOP|SPUSED|SUBST\$|TMREAD|VERSON|WAVSET|ACCEL|ARYOP|BGCHK|BGCLR|BGGET|BGOFS|BGPUT|BGROT|BGVAR|COLOR|DATE\$|EFCON|FILES|FLOOR|GCLIP|GCOPY|GFILL|GLINE|GLOAD|GPAGE|GPRIO|GPSET|GSAVE|GYROA|GYROV|INSTR|LEFT\$|MPEND|MPGET|MPSET|ROUND|RSORT|SHIFT|SPCHK|SPCHR|SPCLR|SPCOL|SPDEF|SPOFS|SPROT|SPSET|SPVAR|STICK|TIME\$|TOUCH|VSYNC|WIDTH|ACLS|ACOS|ASIN|ATAN|ATTR|BEEP|BIN\$|CEIL|CHR\$|COPY|COSH|CSRX|CSRY|CSRZ|FADE|FILL|GBOX|GCLS|GOFS|GTRI|HEX\$|IFFT|LOAD|MID\$|PUSH|RNDF|SAVE|SINH|SORT|STR\$|TALK|TANH|WAIT|XOFF|ABS|ASC|CLS|COS|DEG|EXP|FFT|KEY|LEN|LOG|MAX|MIN|POW|POP|RAD|RGB|RND|SGN|SIN|SQR|TAN|VAL|XON/igm,text,list);
		find(false     ,/[A-Z_][A-Z0-9_]*[$%#]?/igm,text,list); //must be after keyword and function. Prevents functions/keywords from being highlighted in the middle of user variable/function names
		find(false     ,/(?:\d*\.)?\d+(?=E)/igm,text,list); //must be before number. Causes numbers using E without a digit after to not be highlighted
		find(false     ,/&amp;&amp;|&&/igm,text,list); //must be before number. Makes sure code like 7&&HEAD is not interpreted as a hex number.
		find("number"  ,/-?(?:(?:\d*?\.(?:\d+(?:E-?\d+)?)?)|(?:\d+(?:E-?\d+)?))#?|(?:&amp;|&)H[\dA-F]+|(?:&amp;|&)B[01]+|#[A-Z\d]+/igm,text,list);
		//find("number"  ,/\.\d*/igm,text,list); // .x and . numbers handled separately because REASONS
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
		codeElement.innerHTML=output;
	};
	
}) ();
