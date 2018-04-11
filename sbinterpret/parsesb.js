//list of keywords
//does not include OPERATORS or CONSTANTS or fake keywords TO/STEP
var KEYWORDS=["BREAK","CALL","COMMON","CONTINUE","DATA","DEC","DEF","DIM","ELSE","ELSEIF","END","ENDIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","REM","REPEAT","RESTORE","RETURN","STOP","SWAP","THEN","UNTIL","USE","VAR","WEND","WHILE"];
//built-in functions
var BUILTINS=["ABS","ACCEL","ACLS","ACOS","ARYOP","ASC","ASIN","ATAN","ATTR","BACKCOLOR","BACKTRACE","BEEP","BGANIM","BGCHK","BGCLIP","BGCLR","BGCOLOR","BGCOORD","BGCOPY","BGFILL","BGFUNC","BGGET","BGHIDE","BGHOME","BGLOAD","BGMCHK","BGMCLEAR","BGMCONT","BGMPAUSE","BGMPLAY","BGMPRG","BGMPRGA","BGMSET","BGMSETD","BGMSTOP","BGMVAR","BGMVOL","BGOFS","BGPAGE","BGPUT","BGROT","BGSAVE","BGSCALE","BGSCREEN","BGSHOW","BGSTART","BGSTOP","BGVAR","BIN$","BIQUAD","BQPARAM","BREPEAT","BUTTON","CEIL","CHKCALL","CHKCHR","CHKFILE","CHKLABEL","CHKVAR","CHR$","CLASSIFY","CLIPBOARD","CLS","COLOR","CONTROLLER","COPY","COS","COSH","DEG","DELETE","DIALOG","DISPLAY","DLCOPEN","DTREAD","EFCOFF","EFCON","EFCSET","EFCWET","EXP","EXTFEATURE","FADE","FADECHK","FFT","FFTWFN","FILES","FILL","FLOOR","FONTDEF","FORMAT$","GBOX","GCIRCLE","GCLIP","GCLS","GCOLOR","GCOPY","GFILL","GLINE","GLOAD","GOFS","GPAGE","GPAINT","GPRIO","GPSET","GPUTCHR","GSAVE","GSPOIT","GTRI","GYROA","GYROSYNC","GYROV","HEX$","IFFT","INKEY$","INSTR","KEY","LEFT$","LEN","LOAD","LOCATE","LOG","MAX","MICDATA","MICSAVE","MICSTART","MICSTOP","MID$","MIN","MPEND","MPGET","MPNAME$","MPRECV","MPSEND","MPSET","MPSTART","MPSTAT","PCMCONT","PCMSTOP","PCMSTREAM","PCMVOL","POP","POW","PRGDEL","PRGEDIT","PRGGET$","PRGINS","PRGNAME$","PRGSET","PRGSIZE","PROJECT","PUSH","RAD","RANDOMIZE","RENAME","RGB","RGBREAD","RIGHT$","RINGCOPY","RND","RNDF","ROUND","RSORT","SAVE","SCROLL","SGN","SHIFT","SIN","SINH","SNDSTOP","SORT","SPANIM","SPCHK","SPCHR","SPCLIP","SPCLR","SPCOL","SPCOLOR","SPCOLVEC","SPDEF","SPFUNC","SPHIDE","SPHITINFO","SPHITRC","SPHITSP","SPHOME","SPLINK","SPOFS","SPPAGE","SPROT","SPSCALE","SPSET","SPSHOW","SPSTART","SPSTOP","SPUNLINK","SPUSED","SPVAR","SQR","STICK","STICKEX","STR$","SUBST$","TALK","TALKCHK","TALKSTOP","TAN","TANH","TMREAD","TOUCH","UNSHIFT","VAL","VISIBLE","VSYNC","WAIT","WAVSET","WAVSETA","WIDTH","XSCREEN"];
//system variables
var SYSTEMVARS=["CALLIDX","CSRX","CSRY","CSRZ","DATE$","ERRLINE","ERRNUM","ERRPRG","FREEMEM","HARDWARE","MAINCNT","MICPOS", "MICSIZE","MILLISEC","MPCOUNT","MPHOST","MPLOCAL","PCMPOS","PRGSLOT","RESULT","SYSBEEP","TABSTEP","TIME$","VERSION"];

