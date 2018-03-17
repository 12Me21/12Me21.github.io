//redefine NEXT function to pop from buffer, temporarily???

//list of keywords
//does not include OPERATORS (div xor etc.)
var keywords=["BREAK","CALL","COMMON","CONTINUE","DATA","DEC","DEF","DIM","ELSE","ELSEIF","END","ENDIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","REM","REPEAT","RESTORE","RETURN","STOP","SWAP","THEN","UNTIL","USE","VAR","WEND","WHILE"];

function parse(nextToken,callback){
	var type,text;
	var newType,newText;
	var readNext=1;
	var isDef=false;
	var buffer=0;
	while(1){
		try{
			next();
			//alert();
			switch(type){
				case "BREAK":case "CONTINUE":case "ELSE":case "ENDIF":case "STOP":case "REPEAT":case "WEND":
					output("keyword");
				break;case "CALL":
					output("keyword");
					readList(readExpression);
					if(readToken("OUT","keyword"))
						readList(readExpression);
				//COMMON
				break;case "COMMON":
					output("keyword");
					//assert(peekToken("DEF"),"COMMON without DEF");
				//DATA, DEC, INC, READ, SWAP
				break;case "DATA":case "DEC":case "INC":case "READ":case "SWAP":
					output("keyword");
					readList(readExpression);
				//DEF
				break;case "DEF":
					output("keyword");
					isDef=1;
					assert(readToken("word","function"),"Missing DEF name");
					if(readToken("lparen","separator")){
						readList(readArgument);
						assert(readToken("rparen","separator"),"Missing \")\" after DEF arguments"
						);
					}else{
						readList(readArgument);
						if(readToken("OUT","keyword"))
							readList(readArgument);
					}
				//DIM, VAR
				break;case "DIM":case "VAR":
					output("keyword");
					readList(readDeclaration);
				//IF, ELSEIF
				break;case "ELSEIF":case "IF":
					output("keyword");
					assert(readExpression(),"Missing IF condition");
					assert(readToken("THEN","keyword")||readToken("GOTO","keyword"),"IF without THEN");
				//END
				break;case "END":
					output("keyword");
					if(isDef)
						isDef=false;
				//EXEC/USE
				break;case "EXEC":case "USE":
					output("keyword");
					readExpression();
				//FOR
				break;case "FOR":
					output("keyword");
					assert(readExpression(),"Missing FOR variable");
					assert(readToken("equals","separator"),"Missing = in FOR");
					readExpression();
					assert(readToken("word") && text.toUpperCase().trimLeft()==="TO","Missing TO in FOR");
					output("keyword");
					readExpression();
					if(readToken("word") && text.toUpperCase().trimLeft()==="STEP"){
						output("keyword");
						readExpression();
					}
				//GOSUB GOTO RESTORE UNTIL WHILE
				break;case "GOSUB":case "GOTO":case "RESTORE":case "UNTIL":case "WHILE":
					output("keyword");
					assert(readExpression(),"Missing argument to keyword");
				//INPUT
				break;case "INPUT":
					output("keyword");
					readPrintList(readExpression);
				//LINPUT
				break;case "LINPUT":
					output("keyword");
					readPrintList(readExpression);
				//NEXT
				break;case "NEXT":
					output("keyword");
					readExpression();
				//ON
				break;case "ON":
					output("keyword");
					readExpression();
					assert(readToken("GOTO","keyword")||readToken("GOSUB","keyword"),"ON without GOTO/GOSUB");
					readList(readExpression);
				//PRINT
				break;case "PRINT":
					output("keyword");
					readPrintList(readExpression);
				//REM
				break;case "REM":
					output("keyword");
					do{
						next();
						output("comment");
					}while(type!=="linebreak" && type!=="eof")
				//RETURN
				break;case "RETURN":
					output("keyword");
					if(isDef)
						readExpression();
				//OUT/THEN
				break;case "OUT":case "THEN":
					output("error");
					assert(false,"fail");
				//other words
				break;case "word":
					var die=0;
					//check for variable access
					if(peekToken("lbracket")){
						die=1;
						output("variable");
						readToken("lbracket","separator");
						readExpression();
						assert(readToken("rbracket","separator"),"Missing \"]\"");
						while(readToken("lbracket","separator")){
							readExpression();
							assert(readToken("rbracket","separator"),"Missing \"]\"");
						}
					} //awful hack fix please!!!
					//check for =
					if(peekToken("equals")){
						if(!die)
							output("variable");
						readToken("equals","separator");
						readExpression();
					//function
					}else{
						if(die)
							assert(false,"Syntax error");
						output("function");
						readList(readExpression);
						if(readToken("OUT","keyword"))
							readList(readExpression);
					}
				//label
				break;case "label":
					output("label");
				//comment
				break;case "comment":
					output("comment");
				//end
				break;case "eof":
					return;
				//line break
				break;case "linebreak":
					output("separator");
				//colon
				break;case "colon":
					output("separator");
				//other
				break;default:
					output("error");
					assert(false,"Invalid statement");
			}
		}catch(error){
			if(error.name==="ParseError"){
				while(1){
					next();
					if(type==="linebreak"||type=="eof"){
						break;
					}
					output("error");
				}
				callback("errormessage",error.message)
				output("text");
			}else{
				alert("real actual error!!! "+error);
				return;
			}
		}
	}
	
	function peekToken(wantedType){
		var prevType=type,prevText=text;
		next();
		readNext=-1;
		newType=type;
		newText=text;
		type=prevType;
		text=prevText;
		return newType===wantedType;
	}
	
	function readToken(wantedType,outputType){ //add "output type" too!
		next();
		if(type===wantedType){
			readNext=1;
			if(outputType)
				output(outputType);
			return true;
		}
		readNext=0;
		return false;
	}
	
	function readList(reader){
		var ret=false;
		if(reader())
			ret=true;
		while(readToken("comma","separator")){
			reader();
			ret=true;
		}
		return ret;
	}
	
	function readPrintList(reader){
		var ret=false;
		if(reader())
			ret=true;
		while(readToken("comma","separator")||readToken("semicolon","separator")){
			reader();
			ret=true;
		}
		return ret;
	}
	
	function readExpression(){
		next();
		switch(type){
			//VAR
			case "VAR":
				//"function" form of VAR
				if(peekToken("lparen")){
					output("keyword");
					readToken("lparen","separator");
					readList(readExpression);
					assert(readToken("rparen","separator"),"Missing \")\" in VAR()");
				//normal VAR
				}else{
					output("keyword");
					readList(readDeclaration);
					return false;
				}
			//function or variable
			break;case "word":
				if(peekToken("lparen")){
					output("function");
					readToken("lparen","separator");
					readList(readExpression);
					assert(readToken("rparen","separator"),"Missing \")\" in function call");
				}else{
					output("variable");
				}
			//literal value
			break;case "number":case "string":case "label":
				output(type);
			//operator (unary)
			break;case "unary":case "minus":
				output("operator");
				assert(readExpression(),"Missing operator argument");
			//open parenthesis
			break;case "lparen":
				output("separator");
				readExpression();
				assert(readToken("rparen","separator"),"Missing \")\"");
			//other crap
			break;default:
				readNext=0;
				return false;
		}
		//read []s
		while(readToken("lbracket","separator")){
			readList(readExpression);
			assert(readToken("rbracket","separator"),"Missing \"]\"");
		}
		//read infix operators
		while(readToken("operator","operator")||readToken("minus","operator"))
			assert(readExpression(),"Operator missing second argument");
		return true;
	}
	
	function readArgument(){
		if(readToken("word","variable")){
			if(readToken("lbracket","separator"))
				assert(readToken("rbracket","separator"),"Missing \"]\"");
			return true;
		}
		return false;
	}
	
	function readDeclaration(){
		if(readToken("word","variable")){
			if(readToken("lbracket","separator")){
				readList(readExpression);
				assert(readToken("rbracket","separator"),"Missing \"]\"");
			}else if(readToken("equals","separator"))
				readExpression();
			return true;
		}
		return false;
	}
	
	function assert(value,message){
		if(!value){
			console.log(message);
			var error=new Error(message);
			error.name="ParseError";
			throw error;
		}
	}
	
	function output(type){
		callback(type,text);
		buffer--
	}
	
	function next(){
		if(readNext===1){
			var items=nextToken();
			buffer++;
			if(items){
				type=items.type;
				text=items.text;
			}else{
				type="eof";
				text="";
			}
		}else if(readNext===-1){
			type=newType;
			text=newText;
			readNext=1;
		}else if(readNext===-2){
			readNext=-1;
		}else{
			readNext=1;
		}
	}
	if(buffer!==0){
		console.warn("oh no we missed something?")
	}
}

