var keywords=["BREAK","CALL","COMMON","CONTINUE","DATA","DEC","DEF","DIM","ELSE","ELSEIF","END","ENDIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","REM","REPEAT","RESTORE","RETURN","STOP","SWAP","THEN","UNTIL","USE","VAR","WEND","WHILE",]
var functions=["ABS","ACCEL","ACLS","ACOS","ARYOP","ASC","ASIN","ATAN","ATTR","BACKCOLOR","BACKTRACE","BEEP","BGANIM","BGCHK","BGCLIP","BGCLR","BGCOLOR","BGCOORD","BGCOPY","BGFILL","BGFUNC","BGGET","BGHIDE","BGHOME","BGLOAD","BGMCHK","BGMCLEAR","BGMCONT","BGMPAUSE","BGMPLAY","BGMPRG","BGMPRGA","BGMSET","BGMSETD","BGMSTOP","BGMVAR","BGMVOL","BGOFS","BGPAGE","BGPUT","BGROT","BGSAVE","BGSCALE","BGSCREEN","BGSHOW","BGSTART","BGSTOP","BGVAR","BIN$","BIQUAD","BQPARAM","BREPEAT","BUTTON","CALLIDX","CEIL","CHKCALL","CHKCHR","CHKFILE","CHKLABEL","CHKVAR","CHR$","CLASSIFY","CLIPBOARD","CLS","COLOR","CONTROLLER","COPY","COS","COSH","CSRX","CSRY","CSRZ","DATE$","DEG","DELETE","DIALOG","DISPLAY","DLCOPEN","DTREAD","EFCOFF","EFCON","EFCSET","EFCWET","ERRLINE","ERRNUM","ERRPRG","EXP","EXTFEATURE","FADE","FADECHK","FFT","FFTWFN","FILES","FILL","FLOOR","FONTDEF","FORMAT$","FREEMEM","GBOX","GCIRCLE","GCLIP","GCLS","GCOLOR","GCOPY","GFILL","GLINE","GLOAD","GOFS","GPAGE","GPAINT","GPRIO","GPSET","GPUTCHR","GSAVE","GSPOIT","GTRI","GYROA","GYROSYNC","GYROV","HARDWARE","HEX$","IFFT","INKEY$","INSTR","KEY","LEFT$","LEN","LOAD","LOCATE","LOG","MAINCNT","MAX","MICDATA","MICPOS","MICSAVE","MICSIZE","MICSTART","MICSTOP","MID$","MILLISEC","MIN","MPCOUNT","MPEND","MPGET","MPHOST","MPLOCAL","MPNAME$","MPRECV","MPSEND","MPSET","MPSTART","MPSTAT","OPTION","PCMCONT","PCMPOS","PCMSTOP","PCMSTREAM","PCMVOL","POP","POW","PRGDEL","PRGEDIT","PRGGET$","PRGINS","PRGNAME$","PRGSET","PRGSIZE","PRGSLOT","PROJECT","PUSH","RAD","RANDOMIZE","RENAME","RESULT","RGB","RGBREAD","RIGHT$","RINGCOPY","RND","RNDF","ROUND","RSORT","SAVE","SCROLL","SGN","SHIFT","SIN","SINH","SNDSTOP","SORT","SPANIM","SPCHK","SPCHR","SPCLIP","SPCLR","SPCOL","SPCOLOR","SPCOLVEC","SPDEF","SPFUNC","SPHIDE","SPHITINFO","SPHITRC","SPHITSP","SPHOME","SPLINK","SPOFS","SPPAGE","SPROT","SPSCALE","SPSET","SPSHOW","SPSTART","SPSTOP","SPUNLINK","SPUSED","SPVAR","SQR","STICK","STICKEX","STR$","SUBST$","SYSBEEP","TABSTEP","TALK","TALKCHK","TALKSTOP","TAN","TANH","TIME$","TMREAD","TOUCH","UNSHIFT","VAL","VERSON","VISIBLE","VSYNC","WAIT","WAVSET","WAVSETA","WIDTH","XOFF","XON","XSCREEN"]