//parser
//nextToken: function that returns the next token
//callback: output function
function parse(nextToken){
	//current token
	var type,word; //NOTE: word is only update right after next()ing. don't rely on it laaaaater
	//stored tokens
	var newType,newWord;
	//keep track of stored tokens
	var readNext=1;
	//false=not, 1=no paren, 2=()
	var defType=false,nextDefCommon=false,defs={};
	
	var blocks=[];
	var current={};
	var currentBlocks=[];
	
	function startBlock(){
		current.code=[];
		currentBlocks.push(current);
		current={};
	}
	function endBlock(){
		var block=currentBlocks.pop();
		currentBlocks[currentBlocks.length-1].code.push(block);
	}
	function endDef(){
		var block=currentBlocks.pop();
		defs[block.name]=block;
	}
	
	var expr=[];
	
	current.type="main";
	startBlock();
	
	do{
		try{
			readStatement();
		}catch(error){
			if(error.name==="ParseError"){
				return error.message;
			//bad error!!!
			}else{
				throw error;
				return;
			}
		}
	}while(type!=="eof");;;
	
	//read a "line" of code
	function readStatement(){
		next();
		switch(type){
			//keywords with no arguments
			case "BREAK":
				current.type="BREAK";
			break;case "CONTINUE":
				current.type="CONTINUE";
			break;case "ELSE":
				assert(currentBlock().type=="IF"||currentBlock().type=="ELSEIF","ELSE without IF");
				endBlock();
				current.type="ELSE";
				startBlock();
			break;case "ENDIF":
				assert(currentBlock().type=="IF","WEND without WHILE");
				endBlock();			
			break;case "STOP":
				current.type="STOP";
			break;case "REPEAT":
				current.type="REPEAT";
				startBlock();
			break;case "WEND":
				assert(currentBlock().type=="WHILE","WEND without WHILE");
				endBlock();
			//CALL
			break;case "CALL":
				current.type="CALL";
				//CALL SPRITE and CALL BG
				if(peekWord("SPRITE")||peekWord("BG")){
					readToken("word");
					current.mode=""//TODO: sprite or BG
				//regular CALL
				}else{
					current.inputs=readList(readExpression);
					if(readToken("OUT","keyword"))
						current.outputs=readList(readVariable);
				}
			//COMMON
			break;case "COMMON":
				assert(peekToken("DEF"),"COMMON without DEF");
				nextDefCommon=true;
			//DATA
			break;case "DATA":
				current.type="DATA";
				assert(current.inputs=readList(readExpression,true),"Missing list"); //should read constant expression
			//SWAP
			break;case "SWAP":
				current.type="SWAP";
				assert(current.variable=readVariable(),"Missing variable in SWAP");
				assert(readToken(","),"Missing comma in SWAP");
				assert(current.variable2=readVariable(),"Missing variable in SWAP");
			//READ
			break;case "READ":
				current.type="READ";
				assert(current.inputs=readList(readVariable,true),"Missing list");
			//DEC/INC
			break;case "DEC":
				current.type="DEC";
				assert(current.variable=readVariable(),"Missing DEC variable");
				if(readToken(","))
					assert(current.value=readExpression(),"Missing DEC amount");
			break;case "INC":
				current.type="INC";
				assert(current.variable=readVariable(),"Missing INC variable");
				if(readToken(","))
					assert(current.value=readExpression(),"Missing INC amount");
			//DEF
			break;case "DEF":
				assert(!defType,"Nested DEF");
				current.type="DEF";
				if(nextDefCommon)
					current.common=true;
				nextDefCommon=false;
				//read function name
				assert(readToken("word"),"Missing DEF name");
				current.name=word;
				//() form
				if(readToken("(")){
					defType=2;
					current.parenDef=true;
					//read argument list
					current.inputs=readList(readArgument,true);
					//read )
					assert(readToken(")"),"Missing \")\" after DEF arguments"
					);
				//subroutine/out form
				}else{
					defType=1;
					//read argument list
					current.inputs=readList(readArgument,true);
					//OUT
					//read output list
					if(readToken("OUT"))
						current.outputs=readList(readArgument,true);
				}
				startBlock();
			//VAR
			break;case "VAR":
				//assignment form
				if(peekToken("(")){
					current.type="assignment"
					readToken("(");
					assert(current.varName=readExpression(),"Missing var name");
					assert(readToken(")"),"missing )");
					//TODO - this
					while(readToken("[")){
						assert(readList(readExpression,true),"Missing array index");
						assert(readToken("]"),"Missing \"]\"");
					}
					assert(readToken("="),"missing =");
					current.value=readExpression();
				//normal form
				}else{
					current.type="DIM";
					assert(current.inputs=readList(readDeclaration),"Missing variable list");
				}
			//DIM
			break;case "DIM":
				current.type="DIM";
				assert(current.inputs=readList(readDeclaration),"Missing variable list");
			//IF, ELSEIF
			break;case "ELSEIF":
				assert(currentBlock().type=="IF"||currentBlock().type=="ELSEIF","ELSEIF without IF");
				endBlock();
				current.type="ELSEIF"
				current.condition=readExpression();
				startBlock();
			break;case "IF":
				current.type="IF"
				assert(current.condition=readExpression(),"Missing IF condition");
				assert(readToken("THEN")||readToken("GOTO"),"IF without THEN");
				//check goto vs then
				readToken("label");//optional
				startBlock();
			//END
			break;case "END":
				if(defType){
					defType=0;
					endDef();
				}else
					current.type="END";
			//EXEC/USE
			break;case "EXEC":
				current.type="EXEC";
				current.value=readExpression();
			break;case "USE":
				current.type="USE";
				current.value=readExpression();
			//FOR
			break;case "FOR":
				current.type="FOR";
				assert(current.variable=readVariable(),"Missing FOR variable");
				assert(readToken("="),"Missing = in FOR");
				current.start=readExpression();
				assert(readToken("word") && word==="TO","Missing TO in FOR");
				current.end=readExpression();
				if(readToken("word") && word==="STEP"){
					current.step=readExpression();
				}else
					readNext=0; //heck
				startBlock();
			//GOSUB GOTO RESTORE(?)
			break;case "GOSUB":
				current.type="GOSUB";
				if(!(current.label=readToken("label")))
					assert(current.label=readExpression(),"Missing argument to GOSUB");				
			break;case "GOTO":
				current.type="GOTO";
				if(!(current.label=readToken("label")))
					assert(current.label=readExpression(),"Missing argument to GOTO");
			break;case "RESTORE":
				current.type="RESTORE";
				if(!(current.label=readToken("label")))
					assert(current.label=readExpression(),"Missing argument to RESTORE");
			//WHILE <condition>
			break;case "WHILE":
				current.type="WHILE"
				assert(current.condition=readExpression(),"Missing argument to keyword");
				startBlock();
			//UNTIL <condition>
			break;case "UNTIL":
				assert(currentBlock().type=="REPEAT","UNTIL without REPEAT");
				assert(currentBlock().condition=readExpression(),"Missing UNTIL condition");
				endBlock();
			//INPUT
			break;case "INPUT":
				current.type="INPUT";
				current.inputs=readPrintList(readExpression);
			//LINPUT
			break;case "LINPUT":
				current.type="LINPUT";
				current.inputs=readPrintList(readExpression);
			//NEXT
			break;case "NEXT":
				assert(currentBlock().type=="FOR","NEXT without FOR");
				readExpression();
				endBlock();
			//ON
			break;case "ON":
				current.type="ON"
				current.condition=readExpression();
				assert(readToken("GOTO")||readToken("GOSUB"),"ON without GOTO/GOSUB");
				current.onMode=""//GOTO or GOSUB
				assert(current.labels=readList(readExpression,true),"Missing label list after ON");
			//PRINT
			break;case "PRINT":
				current.type="PRINT"
				current.inputs=readPrintList(readExpression);
			//REM
			break;case "REM":
				do{
					next();
				}while(type!=="linebreak" && type!=="eof");;;
			//RETURN
			break;case "RETURN":
				current.type="RETURN";
				if(defType===2)
					current.value=readExpression();
			//OUT/THEN
			break;case "OUT":case "THEN":
				assert(false,"Illegal OUT/THEN");
			//other words
			break;case "word":case "(":
				//var name=text;
				readNext=readNext-1;
				var x=readVariable(true);
				if(readToken("=")){
					current.type="assignment";
					current.variable=x;
					current.value=readExpression();
				}else{
					//HORRIBLE STUPID FAKE KEYWORDS!!!
					//XON/XOFF/OPTION
					// I hate you! :(
					// not nice >:[
					switch(x){
						case "XON":
							current.type="xon";
							if(readToken("word")){
								assert(word==="MOTION"||word==="EXPAD"||word==="MIC"||word==="WIIU"||word=="COMPAT","invalid option");
								current.feature=word;
							}else{
								//what the [heck] were you THINKING!?!??!
								assert(readToken("number"),"invalid option");
								assert(word==="3","invalid option");
								assert(readToken("word"),"invalid option");
								assert(word==="DS","invalid option");
								current.feature="3DS";
							}
						break;case "XOFF":
							current.type="xon";
							assert(readToken("word"));
							assert(word==="MOTION"||word==="EXPAD"||word==="MIC"||word=="COMPAT","invalid option");
							current.feature=word;
						break;case "OPTION":
							current.type="option";
							assert(readToken("word"),"invalid option");
							assert(word==="STRICT"||word==="DEFINT"||word==="TOOL","invalid option");
							current.option=word;
						//return to sanity, normal function call!
						break;default:
							current.type="function";
							current.name=x.name;
							current.inputs=readList(readExpression);
							if(readToken("OUT"))
								current.outputs=readList(readVariable);
							else
								current.outputs=[];
					}
				}
			//label
			break;case "label":
				current.type="label";
				current.label=word; //TODO: store label names
			//comment
			break;case "comment":
			//end
			break;case "eof":
			//line break, colon
			break;case ":":
			break;case "linebreak":
			break;default:
				assert(false,"Expected statement, got "+type);
		}
		if(current.type){
			currentBlocks[currentBlocks.length-1].code.push(current)//push to current block!
			current={}
		}
	}
	
	function currentBlock(){
		return currentBlocks[currentBlocks.length-1]
	}
	
	//check if next token is of a specific type
	function peekToken(wantedType){
		var prevType=type,prevWord=word;
		next();
		readNext=-1;
		newType=type;
		newWord=word;
		type=prevType;
		word=prevWord;
		return newType===wantedType;
	}
	//check if next token is of a specific type
	function peekWord(wantedWord){
		var prevType=type,prevWord=word;
		next();
		readNext=-1;
		newType=type;
		newWord=word;
		type=prevType;
		word=prevWord;
		return newType==="word" && newWord.trimLeft().toUpperCase()===wantedWord;
	}
	
	//Try to read a specific token
	function readToken(wantedType){
		next();
		if(type===wantedType){
			readNext=1;
			return true;
		}
		readNext=0;
		return false;
	}
	
	//Read list
	//reader: function to read item (readExpression etc.)
	//noNull: throw an error if a null value is found
	function readList(reader,noNull){
		var ret=[];
		var x=reader();
		if(x)
			ret.push(x);
		if(readToken(",","")){
			if(!x)
				ret.push(x);
			assert(x||!noNull,"Null value not allowed");
			do{
				assert(ret.push(reader())||!noNull,"Null value not allowed");
			}while(readToken(","));;;
		}
		return ret;
	}
	
	//read list of PRINT arguments
	function readPrintList(reader){
		var x=reader();
		if(!x)
			return [];
		var ret=[x];
		while(1){
			if(readToken(",")){
				ret.push(",");
			}else if(readToken(";")){
				ret.push(";");
			}else{
				return ret;
			}
			x=reader();
			if(!x)
				return ret;
			ret.push(x);
		}
	}
	
	//read normal expression
	//SHould return RPN list
	function readExpression(){
		expr=[];
		//var rpn=[],stack=[];
		//rpn parse tokens as they are read?
		if(readExpression2())
			return rpnFromExpr(expr);
		return false;
	}
	
	function prec(token){
		if(token.type==="unary"||token.type==="index")
			return Infinity
		else
			switch(token.name){
				case "*":case "/": case "DIV": case "MOD":
					return 10
				case "+":case "-":
					return 9
				case "<<":case ">>":
					return 8
				case "<":case "<=":case ">":case ">=":
					return 7
				case "==":case "!=":
					return 6
				case "AND":
					return 5
				case "XOR":
					return 4
				case "OR":
					return 3
				case "&&":
					return 2
				case "||":
					return 1
			}
		assert(false,"error prec")
	}
	function left(token){
		return 0
	}
	
	function rpnFromExpr(expr){
		var rpn=[],stack=[];
		for(var i=0;i<expr.length;i++){
			var token=expr[i];
			switch(token.type){
				case "literal":case "variable":case "function":case "index":
					rpn.push(token);
				break;case "operator":case "unary":
					while(stack.length){
						var top=stack[stack.length-1]
						if((prec(top)>prec(token) || (prec(top)==prec(token) && left(token)))&&top.type!="("){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
					stack.push(token);
				break;case "(":
					stack.push(token);
				break;case ")":
					while(1){
						var top=stack[stack.length-1]
						if(top.type!="("){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
					stack.pop();
				break;default:
				assert(false,"error typ")
			}
		}
		while(stack.length){
			rpn.push(stack.pop());
		}
		return rpn;
	}
	
	function readExpression2(){
		var ret=false;
		next();
		switch(type){
			//VAR()
			case "VAR":
				readVar();
			//function or variable
			break;case "word":
				var name=word;
				if(readToken("(")){
					var x=readList(readExpression2);
					expr.push({type:"function",name:name,args:x.length});
					assert(readToken(")"),"Missing \")\" in function call");
				}else
					expr.push({type:"variable",name:name});
			//CALL()
			break;case "CALL":
				assert(readToken("("),"Bad CALL");
				//CALL
				var x=readList(readExpression2);
				expr.push({type:"call",args:x.length});
				assert(readToken(")"),"Missing \")\" in CALL()");
				ret=true;
			//literal value
			break;case "number":case "string":case "label":
				expr.push({type:"literal",value:word});
				//literal
			//operator (unary)
			break;case "unary":case "minus":
				//unary op
				expr.push({type:"unary",name:word,args:1});
				assert(readExpression2(),"Missing operator argument");
			//open parenthesis
			break;case "(":
				expr.push({type:"("});
				readExpression2();
				assert(readToken(")"),"Missing \")\"");
				expr.push({type:")"});
			//other crap
			break;default:
				readNext=0;
				return false;
		}
		//read []s
		while(readToken("[")){
			assert(x=readList(readExpression2,true),"Missing array index");
			expr.push({type:"index",args:x.length+1});
			assert(readToken("]"),"Missing \"]\"");
		}
		//read infix operators
		while(readToken("operator")||readToken("minus")){
			expr.push({type:"operator",name:word,args:2});	
			assert(readExpression2(),"Operator missing second argument");
		}
		return true;
	}
	
	//read function definition argument
	function readArgument(){
		if(readToken("word")){
			var x=word;
			if(readToken("["))
				assert(readToken("]"),"Missing \"]\"");
			return x;
		}
		return false;
	}
	
	//read variable declaration
	function readDeclaration(){
		var ret={};
		if(readToken("word")){
			ret.name=word;
			if(readToken("[")){
				assert(ret.dims=readList(readExpression,true),"Missing array size");
				assert(readToken("]"),"Missing \"]\"");
			}else if(readToken("="))
				ret.value=readExpression();
			return ret;
		}
		return false;
	}
	
	//read function VAR()
	function readVar(){
		var ret;
		//"function" form of VAR
		if(readToken("(")){
			assert(ret=readExpression(),"Missing VAR argument");
			assert(readToken(")"),"Missing \")\" in VAR()");
		//bad VAR
		}else
			assert(false,"invalid VAR");
		return ret;
	}
	
	//keys:
	//name: [variable name expr token list]
	//indexes: [index list]
	function readVariable(noPrintVarName){
		var ret={name:"",indexes:[]};
		next();
		switch(type){
			case "VAR":
				ret.name=readVar();
			break;case "word":
				ret.name=word;
			break;default:
				readNext=0;
				return false;
		}
		while(readToken("[")){
			assert(ret.indexes.push(readList(readExpression)),"Missing index");
			assert(readToken("]"),"Missing \"]\"");
		}
		if(!ret.indexes)
			ret.indexes=undefined
		return ret;
	}
	
	//throw error with message if condition is false
	function assert(condition,message){
		if(!condition){
			console.log(message);
			var error=new Error(message);
			error.name="ParseError";
			throw error;
		}
	}
	
	//I forgot how this works...
	function next(){
		if(readNext===1){
			var items=nextToken();
			type=items.type;
			word=items.word;
		}else if(readNext===-1){
			type=newType;
			word=newWord;
			readNext=1;
		//I don't think this ever happens?
		}else if(readNext===-2)
			readNext=-1;
		else
			readNext=1;
	}
	
	if(currentBlocks.length!==1)
		return "unclosed thing";
	currentBlocks[1]=defs;
	return currentBlocks;
}

//TOKENIZER STREAM GENERATOR
//input: code (string)
//output: function that returns the next token when called
function tokenize(code){
	var i=-1,c,isAlpha,isDigit,whitespace;
	
	function next(){
		i++;
		c=code.charAt(i);
		//woah woah calm down don't worry I'm not some idiot who uses apostrophe strings...
		//These are single CHARACTERS (that is, in a language that has a char type, these should be chars and not strings)
		isAlpha=(c>='A'&&c<='Z'||c>='a'&&c<='z');
		isDigit=(c>='0'&&c<='9');
	}
	
	function jump(pos){
		i=pos-1;
		next();
	}
	
	var prev=0;
	function pushWord(){
		var start=prev;
		prev=i;
		var upper=code.substring(whitespace,i).toUpperCase();
		var type;
		//bitwise not
		if(upper==="NOT")
			type="unary";
		//word operators
		else if(upper==="DIV"||upper==="MOD"||upper==="AND"||upper==="OR"||upper==="XOR")
			type="operator";
		//true/false
		else if(upper==="TRUE"||upper==="FALSE")
			type="number";
		//other keyword
		else if(KEYWORDS.indexOf(upper)!==-1)
			type=upper;
		//not a keyword
		else
			type="word";
		return {type:type,word:upper};
	}
	
	
	function push(type){
		var start=prev;
		prev=i;
		return {type:type,word:code.substring(whitespace,i)};
	}
	
	next();
	return function(){
		//read whitespace
		while(c===" "||c==="\t")
			next();
		//if this is the end, push a special ending token
		if(c==='')
			return push("eof");
		//store the start of the non-whitespace
		whitespace=i;
		//"word" (keywords, functions, variables)
		if(isAlpha||c==='_'){
			next();
			while(isAlpha||isDigit||c==='_')
				next();
			if(c==='#'||c==='%'||c==='$')
				next();
			return pushWord();
		//numbers
		}else if(isDigit||c==='.'){
			while(isDigit)
				next();
			if(c==='.'){
				next();
				if(isDigit){
					next();
					while(isDigit)
						next();
				}else{
					if(c==='#')
						next();
					return push("number");
				}
			}
			if(c==='E'||c==='e'){
				var ePos=i;
				next();
				if(c==='+'||c==='-')
					next();
				if(isDigit){
					next();
					while(isDigit)
						next();
				}else{
					jump(ePos);
					return push("error");
				}
			}
			if(c==='#')
				next();
			return push("number");
		}else switch(c){
		//strings
		case '"':
			next();
			while(c && c!=='"' && c!=='\n' && c!=='\r')
				next();
			if(c==='"')
				next();
			return push("string");
		//comments
		break;case '\'':
			next();
			while(c && c!=='\n' && c!=='\r')
				next();
			return push("comment");
		//logical AND, hexadecimal, binary
		break;case '&':
			next();
			switch(c){
				case '&':
					next();
					return push("operator");
				break;case 'H':case 'h':
					var hPos=i;
					next();
					if(isDigit||c>='A'&&c<='F'||c>='a'&&c<='f'){
						next();
						while(isDigit||c>='A'&&c<='F'||c>='a'&&c<='f')
							next();
						return push("number");
					}
					jump(hPos);
					return push("error");
				break;case 'B':case 'b':
					var bPos=i;
					next();
					if(c==='0'||c==='1'){
						next();
						while(c==='0'||c==='1')
							next();
						return push("number");
					}
					jump(bPos);
					return push("error");
				break;default:
					return push("error");
			}
		//labels
		break;case '@':
			next();
			if(isDigit||isAlpha||c==="_"){
				next();
				while(isDigit||isAlpha||c==="_")
					next();
				return push("label");
			}
			return push("error");
		//constants
		break;case '#':
			next();
			if(isDigit||isAlpha){
				next();
				while(isDigit||isAlpha)
					next();
				return push("number");
			}
			return push("error");
		//logical or
		break;case '|':
			next();
			if(c==='|'){
				next();
				return push("operator");
			}
			return push("error");
		//less than, less than or equal, left shift
		break;case '<':
			next();
			if(c==='='||c==='<')
				next();
			return push("operator");
		//greater than, greater than or equal, right shift
		break;case '>':
			next();
			if(c==='='||c==='>')
				next();
			return push("operator");
		//equal, equal more
		break;case '=':
			next();
			if(c==='='){
				next();
				return push("operator");
			}
			return push("=");
		//logical not, not equal
		break;case '!':
			next();
			if(c==='='){
				next();
				return push("operator");
			}
			return push("unary");
		break;case '-':
			next();
			return push("minus");
		//add, subtract, multiply, divide
		break;case '+':case '*':case '/':
			next();
			return push("operator");
		//other
		break;case '\n':case '\r':
			next();
			return push("linebreak");
		//characters
		break;case '(':case ')':case '[':case ']':case ',':case ';':case ':':
			var chr=c;
			next();
			return push(chr);
		//print shortcut
		break;case '?':
			next();
			return push("PRINT");
		//other
		break;default:
			next();
			return push("text");
		}
	};
}