//define a function that returns a function, which, when called, gives the next output value
//OR
//define a function that takes a function as input which is called and the next output passed to it

function tokenize(code){
	var i=-1,c,isAlpha,isDigit,whitespace;
	function next(){
		i++;
		c=code.charAt(i);
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
		var upper=code.substring(start+whitespace,i).toUpperCase();
		var type;
		if(upper=="NOT")
			type="unary";
		if(upper==="DIV"||upper==="MOD"||upper==="AND"||upper==="OR"||upper==="XOR")
			type="operator";
		else if(keywords.indexOf(upper)!==-1)
			type=upper;
		else
			type="word";
		return {type:type,text:code.substring(start,i)};
	}
	
	
	function push(type){
		var start=prev;
		prev=i;
		return {type:type,text:code.substring(start,i)};
	}
	
	next();
	return function(){
		whitespace=0;
		while(c===" "||c==="\t"){
			whitespace++;
			next();
		}
		if(c==='')
			return;
		//keywords, functions, variables
		if(isAlpha||c==='_'){
			next();
			while(isAlpha||isDigit||c==='_')
				next();
			if(c==='#'||c==='%'||c==='$'){
				next();
				return push("word");
			}else
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
					return push("text");
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
					return push("text");
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
					return push("text");
				break;default:
					return push("text");
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
			return push("text");
		//constants
		break;case '#':
			next();
			if(isDigit||isAlpha){
				next();
				while(isDigit||isAlpha)
					next();
				return push("number");
			}
			return push("text");
		//logical or
		break;case '|':
			next();
			if(c==='|'){
				next();
				return push("operator");
			}
			return push("text");
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
			return push("equals");
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
		break;case '(':
			next();
			return push("lparen");
		break;case ')':
			next();
			return push("rparen");
		break;case '[':
			next();
			return push("lbracket");
		break;case ']':
			next();
			return push("rbracket");
		break;case ',':
			next();
			return push("comma");
		break;case ';':
			next();
			return push("semicolon");
		break;case ':':
			next();
			return push("colon");
		break;case '?':
			next();
			return push("PRINT");
		break;default:
			next();
			return push("text");
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
	function callback(type,value){
		//only make a new span if the CSS class has changed
		if(type!==prevType){
			//close previous span
			if(prevType){
				html+="</span>";
			}
			//open new span
			if(type){
				html+="<span class=\""+type+"\">";
			}
		}
		html+=escapeHTML(value);
		prevType=type;
	}
	
	parse(tokenize(element.textContent),callback);
	//close last span
	if(prevType){
		html+="</span>";
	}
	element.innerHTML=html;
}

