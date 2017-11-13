var keywords=["BREAK","CALL","COMMON","CONTINUE","DATA","DEC","DEF","DIM","ELSE","ELSEIF","END","ENDIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","REM","REPEAT","RESTORE","RETURN","STOP","SWAP","THEN","UNTIL","USE","VAR","WEND","WHILE",]
var functions=["ABS","ACCEL","ACLS","ACOS","ARYOP","ASC","ASIN","ATAN","ATTR","BACKCOLOR","BACKTRACE","BEEP","BGANIM","BGCHK","BGCLIP","BGCLR","BGCOLOR","BGCOORD","BGCOPY","BGFILL","BGFUNC","BGGET","BGHIDE","BGHOME","BGLOAD","BGMCHK","BGMCLEAR","BGMCONT","BGMPAUSE","BGMPLAY","BGMPRG","BGMPRGA","BGMSET","BGMSETD","BGMSTOP","BGMVAR","BGMVOL","BGOFS","BGPAGE","BGPUT","BGROT","BGSAVE","BGSCALE","BGSCREEN","BGSHOW","BGSTART","BGSTOP","BGVAR","BIN$","BIQUAD","BQPARAM","BREPEAT","BUTTON","CALLIDX","CEIL","CHKCALL","CHKCHR","CHKFILE","CHKLABEL","CHKVAR","CHR$","CLASSIFY","CLIPBOARD","CLS","COLOR","CONTROLLER","COPY","COS","COSH","CSRX","CSRY","CSRZ","DATE$","DEG","DELETE","DIALOG","DISPLAY","DLCOPEN","DTREAD","EFCOFF","EFCON","EFCSET","EFCWET","ERRLINE","ERRNUM","ERRPRG","EXP","EXTFEATURE","FADE","FADECHK","FFT","FFTWFN","FILES","FILL","FLOOR","FONTDEF","FORMAT$","FREEMEM","GBOX","GCIRCLE","GCLIP","GCLS","GCOLOR","GCOPY","GFILL","GLINE","GLOAD","GOFS","GPAGE","GPAINT","GPRIO","GPSET","GPUTCHR","GSAVE","GSPOIT","GTRI","GYROA","GYROSYNC","GYROV","HARDWARE","HEX$","IFFT","INKEY$","INSTR","KEY","LEFT$","LEN","LOAD","LOCATE","LOG","MAINCNT","MAX","MICDATA","MICPOS","MICSAVE","MICSIZE","MICSTART","MICSTOP","MID$","MILLISEC","MIN","MPCOUNT","MPEND","MPGET","MPHOST","MPLOCAL","MPNAME$","MPRECV","MPSEND","MPSET","MPSTART","MPSTAT","OPTION","PCMCONT","PCMPOS","PCMSTOP","PCMSTREAM","PCMVOL","POP","POW","PRGDEL","PRGEDIT","PRGGET$","PRGINS","PRGNAME$","PRGSET","PRGSIZE","PRGSLOT","PROJECT","PUSH","RAD","RANDOMIZE","RENAME","RESULT","RGB","RGBREAD","RIGHT$","RINGCOPY","RND","RNDF","ROUND","RSORT","SAVE","SCROLL","SGN","SHIFT","SIN","SINH","SNDSTOP","SORT","SPANIM","SPCHK","SPCHR","SPCLIP","SPCLR","SPCOL","SPCOLOR","SPCOLVEC","SPDEF","SPFUNC","SPHIDE","SPHITINFO","SPHITRC","SPHITSP","SPHOME","SPLINK","SPOFS","SPPAGE","SPROT","SPSCALE","SPSET","SPSHOW","SPSTART","SPSTOP","SPUNLINK","SPUSED","SPVAR","SQR","STICK","STICKEX","STR$","SUBST$","SYSBEEP","TABSTEP","TALK","TALKCHK","TALKSTOP","TAN","TANH","TIME$","TMREAD","TOUCH","UNSHIFT","VAL","VERSON","VISIBLE","VSYNC","WAIT","WAVSET","WAVSETA","WIDTH","XOFF","XON","XSCREEN"]

//I can't bring myself to use === and !==... they just look too silly lol