function highlight(code,callback){
	var i=-1,c,isAlpha,isNum
	function scan(){
		i++
		c=code.charAt(i)
		isAlpha=(c>='A'&&c<='Z'||c>='a'&&c<='z')
		isNum=(c>='0'&&c<='9')
	}
	
	var prev=0
	function push(type){
		var word=code.substring(prev,i)
		prev=i
		if(type===true){
			var upper=word.toUpperCase()
			if(upper=="TO"||upper=="STEP"){
				type="variable keyword"
			if(upper=="TRUE"||upper=="FALSE"){
				type="number keyword"
			}else if(upper=="DIV"||upper=="MOD"||upper=="AND"||upper=="OR"||upper=="XOR"||upper=="NOT"){
				type="operator keyword"
			}else if(keywords.indexOf(upper)>=0){
				type="keyword"
			}else if(functions.indexOf(upper)>=0){
				type="function"
			}else{
				type="variable"
			}
		}
		callback(word,type)
	}
	
	scan()
		
	var start
	while(1){
		//alert(i)
		if(isAlpha||c=='_'){
			do{scan()}while(isAlpha||isNum||c=='_')
			if(c=='#'||c=='%'||c=="$")scan()
			push(true)
		}else if(isNum||c=='.'){
			while(isNum)scan()
			if(c=='.'){
				start=i
				do{scan()}while(isNum)
				if(i==start+1){
					if(c=='#')scan()
					push("number")
					continue
				}
			}
			if(c=='E'||c=='e'){
				var start2=i
				scan()
				if(c=='+'||c=='-')scan()
				start=i
				while(isNum)scan()
				if(i==start){
					i=start2-1
					scan()
					push("number")
					continue
				}
			}
			if(c=='#')scan()
			push("number")
		}else if(c=='"'){
			do{scan()}while(c!='"'&&c!='\n'&&c!='\r')
			if(c=='"')scan()
			push("string")
		}else if(c=='\''){
			do{scan()}while(c!='\n'&&c!='\r')
			push("comment")
		}else if(c=='&'){
			scan()
			if(c=='&'){
				scan()
				push("operator")
			}else if(c=='H'||c=='h'){
				start=i
				do{scan()}while(isNum||c>='A'&&c<='F'||c>='a'&&c<='f')
				if(i==start+1){
					i=start-1
					scan()
					push()
				}else{
					push("number")
				}
			}else if(c=='B'||c=='b'){
				start=i
				do{scan()}while(c=='0'||c=='1')
				if(i==start+1){
					i=start-1
					scan()
					push()
				}else{
					push("number")
				}
			}else{
				push()
			}
		}else if(c=='@'){
			do{scan()}while(isNum||isAlpha||c=='_')
			push("label")
		}else if(c=='#'){
			start=i
			do{scan()}while(isNum||isAlpha)
			if(i==start+1)
				push()
			else
				push("number")
		}else if(c=='|'){
			scan()
			if(c=='|'){
				scan()
				push("operator")
			}else{
				push()
			}
		}else if(c=='<'){
			scan()
			if(c=='='||c=='<')scan()
			push("operator")
		}else if(c=='>'){
			scan()
			if(c=='='||c=='>')scan()
			push("operator")
		}else if(c=='='){
			scan()
			if(c=='='){
				scan()
				push("operator")
			}else{
				push()
			}
		}else if(c=='!'){
			scan()
			if(c=='=')scan()
			push("operator")
		}else if(c=='+'||c=='-'||c=='*'||c=='/'){
			scan()
			push("operator")
		}else if(c==''){
			break
		}else{
			scan()
			push()
		}
	}
}

function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;");
}

function applySyntaxHighlighting(element){
	var html="",prevType=false
	function callback(word,type){
		if(type!=prevType){
			if(prevType)html+="</span>"
			if(type)html+="<span class=\""+type+"\">"
		}
		html+=escapeHTML(word)
		prevType=type
	}
	
	highlight(element.textContent,callback)
	if(prevType)html+="</span>"
	element.innerHTML=html
}
