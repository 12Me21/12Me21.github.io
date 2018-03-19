//redefine NEXT function to pop from buffer, temporarily???

//list of keywords
//does not include OPERATORS (div xor etc.)
var keywords=["BREAK","CALL","COMMON","CONTINUE","DATA","DEC","DEF","DIM","ELSE","ELSEIF","END","ENDIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","REM","REPEAT","RESTORE","RETURN","STOP","SWAP","THEN","UNTIL","USE","VAR","WEND","WHILE"];

function parse(nextToken,callback){
	var type,text;
	var newType,newText;
	var oldType,oldText;
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
						readList(readVariable);
				//COMMON
				break;case "COMMON":
					output("keyword");
					assert(peekToken("DEF"),"COMMON without DEF");
				//DATA, DEC, INC, READ, SWAP
				break;case "DATA":case "READ":case "SWAP":
					output("keyword");
					assert(readList(readExpression,true),"Missing list");
				break;case "DEC":case "INC":
					output("keyword");
					assert(readVariable(),"Missing INC/DEC variable");
					if(readToken(",","separator"))
						assert(readExpression(),"Missing INC/DEC amount");
				//DEF
				break;case "DEF":
					output("keyword");
					isDef=1;
					//read function name
					assert(readToken("word","function"),"Missing DEF name");
					//() form
					if(readToken("(","separator")){
						//read argument list
						readList(readArgument,true);
						//read )
						assert(readToken(")","separator"),"Missing \")\" after DEF arguments"
						);
					//subroutine/out form
					}else{
						//read argument list
						readList(readArgument,true);
						//OUT
						if(readToken("OUT","keyword"))
							//read output list
							readList(readArgument,true);
					}
				//VAR
				break;case "VAR":
					output("keyword");
					//assignment form
					if(readToken("(","separator")){
						assert(readExpression(),"Missing var name");
						assert(readToken(")","separator"),"missing )")
						while(readToken("[","separator")){
							assert(readList(readExpression,true),"Missing array index");
							assert(readToken("]","separator"),"Missing \"]\"");
						}
						assert(readToken("=","separator"),"missing =")
						readExpression();
					//normal form
					}else
						assert(readList(readDeclaration,true),"Missing variable list");
				//DIM
				break;case "DIM":
					output("keyword");
					assert(readList(readDeclaration,true),"Missing variable list");
				//IF, ELSEIF
				break;case "ELSEIF":case "IF":
					output("keyword");
					assert(readExpression(),"Missing IF condition");
					assert(readToken("THEN","keyword")||readToken("GOTO","keyword"),"IF without THEN");
					readToken("label","label");//optional
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
					assert(readVariable(),"Missing FOR variable");
					assert(readToken("=","separator"),"Missing = in FOR");
					readExpression();
					assert(readToken("word") && text.toUpperCase().trimLeft()==="TO","Missing TO in FOR");
					output("keyword");
					readExpression();
					if(readToken("word") && text.toUpperCase().trimLeft()==="STEP"){
						output("keyword");
						readExpression();
					}else
						readNext=0;
				//GOSUB GOTO RESTORE(?)
				break;case "GOSUB":case "GOTO":case "RESTORE":
					output("keyword");
					if(!readToken("label","label"))
						assert(readExpression(),"Missing argument to keyword");
				break;case "UNTIL":case "WHILE": //UNTIL WHILE
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
					assert(readList(readExpression,true),"Missing label list after ON");
				//PRINT
				break;case "PRINT":
					output("keyword");
					readPrintList(readExpression,true);
				//REM
				break;case "REM":
					output("keyword");
					do{
						next();
						output("comment");
					}while(type!=="linebreak" && type!=="eof");;;
				//RETURN
				break;case "RETURN":
					output("keyword");
					if(isDef)
						readExpression();
				//OUT/THEN
				break;case "OUT":case "THEN":
					output("error");
					assert(false,"Illegal OUT/THEN");
				//other words
				break;case "word":case "(":
					//var name=text;
					readNext=readNext-1;
					switch(readVariable(true)){
						case true:
							assert(readToken("=","equals"),"missing =");
							readExpression();
						break;case false:
							alert("what");
						break;default:
							if(peekToken("=")){
								output("variable");
								readToken("=","equals");
								readExpression();
							}else{
								output("function");
								readList(readExpression);
								if(readToken("OUT","keyword"))
									readList(readVariable);		
							}
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
				//line break, colon
				break;case "linebreak":case ":":
					output("separator");
				//other
				break;default:
					output("error");
					assert(false,"Expected statement, got "+type);
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
				callback("errormessage",error.message);
				output("text"); //line break
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
	
	function readList(reader,noNull){
		var ret=reader();
		if(readToken(",","separator")){
			assert(ret||!noNull,"Null value not allowed");
			ret=1;
			do{
				assert(reader()||!noNull,"Null value not allowed");
			}while(readToken(",","separator"));;;
		}
		return ret;
	}
	
	function readPrintList(reader){
		var ret=false;
		if(!reader())
			return;
		while((readToken(",","separator")||readToken(";","separator"))&&reader());
	}
	
	function readExpression(){
		next();
		switch(type){
			//VAR
			case "VAR":
				//"function" form of VAR
				if(peekToken("(")){
					output("keyword");
					readToken("(","separator");
					assert(readExpression(),"Missing VAR argument");
					assert(readToken(")","separator"),"Missing \")\" in VAR()");
				//normal VAR
				}else{
					output("keyword");
					assert(readList(readDeclaration,true),"Missing VAR list");
					return false;
				}
			//function or variable
			break;case "word":
				if(peekToken("(")){
					output("function");
					readToken("(","separator");
					readList(readExpression);
					assert(readToken(")","separator"),"Missing \")\" in function call");
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
			break;case "(":
				output("separator");
				readExpression();
				assert(readToken(")","separator"),"Missing \")\"");
			//other crap
			break;default:
				readNext=0;
				return false;
		}
		//read []s
		while(readToken("[","separator")){
			assert(readList(readExpression,true),"Missing array index");
			assert(readToken("]","separator"),"Missing \"]\"");
		}
		//read infix operators
		while(readToken("operator","operator")||readToken("minus","operator"))
			assert(readExpression(),"Operator missing second argument");
		return true;
	}
	
	function readArgument(){
		if(readToken("word","variable")){
			if(readToken("[","separator"))
				assert(readToken("]","separator"),"Missing \"]\"");
			return true;
		}
		return false;
	}
	
	function readDeclaration(){
		if(readToken("word","variable")){
			if(readToken("[","separator")){
				assert(readList(readExpression,true),"Missing array size");
				assert(readToken("]","separator"),"Missing \"]\"");
			}else if(readToken("=","separator"))
				readExpression();
			return true;
		}
		return false;
	}
	
	//return values:
	// false - bad
	// true - definitely a variable
	// string - single word (could be function call or variable)
	// if true is passed to function, variable name will not be outputted when it might be a function call (for use in handling =)
	function readVariable(noPrintVarName){
		var ret=false;
		next();
		switch(type){
			case "var":
				output("keyword");
				//"function" form of VAR
				if(readToken("(","separator")){
					assert(readExpression(),"Missing VAR argument");
					assert(readToken(")","separator"),"Missing \")\" in VAR()");
					ret=true;
				//normal VAR
				}else{
					assert(false,"invalid VAR");
				}
			break;case "word":
				if(!noPrintVarName){
					output("variable");
					ret=true;
				}else
					ret=text;
			break;case "(":
				output("separator");
				assert(readVariable(),"missing variable");
				assert(readToken(")","separator"),"missing )");
				ret=true;
			break;default:
				readNext=0;
				return false;
		}
		if(peekToken("[")){
			if(ret!==true && ret!==false)
				output("variable");
			while(readToken("[","separator")){
				assert(readList(readExpression,true),"Missing array index");
				assert(readToken("]","separator"),"Missing \"]\"");
			}
			ret=true;
		}
		return ret;
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
		buffer--;
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
	code+="\n";
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
		if(upper==="NOT")
			type="unary";
		else if(upper==="DIV"||upper==="MOD"||upper==="AND"||upper==="OR"||upper==="XOR")
			type="operator";
		else if(upper==="TRUE"||upper==="FALSE")
			type="number";
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
	}
}

//escape < and &
function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;");
}

function escapeHTMLAttribute(text){
	return text.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
}

function applySyntaxHighlighting(element){
	var html="",prevType=false;
	//this is called for each highlightable token
	function callback(type,value){
		//only make a new span if the CSS class has changed
		if(type!==prevType){
			//close previous span
			if(prevType)
				html+="</span>";
			//open new span
			if(type)
				html+="<span class=\""+type+"\">";
		}
		html+=escapeHTML(value);
		prevType=type;
	}
	parse(tokenize(element.textContent),callback);
	//close last span
	if(prevType)
		html+="</span>";
	element.innerHTML=html;
}
//.write?
