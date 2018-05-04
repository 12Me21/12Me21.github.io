//=>==>==>==>==>==>==>=//
//12-BASIC interpreter!//
//=>==>==>==>==>==>==>=//
{
var defint=false;

var ip,block,ast,variables=[{TABSTEP:{value:4}}],functions={},ifs,switches;
var stopped=true,interval;
var inputs=[];

var steps=100,stepDelay=1

function run(astIn,fastMode){
	ast=astIn;
	ip=[-1];
	block=[ast[0]];
	ifs=[];
	switches=[];
	functions=ast[1];
	variables=[{}];
	stopped=false;
	inputs=$input.value.split(",");
	if(fastMode)
		while(!stopped)
			step();
	else
		interval=window.setInterval(function(){
			for(var i=0;i<steps;i++)
				step();
		},stepDelay);
}

function stop(error){
	if(!stopped || interval){
		stopped=true;
		if(interval){
			window.clearInterval(interval);
			interval=undefined;
		}
		print("====================\n");
		print(error?"ERROR: "+error:"OK")
		print("\n");
	}
}

function enterBlock(into){
	block.push(into||current(block).code[current(ip)]);
	ip[ip.length-1]=current(ip)+1;
	ip.push(-1);
	ifs.push(0);
	switches.push(undefined);
}

function leaveBlock(){
	block.pop();
	ip.pop();
	ifs.pop();
	switches.pop();
}

function current(stack){
	return stack[stack.length-1];
}

function callFunction(name,args){
	assert(builtins[name],"Undefined function: \""+name+"\"")
	assert(builtins[name][args.length],"\""+name+"\" does not accept "+args.length+" arguments");
	//if(builtins[name] && builtins[name][args.length]){
	return builtins[name][args.length].apply(null,args);
	/*}else{
		var x=functions[name][args.length];
		assert(x,"undefined function "+name);
		assert(false,"feature not supported");
	}
	return false;*/
}

function expr(n){
	assert(n.constructor===Array,"internal error: invalid expression");
	//console.log("expression",n);
	var stack=[];
	for(var i=0;i<n.length;i++){
		//console.log("stack",stack.toSource(),n[i])
		switch(n[i].type){
			case "variable":
				stack.push(getVar(n[i].name));
			break;case "number":
				stack.push(new Value("number",n[i].value));
			break;case "string":
				stack.push(new Value("string",n[i].value));
			break;case "operator":case "function":case "unary":
				var args=n[i].args;
				assert(args<=stack.length,"internal error: stack underflow");
				var retval;
				assert(retval=callFunction(n[i].name,stack.slice(-args)),"bad function/operator")
				for(var j=0;j<args;j++){
					stack.pop();
				}
				
				stack.push(retval);
			break;default:
				assert(false,"invalid expression: bad token "+n[i].type);
		}
	}
	//if(n.length!=1)
	//	throw "too complex expression :(";
	//
	assert(stack.length===1,"invalid expression: stack not empty")
	return stack[0];
}

function print(text){
	$console.value+=text;
	$console.scrollTop=$console.scrollTopMax
}

function jumpTo(pos){
	ip[ip.length-1]=pos;
}

function step(){
	//console.log(block,variables)
	jumpTo(current(ip)+1)
	//exiting block
	while(current(ip)>=current(block).code.length){
		var now=current(block);
		switch(now.type){
			case "WHILE":
				if(expr(now.condition).truthy())
					jumpTo(0);
				else
					leaveBlock();
			break;case "REPEAT":
				if(!expr(now.condition).truthy())
					jumpTo(0);
				else
					leaveBlock();
			break;case "FOR":
				var variable=getVar(now.variable.name);
				if(now.step!==undefined){
					var value=expr(now.step);
					value.expect("number");
					variable.value+=value.value;
				}else{
					variable.value++;
				}
				var value=expr(now.end);
				value.expect("number");
				if(variable.value<=value.value){ //only works for loops that count upwards!
					jumpTo(0);
				}else{
					leaveBlock();
				}
			break;case "main":
				stop();
				return;
			break;case "IF":case "ELSE":case "ELSEIF":case "CASE":case "SWITCH":
				leaveBlock();
			break;default:
				throw "bad block"+now.type
		}
	}
	var now=current(block).code[current(ip)];
	//entering block
	switch(now.type){
		case "WHILE":
			if(expr(now.condition).truthy());
				enterBlock();
		break;case "REPEAT":
			enterBlock();
		break;case "PRINT":
			var printString="";
			for(var i=0;i<now.inputs.length;i++){
				printString+=(i>0?" ":"")+expr(now.inputs[i]).toString();
			}
			print(printString+"\n");
		break;case "FOR":
			var value=expr(now.start);
			value.expect("number");
			assignVar(now.variable.name,value);
			value=expr(now.end);
			value.expect("number");
			if(getVar(now.variable.name).value<=value.value);
				enterBlock();
		break;case "EXIT":
			var levels=now.levels
			if(levels){
				levels=expr(now.levels);
				levels.expect("number");
				levels=levels.value;
				assert(levels>=1,"domain error");
			}else
				levels=1;
			while(1){
				var x=current(block);
				if(x.type==="main"){
					break;
				}else{
					levels--;
					if(!levels){
						leaveBlock();
						break;
					}
				}
				leaveBlock();
			}
		break;case "BREAK": //M U L T I - L E V E L   B R E A K !
			var levels=now.levels
			if(levels){
				levels=expr(now.levels);
				levels.expect("number");
				levels=levels.value;
				assert(levels>=1,"domain error");
			}else
				levels=1;
			while(1){
				var x=current(block);
				if(x.type==="main"){
					break
				}else if(x.type==="FOR"||x.type==="WHILE"||x.type==="REPEAT"){
					levels--
					if(!levels){
						leaveBlock();
						break
					}
				}
				leaveBlock();
			}
		break;case "CONTINUE":
			while(1){
				var x=current(block);
				if(x.type==="main"){
					break
				}else if(x.type==="FOR"||x.type==="WHILE"||x.type==="REPEAT"){
					jumpTo(Infinity);
					break;
				}
				leaveBlock();
			}
		break;case "STOP":
			stop();
			return;
		break;case "function":
			assert(false,"Tried to call function \""+now.name+"\". Subroutine-type functions are not supported yet");
		break;case "INPUT":
			for(var i=0;i<now.inputs.length;i++){
				var x=getNextInputValue();
				assert(x,"Out of input");
				if(typeFromName(now.inputs[i].name)==="number")
					x=new Value("number",parseFloat("0"+x.value))
				assignVar(now.inputs[i].name,x);
			}
		break;case "assignment":
			assignVar(now.variable.name,expr(now.value));
		break;case "IF":
			if(expr(now.condition).truthy()){
				ifs[ifs.length-1]=true;
				enterBlock();
			}else
				ifs[ifs.length-1]=false;
		break;case "ELSE":
			if(!ifs[ifs.length-1])
				enterBlock();
		break;case "ELSEIF":
			if(!ifs[ifs.length-1]){
				if(expr(now.condition).truthy()){
					ifs[ifs.length-1]=true;
					enterBlock();
				}
			}
		break;case "SWITCH":
			var condition=expr(now.condition);
			enterBlock();
			switches[switches.length-1]=condition;
		break;case "CASE":
			if(now.condition){
				var condition=expr(now.condition);
				if(equal(switches[switches.length-1],condition).truthy())
					enterBlock();
			}else
				enterBlock();
		break;default:
			assert(false,"unsupported instruction "+now.type);
	}
	//window.requestAnimationFrame(step);
}

/*function pushFuncScope(func){
	variables.push({...})
	if(x.outputs){
		for(var i=0;i<x.outputs.length;i++){
			createVar(x.outputs[i],new Value("undefined"));
		}
	}
	for(var i=0;i<x.inputs.length;i++){
		createVar(x.inputs[i],expr(now.inputs[i]));
	}
}*/

function getNextInputValue(){
	var x=inputs.shift();
	if(x!==undefined)
		return new Value("string",x);
}

//get variable from name
function getVar(name){
	var i=variables.length-1;
	var ret;
	while(!ret&&i>=0){
		ret=variables[i][name];
		i--;
	}
	if(!ret)
		ret=assignVar(name)
	return ret;
}

//assign or create variable
function assignVar(name,value){
	var currentVariables=current(variables);
	if(!value)
		value=new Value(typeFromName(name));
	switch(currentVariables[name] ? currentVariables[name].type : typeFromName(name)){
		case "string":
			assert(value.type==="string","type mismatch");
			currentVariables[name]=value;
		break;case "number":
			assert(value.type==="number","type mismatch");
			currentVariables[name]=value;
		break;case "default":
			assert(false,"could not create variable, invalid tyoe");
	}
	return currentVariables[name]
}

function typeFromName(name){
	if(name.substr(-1)==="$")
		return "string";
	else
		return "number";
}

function setVar(name,value){
	return current(variables)[name]=value;
}

//vDefaultFromT
function defaultValue(type){
	if(type==="number")
		return 0;
	else if(type==="string")
		return "";
	else
		assert(false,"invalid type: "+type);
}

function assert(condition,message){
	if(!condition){
		console.log(current(block).code[current(ip)])
		message=" On line "+current(block).code[current(ip)].line+"\n"+message;
		//message+=" on line "+current(block).code[current(ip)].line;
		stop(message);
		console.log(message);
		var error=new Error(message);
		error.name="RunError";
		throw error;
	}
}
}