function highlight(code,callback){
	var i=-1,c,isAlpha,isNum;
	function scan(){
		i++;
		c=code.charAt(i);
		isAlpha=(c>='A'&&c<='Z'||c>='a'&&c<='z');
		isNum=(c>='0'&&c<='9');
	}
	
	var prev=0;
	function push(type){
		var word=code.substring(prev,i);
		prev=i;
		if(type===true){
			var upper=word.toUpperCase();
			
			if(upper=="TO"||upper=="STEP"){
				type="to-step keyword";
			}else if(upper=="TRUE"||upper=="FALSE"){
				type="true-false keyword";
			}else if(upper=="DIV"||upper=="MOD"||upper=="AND"||upper=="OR"||upper=="XOR"||upper=="NOT"){
				type="word-operator keyword";
			}else if(keywords.indexOf(upper)>=0){
				type="keyword";
			}else if(functions.indexOf(upper)>=0){
				type="function";
			}else{
				type="variable";
			}
		}
		callback(word,type);
	}
	
	scan();
		
	var start;
	while(c){
		//keywords, functions, variables
		if(isAlpha||c=='_'){
			//read name
			do{
				scan();
			}while(isAlpha||isNum||c=='_');
			//read type suffix
			if(c=='#'||c=='%'||c=="$"){
				scan();
			}
			push(true);
		//numbers
		}else if(isNum||c=='.'){
			//read digits before decimal point
			while(isNum){
				scan();
			}
			//if there's a decimal point
			if(c=='.'){
				//read digits after
				start=i;
				do{
					scan();
				}while(isNum)
				//if no digits
				if(i==start+1){
					//check for float type suffix
					if(c=='#'){
						scan();
					}
					//skip E notation
					push("number");
					continue;
				}
			}
			//E notation
			if(c=='E'||c=='e'){
				start=i;
				//check for + or -
				scan();
				if(c=='+'||c=='-'){
					scan()
				}
				//read digits
				var start2=i;
				while(isNum){
					scan();
				}
				//if no digits (invalid)
				if(i==start2){
					i=start-1;
					scan();
					push();
					continue;
				}
			}
			//read float suffix
			if(c=='#'){
				scan();
			}
			push("number");
		//strings
		}else switch(c){
		case '"':
			//read characters until another quote, line ending, or end of input
			do{
				scan();
			}while(c && c!='"' && c!='\n' && c!='\r')
			//read closing quote
			if(c=='"'){
				scan()
			}
			push("string")
		//comments
		break;case '\'':
			//read characters until line ending or end of input
			do{
				scan();
			}while(c&&c!='\n'&&c!='\r')
			push("comment");
		//logical and, hexadecimal, binary
		break;case '&':
			scan();
			switch(c){
			//logical and
			case '&':
				scan();
				push("operator");
			//hexadecimal
			break;case 'H':case 'h':
				//read hexadecimal digits
				start=i;
				do{
					scan();
				}while(isNum||c>='A'&&c<='F'||c>='a'&&c<='f')
				//if no digits found
				if(i==start+1){
					i=start-1;
					scan();
					push();
				//valid number
				}else{
					push("number");
				}
			//binary
			break;case 'B':case 'b':
				//read binary digits
				start=i;
				do{
					scan();
				}while(c=='0'||c=='1')
				//if no digits
				if(i==start+1){
					i=start-1;
					scan();
					push();
				//valid number
				}else{
					push("number");
				}
			//invalid &
			break;default:
				push();
			}
		//labels
		break;case '@':
			do{
				scan();
			}while(isNum||isAlpha||c=='_')
			push("label");
		//constants
		break;case '#':
			start=i;
			do{
				scan();
			}while(isNum||isAlpha)
			if(i==start+1){
				push();
			}else{
				push("number");
			}
		//logical or
		break;case '|':
			scan();
			if(c=='|'){
				scan();
				push("operator");
			}else{
				push();
			}
		//less than, less than or equal, left shift
		break;case '<':
			scan();
			if(c=='='||c=='<'){
				scan();
			}
			push("operator");
		//greater than, greater than or equal, right shift
		break;case '>':
			scan();
			if(c=='='||c=='>'){
				scan();
			}
			push("operator");
		//set, equal
		break;case '=':
			scan();
			//==
			if(c=='='){
				scan();
				push("operator");
			}else{
				push();
				push("equals");
			}
		//logical not, not equal
		break;case '!':
			//check for =
			scan();
			if(c=='='){
				scan();
			}
			push("operator");
		//add, subtract, multiply, divide
		break;case '+':case '-':case '*':case '/':
			scan();
			push("operator");
		//other
		break;default:
			scan();
			push();
		}
	}
}

//escape < and &
function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;");
}

function applySyntaxHighlighting(element){
	var html="",prevType=false;
	//this is called for each highlightable token
	function callback(word,type){
		//only make a new span if the CSS class has changed
		if(type!=prevType){
			//close previous span
			if(prevType){
				html+="</span>";
			}
			//open new span
			if(type){
				html+="<span class=\""+type+"\">";
			}
		}
		html+=escapeHTML(word);
		prevType=type;
	}
	
	highlight(element.textContent,callback);
	//close last span
	if(prevType){
		html+="</span>";
	}
	element.innerHTML=html;
}
