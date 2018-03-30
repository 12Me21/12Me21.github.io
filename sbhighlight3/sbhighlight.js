//list of keywords
//does not include OPERATORS or CONSTANTS or fake keywords TO/STEP
var KEYWORDS=["BREAK","CALL","COMMON","CONTINUE","DATA","DEC","DEF","DIM","ELSE","ELSEIF","END","ENDIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","REM","REPEAT","RESTORE","RETURN","STOP","SWAP","THEN","UNTIL","USE","VAR","WEND","WHILE"];

//parser
//nextToken: function that returns the next token
//callback: output function
function parse(nextToken,callback){
	//current token
	var type,text,word; //NOTE: word is only update right after next()ing. don't rely on it laaaaater
	//stored tokens
	var newType,newText;
	var oldType,oldText;
	//keep track of stored tokens
	var readNext=1;
	//inside def
	var inDef=false;
	
	while(1){ // <3
		try{
			//read a "line" of code
			next();
			switch(type){
				//keywords with no arguments
				case "BREAK":case "CONTINUE":case "ELSE":case "ENDIF":case "STOP":case "REPEAT":case "WEND":
					output("keyword");
				//CALL
				break;case "CALL":
					output("keyword");
					//CALL SPRITE and CALL BG
					if(peekWord("SPRITE")||peekWord("BG")){
						readToken("word","keyword");
					//regular CALL
					}else{
						readList(readExpression);
						if(readToken("OUT","keyword"))
							readList(readVariable);
					}
				//COMMON
				break;case "COMMON":
					output("keyword");
					assert(peekToken("DEF"),"COMMON without DEF");
				//DATA
				break;case "DATA":
					output("keyword");
					assert(readList(readExpression,true),"Missing list"); //should read constant expression
				//SWAP
				break;case "SWAP":
					output("keyword");
					assert(readVariable(),"Missing variable in SWAP");
					assert(readToken(","),"Missing comma in SWAP");
					assert(readVariable(),"Missing variable in SWAP");
				//READ
				break;case "READ":
					output("keyword");
					assert(readList(readVariable,true),"Missing list");
				//DEC/INC
				break;case "DEC":case "INC":
					output("keyword");
					assert(readVariable(),"Missing INC/DEC variable");
					if(readToken(",",""))
						assert(readExpression(),"Missing INC/DEC amount");
				//DEF
				break;case "DEF":
					output("keyword");
					assert(!inDef,"Nested DEF");
					inDef=true;
					//read function name
					assert(readToken("word","function"),"Missing DEF name");
					//() form
					if(readToken("(","")){
						//read argument list
						readList(readArgument,true);
						//read )
						assert(readToken(")",""),"Missing \")\" after DEF arguments"
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
					//assignment form
					if(peekToken("(")){
						output("keyword var");
						readToken("(","");
						assert(readExpression(),"Missing var name");
						assert(readToken(")",""),"missing )")
						while(readToken("[","")){
							assert(readList(readExpression,true),"Missing array index");
							assert(readToken("]",""),"Missing \"]\"");
						}
						assert(readToken("=",""),"missing =");
						readExpression();
					//normal form
					}else{
						output("keyword");
						assert(readList(readDeclaration,true),"Missing variable list");
					}
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
					if(inDef)
						inDef=false;
				//EXEC/USE
				break;case "EXEC":case "USE":
					output("keyword");
					readExpression();
				//FOR
				break;case "FOR":
					output("keyword");
					assert(readVariable(),"Missing FOR variable");
					assert(readToken("=",""),"Missing = in FOR");
					readExpression();
					assert(readToken("word") && word==="TO","Missing TO in FOR");
					output("keyword");
					readExpression();
					if(readToken("word") && word==="STEP"){
						output("keyword");
						readExpression();
					}else
						readNext=0; //heck
				//GOSUB GOTO RESTORE(?)
				break;case "GOSUB":case "GOTO":case "RESTORE":
					output("keyword");
					if(!readToken("label","label"))
						assert(readExpression(),"Missing argument to keyword");
				//WHILE, UNTIL
				break;case "UNTIL":case "WHILE": 
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
					readPrintList(readExpression);
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
					if(inDef)
						readExpression();
				//OUT/THEN
				break;case "OUT":case "THEN":
					output("error");
					assert(false,"Illegal OUT/THEN");
				//other words
				break;case "word":case "(":
					//var name=text;
					readNext=readNext-1;
					var oldWord=word; //this is, the variable name! :D
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
								//HORRIBLE STUPID FAKE KEYWORDS!!!
								//XON/XOFF/OPTION
								// I hate you! :(
								// not nice >:[
								switch(oldWord){
									case "XON":
										output("keyword");
										if(readToken("word")){
											assert(word==="MOTION"||word==="EXPAD"||word==="MIC"||word==="WIIU"||word=="COMPAT","invalid option")
										}else{
											//what the [heck] were you THINKING!?!??!
											assert(readToken("number","keyword"),"invalid option");
											assert(word==="3","invalid option");
											assert(readToken("word","keyword"),"invalid option");
											assert(word==="DS","invalid option");
										}
									break;case "XOFF":
										output("keyword");
										assert(readToken("word"));
										assert(word==="MOTION"||word==="EXPAD"||word==="MIC"||word=="COMPAT","invalid option")
									break;case "OPTION":
										output("keyword");
										assert(readToken("word","keyword"),"invalid option");
										assert(word==="STRICT"||word==="DEFINT"||word==="TOOL","invalid option");
									//return to sanity, normal function call!
									break;default:
										output("function");
										readList(readExpression);
										if(readToken("OUT","keyword"))
											readList(readVariable); //------- (fence to stop people from falling off the indent cliff)
								}
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
					output("");
					return;
				//line break, colon
				break;case ":":
					output("");
				break;case "linebreak":
					output("linebreak");
				break;default:
					output("error");
					assert(false,"Expected statement, got "+type);
			}
		}catch(error){
			//normal parsing error
			if(error.name==="ParseError"){
				//read until the end of the line
				while(1){
					next();
					if(type==="linebreak"||type=="eof"){
						break;
					}
					output("error");
				}
				//show error message
				callback(error.message,"errormessage");
				output(""); //line break
			//bad error!!!
			}else{
				alert("real actual error!!! "+error);
				return;
			}
		}
	}
	
	//check if next token is of a specific type
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
	//check if next token is of a specific type
	function peekWord(wantedWord){
		var prevType=type,prevText=text;
		next();
		readNext=-1;
		newType=type;
		newText=text;
		type=prevType;
		text=prevText;
		return newType==="word" && newText.trimLeft().toUpperCase()===wantedWord;
	}
	
	//Try to read a specific token
	function readToken(wantedType,outputType){
		next();
		if(type===wantedType){
			readNext=1;
			if(outputType!==undefined)
				output(outputType);
			return true;
		}
		readNext=0;
		return false;
	}
	
	//Read list
	//reader: function to read item (readExpression etc.)
	//noNull: throw an error if a null value is found
	function readList(reader,noNull){
		var ret=reader();
		if(readToken(",","")){
			assert(ret||!noNull,"Null value not allowed");
			ret=1;
			do{
				assert(reader()||!noNull,"Null value not allowed");
			}while(readToken(",",""));;;
		}
		return ret;
	}
	
	//read list of PRINT arguments
	function readPrintList(reader){
		var ret=false;
		if(!reader())
			return;
		while((readToken(",","")||readToken(";",""))&&reader());
	}
	
	//read normal expression
	function readExpression(){
		next();
		switch(type){
			//VAR()
			case "VAR":
				readVar();
			//function or variable
			break;case "word":
				if(peekToken("(")){
					output("function");
					readToken("(","");
					readList(readExpression);
					assert(readToken(")",""),"Missing \")\" in function call");
				}else
					output("variable");
			//CALL()
			break;case "CALL":
				if(peekToken("(")){
					output("keyword var");
					readToken("(","");
					readList(readExpression);
					assert(readToken(")",""),"Missing \")\" in CALL()");
					ret=true;
				//bad VAR
				}else{
					output("error");
					assert(false,"invalid CALL");
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
				output("");
				readExpression();
				assert(readToken(")",""),"Missing \")\"");
			//other crap
			break;default:
				readNext=0;
				return false;
		}
		//read []s
		while(readToken("[","")){
			assert(readList(readExpression,true),"Missing array index");
			assert(readToken("]",""),"Missing \"]\"");
		}
		//read infix operators
		while(readToken("operator","operator")||readToken("minus","operator"))
			assert(readExpression(),"Operator missing second argument");
		return true;
	}
	
	//read function definition argument
	function readArgument(){
		if(readToken("word","variable")){
			if(readToken("[",""))
				assert(readToken("]",""),"Missing \"]\"");
			return true;
		}
		return false;
	}
	
	//read variable declaration
	function readDeclaration(){
		if(readToken("word","variable")){
			if(readToken("[","")){
				assert(readList(readExpression,true),"Missing array size");
				assert(readToken("]",""),"Missing \"]\"");
			}else if(readToken("=",""))
				readExpression();
			return true;
		}
		return false;
	}
	
	//read function VAR()
	function readVar(){
		//"function" form of VAR
		if(peekToken("(")){
			output("keyword var");
			readToken("(","");
			assert(readExpression(),"Missing VAR argument");
			assert(readToken(")",""),"Missing \")\" in VAR()");
			ret=true;
		//bad VAR
		}else{
			output("error");
			assert(false,"invalid VAR");
		}
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
			case "VAR":
				readVar();
			break;case "word":
				if(!noPrintVarName){
					output("variable");
					ret=true;
				}else
					ret=text;
			break;case "(":
				output("");
				assert(readVariable(),"missing variable");
				assert(readToken(")",""),"missing )");
				ret=true;
			break;default:
				readNext=0;
				return false;
		}
		if(peekToken("[")){
			if(ret!==true && ret!==false)
				output("variable");
			while(readToken("[","")){
				assert(readList(readExpression,true),"Missing array index");
				assert(readToken("]",""),"Missing \"]\"");
			}
			ret=true;
		}
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
	
	function output(type){
		callback(text,type);
	}
	
	//I forgot how this works...
	function next(){
		if(readNext===1){
			var items=nextToken();
			type=items.type;
			text=items.text;
			word=items.word; //careful!
		}else if(readNext===-1){
			type=newType;
			text=newText;
			readNext=1;
		//I don't think this ever happens?
		}else if(readNext===-2)
			readNext=-1;
		else
			readNext=1;
	}
}


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
		return {type:type,text:code.substring(start,i),word:upper};
	}
	
	
	function push(type){
		var start=prev;
		prev=i;
		return {type:type,text:code.substring(start,i)};
	}
	
	next();
	return function(){
		while(c===" "||c==="\t")
			next();
		if(c==='')
			return push("eof");
		whitespace=i;
		//keywords, functions, variables
		if(isAlpha||c==='_'){
			next();
			while(isAlpha||isDigit||c==='_')
				next();
			if(c==='#'||c==='%'||c==='$'){
				next();
				return push("word");
			}
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
	}
}

//"Example" usage: applying syntax highlighting to an html element.
//Uses the type for the css class name.
function applySyntaxHighlighting(element){
	var html="",prevType;
	//this is called for each highlightable token
	function callback(value,type){
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
	//set html
	element.innerHTML=html;
}

//escape & and <
function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;");//.replace(/[\r\n]/g,"<br>");
}
//escape &, ", and '
function escapeHTMLAttribute(text){
	return text.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}