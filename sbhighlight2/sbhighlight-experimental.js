var keywords=["BREAK","CALL","COMMON","CONTINUE","DATA","DEC","DEF","DIM","ELSE","ELSEIF","END","ENDIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","REM","REPEAT","RESTORE","RETURN","STOP","SWAP","THEN","UNTIL","USE","VAR","WEND","WHILE"];
var functions=["ABS","ACCEL","ACLS","ACOS","ARYOP","ASC","ASIN","ATAN","ATTR","BACKCOLOR","BACKTRACE","BEEP","BGANIM","BGCHK","BGCLIP","BGCLR","BGCOLOR","BGCOORD","BGCOPY","BGFILL","BGFUNC","BGGET","BGHIDE","BGHOME","BGLOAD","BGMCHK","BGMCLEAR","BGMCONT","BGMPAUSE","BGMPLAY","BGMPRG","BGMPRGA","BGMSET","BGMSETD","BGMSTOP","BGMVAR","BGMVOL","BGOFS","BGPAGE","BGPUT","BGROT","BGSAVE","BGSCALE","BGSCREEN","BGSHOW","BGSTART","BGSTOP","BGVAR","BIN$","BIQUAD","BQPARAM","BREPEAT","BUTTON","CALLIDX","CEIL","CHKCALL","CHKCHR","CHKFILE","CHKLABEL","CHKVAR","CHR$","CLASSIFY","CLIPBOARD","CLS","COLOR","CONTROLLER","COPY","COS","COSH","CSRX","CSRY","CSRZ","DATE$","DEG","DELETE","DIALOG","DISPLAY","DLCOPEN","DTREAD","EFCOFF","EFCON","EFCSET","EFCWET","ERRLINE","ERRNUM","ERRPRG","EXP","EXTFEATURE","FADE","FADECHK","FFT","FFTWFN","FILES","FILL","FLOOR","FONTDEF","FORMAT$","FREEMEM","GBOX","GCIRCLE","GCLIP","GCLS","GCOLOR","GCOPY","GFILL","GLINE","GLOAD","GOFS","GPAGE","GPAINT","GPRIO","GPSET","GPUTCHR","GSAVE","GSPOIT","GTRI","GYROA","GYROSYNC","GYROV","HARDWARE","HEX$","IFFT","INKEY$","INSTR","KEY","LEFT$","LEN","LOAD","LOCATE","LOG","MAINCNT","MAX","MICDATA","MICPOS","MICSAVE","MICSIZE","MICSTART","MICSTOP","MID$","MILLISEC","MIN","MPCOUNT","MPEND","MPGET","MPHOST","MPLOCAL","MPNAME$","MPRECV","MPSEND","MPSET","MPSTART","MPSTAT","OPTION","PCMCONT","PCMPOS","PCMSTOP","PCMSTREAM","PCMVOL","POP","POW","PRGDEL","PRGEDIT","PRGGET$","PRGINS","PRGNAME$","PRGSET","PRGSIZE","PRGSLOT","PROJECT","PUSH","RAD","RANDOMIZE","RENAME","RESULT","RGB","RGBREAD","RIGHT$","RINGCOPY","RND","RNDF","ROUND","RSORT","SAVE","SCROLL","SGN","SHIFT","SIN","SINH","SNDSTOP","SORT","SPANIM","SPCHK","SPCHR","SPCLIP","SPCLR","SPCOL","SPCOLOR","SPCOLVEC","SPDEF","SPFUNC","SPHIDE","SPHITINFO","SPHITRC","SPHITSP","SPHOME","SPLINK","SPOFS","SPPAGE","SPROT","SPSCALE","SPSET","SPSHOW","SPSTART","SPSTOP","SPUNLINK","SPUSED","SPVAR","SQR","STICK","STICKEX","STR$","SUBST$","SYSBEEP","TABSTEP","TALK","TALKCHK","TALKSTOP","TAN","TANH","TIME$","TMREAD","TOUCH","UNSHIFT","VAL","VERSION","VISIBLE","VSYNC","WAIT","WAVSET","WAVSETA","WIDTH","XOFF","XON","XSCREEN"];

function highlight(code,callback){
	var i,c,isAlpha,isDigit;
	function next(){
		i++;
		c=code.charAt(i);
		isAlpha=(c>='A'&&c<='Z'||c>='a'&&c<='z');
		isDigit=(c>='0'&&c<='9');
	}
	
	var afterOption=false,afterX=false,afterCall=false,afterMinus=false,after3=false,buffer="";
	
	function jump(pos){
		i=pos-1;
		next();
	}
	
	var prev=0;
	function push(type,numberCanHasNegative){
		var word=code.substring(prev,i);
		prev=i;
		
		var oldAfterOption=afterOption;
		var oldAfterX=afterX;
		var oldAfterCall=afterCall;
		var oldAfterMinus=afterMinus;
		var oldAfter3=after3;
		if(word!=" " && word!="\t"){
			afterOption=afterX=afterCall=after3=false;
		}
		afterMinus=false;
		if(oldAfterMinus){
			//negative number
			if(numberCanHasNegative){
				callback(buffer,"negative-sign operator");
			//something else
			}else{
				callback(buffer,"operator");
			}
		}
		if(oldAfter3){
			if(word=="DS"||word=="ds"||word=="Ds"||word=="dS"){
				callback(buffer,"xon-xoff-3 xon-xoff-mode function");
				type="xon-xoff-DS xon-xoff-mode function";
			}else{
				callback(buffer,"number");
			}
		}
		if(type=="word"){
			var upper=word.toUpperCase();
			//OPTION modes
			if(oldAfterOption && (upper=="DEFINT"||upper=="STRICT")){
				type="option-mode function";
			//XON/XOFF modes
			}else if(oldAfterX && (upper=="MOTION"||upper=="EXPAD"||upper=="MIC"||upper=="COMPAT"||upper=="WIIU"){
				type="xon-xoff-mode function";
			//CALL modes
			}else if(oldAfterCall && (upper=="BG"||upper=="SPRITE"){
				type="call-mode keyword";
			//TO and STEP
			}else if(upper=="TO"||upper=="STEP"){
				type="to-step keyword";
			//TRUE and FALSE
			}else if(upper=="TRUE"||upper=="FALSE"){
				type="true-false keyword";
			//named operators
			}else if(upper=="DIV"||upper=="MOD"||upper=="AND"||upper=="OR"||upper=="XOR"||upper=="NOT"){
				type="word-operator keyword";
			//OPTION
			}else if(upper=="OPTION"){
				type="option function";
				afterOption=true;
			//XON and XOFF
			}else if(upper=="XON"||upper=="XOFF"){
				type="xon-xoff function";
				afterX=true;
			//CALL
			}else if(upper=="CALL"){
				afterCall=true;
			//other keywords
			}else if(keywords.indexOf(upper)>=0){
				type="keyword";
			//other functions
			}else if(functions.indexOf(upper)>=0){
				type="function";
			//other
			}else{
				type="variable";
			}
		}
		//3 after XON/XOFF
		if(oldAfterX && word=="3"){
			after3=true;
			buffer=word;
			return
		//-
		}else if(word=="-"){
			afterMinus=true;
			buffer=word;
			return;
		//after minus
		}
		callback(word,type);
	}
	
	jump(0);
	//loop until the end of the string
	while(c){
		//
		//keywords, functions, variables
		//
		if(isAlpha||c=='_'){
			next();
			//read name
			while(isAlpha||isDigit||c=='_'){
				next();
			}
			//read type suffix
			if(c=='#'||c=='%'||c=='$'){
				next();
			}
			//push word type
			push("word");
		//
		//numbers
		//
		}else if(isDigit||c=='.'){
			//if digit was found, read all of them
			while(isDigit){
				next();
			}
			//if there's a decimal point
			if(c=='.'){
				next();
				//read digits after
				if(isDigit){
					next();
					while(isDigit){
						next();
					}
				}else{
					//if GOTO is available: GOTO @skip_e
					if(c=='#'){
						next();
					}
					push("number",true);
					continue;
				}
			}
			//E notation
			if(c=='E'||c=='e'){
				var ePos=i;
				next();
				//check for + or -
				if(c=='+'||c=='-'){
					next();
				}
				//read digits
				if(isDigit){
					next();
					while(isDigit){
						next();
					}
				//no digits (invalid)
				}else{
					jump(ePos);
					push();
					continue;
				}
			}
			//(if GOTO is available: @skip_e)
			//read float suffix
			if(c=='#'){
				next();
			}
			push("number",true);
		//
		//strings
		//
		}else switch(c){
		case '"':
			next();
			//read characters until another quote, line ending, or end of input
			while(c && c!='"' && c!='\n' && c!='\r'){
				next();
			}
			//read closing quote
			if(c=='"'){
				next();
			}
			push("string");
		//
		//comments
		//
		break;case '\'':
			next();
			//read characters until line ending or end of input
			while(c && c!='\n' && c!='\r'){
				next();
			}
			push("comment");
		//
		//logical AND, hexadecimal, binary
		//
		break;case '&':
			next();
			switch(c){
			//logical and
			case '&':
				next();
				push("operator");
			//hexadecimal
			break;case 'H':case 'h':
				var hPos=i;
				next();
				//read hexadecimal digits
				if(isDigit||c>='A'&&c<='F'||c>='a'&&c<='f'){
					next();
					while(isDigit||c>='A'&&c<='F'||c>='a'&&c<='f'){
						next();
					}
					push("number");
				}else{
					jump(hPos);
					push();
				}
			//binary
			break;case 'B':case 'b':
				var bPos=i;
				next();
				//read hexadecimal digits
				if(c=='0'||c=='1'){
					next();
					while(c=='0'||c=='1'){
						next();
					}
					push("number");
				}else{
					jump(bPos);
					push();
				}
			//invalid &
			break;default:
				push();
			}
		//
		//labels
		//
		break;case '@':
			next();
			//read name
			while(isDigit||isAlpha||c=='_'){
				next();
			}
			//ok
			push("label");
		//
		//constants
		//
		break;case '#':
			next();
			//read name
			if(isDigit||isAlpha){
				next();
				while(isDigit||isAlpha){
					next();
				}
				push("number");
			}else{
				push();
			}
		//
		//logical or
		//
		break;case '|':
			next();
			//logical or
			if(c=='|'){
				next();
				push("operator");
			//invalid
			}else{
				push();
			}
		//
		//less than, less than or equal, left shift
		//
		break;case '<':
			next();
			//<= <<
			if(c=='='||c=='<'){
				next();
			}
			push("operator");
		//
		//greater than, greater than or equal, right shift
		//
		break;case '>':
			next();
			//>= >>
			if(c=='='||c=='>'){
				next();
			}
			push("operator");
		//
		//equal, equal more
		//
		break;case '=':
			next();
			//==
			if(c=='='){
				next();
				push("operator");
			}else{
				push("equals");
			}
		//
		//logical not, not equal
		//
		break;case '!':
			next();
			// !=
			if(c=='='){
				next();
			}
			push("operator");
		//
		//add, subtract, multiply, divide
		//
		break;case '+':case '-':case '*':case '/':
			next();
			push("operator");
		break;case '?':
			next();
			push("question-mark");
		//
		//other
		//
		break;default:
			next();
			push();
		}
	}
	if(after3){
		callback(buffer,"number");
	}else if(afterMinus){
		callback(buffer,"operator");
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
