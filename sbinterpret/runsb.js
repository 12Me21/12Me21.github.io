var defint=false;

var ip,block,ast,variables=[{TABSTEP:{value:4}}],functions={},builtins={"*":multiply,">":greaterThan,"-":subtract,"!":logicalNot,"+":add,CLS:function(){$console.value=""}}

function enterBlock(into){
	block.push(into||current(block).code[current(ip)]);
	ip[ip.length-1]=current(ip)+1;
	ip.push(-1);
}

function leaveBlock(){
	block.pop();
	ip.pop();
}

function current(stack){
	return stack[stack.length-1];
}

function callFunction(name,args){
	if(builtins[name]){
		return builtins[name](...args);
	}else{
		var x=functions[name];
		assert(x,"undefined function "+name);
		assert(false,"feature not supported");
	}
	return false;
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
			break;case "integer":case "float":
				stack.push(new Value(n[i].type,Number(n[i].value)));
			break;case "string":
				stack.push(new Value(n[i].type,n[i].value));
			break;case "operator":case "function":case "unary":
				var args=n[i].args;
				assert(args<=stack.length,"internal error: stack underflow");
				//me array.length = array.push() hehe
				var retval;
				assert(retval=callFunction(n[i].name,stack.slice(-args)),"bad function/operator")
				for(var j=0;j<args;j++){
					stack.pop();
				}
				
				stack.push(retval); //optimize by reduce pop amount etc.
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
}

function run(astIn){
	ast=astIn;
	ip=[-1];
	block=[ast[0]];
	functions=ast[1];
	variables=[{}];
	window.requestAnimationFrame(step);
}

function jumpTo(pos){
	ip[ip.length-1]=pos;
}

function step(){
	//console.log(block,variables)
	jumpTo(current(ip)+1)
	while(current(ip)>=current(block).code.length){
		var now=current(block);
		switch(now.type){
			case "WHILE":
				if(expr(now.condition).value!==0)
					jumpTo(0);
				else
					leaveBlock();
			break;case "FOR":
				var variable=getVar(now.variable.name);
				if(now.step!==undefined){
					var value=expr(now.step);
					assert(value.isNumber(),"type mismatch");
					variable.value+=value.value;
				}else{
					variable.value++;
				}
				var value=expr(now.end);
				assert(value.isNumber(),"type mismatch");
				if(variable.value<=value.value){ //only works for loops that count upwards!
					jumpTo(0);
				}else{
					leaveBlock();
				}
			break;case "main":
				print("OK\n");
				return;
			break;case "DEF":
				variables.pop(); //rest in peace
				leaveBlock();
			break;default:
				throw "bad block"+now.type
		}
	}
	var now=current(block).code[current(ip)];
	switch(now.type){
		case "WHILE":
			if(expr(now.condition).value!==0);
				enterBlock();
		break;case "GOTO":
			var cbc=current(block).code;
			var label=now.label;
			if(label.constructor!==String){
				label=expr(label);
				//console.log(label)
				assert(label.type==="string","type mismatch: in goto");
				label=label.value;
			}
			for(var i=0;i<cbc.length;i++){
				if(cbc[i].type==="label"&&cbc[i].label===label){
					cbc=false;
					jumpTo(i);
					break;
				}
			}
			assert(!cbc,"could not find label"+now.label);
		break;case "label":
			
		break;case "INC":
			var variable=getVar(now.variable.name);
			if(variable.isNumber()){
				if(now.value!==undefined){
					var value=expr(now.value);
					assert(value.isNumber(),"type Mismatch");
					variable.value+=value;
				}else{
					variable.value++;
				}
			}else if(variable.type==="string"){
				assert(now.value!==undefined,"missing parameter");
				var value=expr(now.value);
				assert(value.type==="string","type mismatch");
				variable.value+=value;
			}
		break;case "DEC":
			var variable=getVar(now.variable.name);
			assert(variable.isNumber(),"type mismatch");
			if(now.value){
				var value=expr(now.value);
				assert(value.isNumber(),"type Mismatch");
				variable.value-=value;
			}else
				variable.value--;
		break;case "DIM":
				console.log(now.inputs);
		break;case "PRINT":
			for(var i=0;i<now.inputs.length;i++){
				var n=now.inputs[i];
				var next=now.inputs[i+1];
				n=expr(n).value.toString();
				if(next===","){
					n=n+" ".repeat(Math.floor(n.length/getVar("TABSTEP").value)*getVar("TABSTEP").value-n.length);
					print(n);
					i++;
				}else if(next===";"){
					print(n);
					i++;
				}else{
					print(n+"\n");
				}
			}
		break;case "FOR":
			var value=expr(now.start);
			assert(value.isNumber(),"type mismatch");
			makeVar(now.variable.name,value);
			var value=expr(now.end);
			assert(value.isNumber(),"type mismatch");
			if(getVar(now.variable.name).value<=value.value);
				enterBlock();
		break;case "function":
			if(builtins[now.name]){
				builtins[now.name](...now.inputs.map(function(x){return expr(x)}))
			}else{
				var x=functions[now.name];
				if(x){
					enterBlock(x);
					variables.push({});
					if(x.outputs){
						for(var i=0;i<x.outputs.length;i++){
							makeVar(x.outputs[i]);
						}
					}
					for(var i=0;i<x.inputs.length;i++){
						makeVar(x.inputs[i],expr(now.inputs[i]));
					}
				}else
					throw "undefined function";
			}
		break;case "END":case "STOP":
			print("OK\n");
			return;
		break;case "assignment":
			makeVar(now.variable.name,expr(now.value));
		break;default:
			throw "unsupported instruction"+now.type;
	}
	
	window.requestAnimationFrame(step);
}

function getVar(name,type){
	var i=variables.length-1;
	var ret;
	while(!ret&&i>=0){
		ret=variables[i][name];
		i--;
	}
	if(!ret)
		ret=makeVar(name,type)
	return ret;
}

function makeVar(name,type,value,arrayDims){
	var old=current(variables)[name];
	if(old){
		//assert(old.type===type || (old.isNumber() && (type==="integer" || type==="float")) || old.type==="?","Type mismatch");
		
	}if(type && type.constructor===Value) //ok which idiot put these on the same line...
		return setVar(name,type)
	else if(type)
		return setVar(name,new Value(type,value,arrayDims));
	else
		return setVar(name,new Value(typeFromName(name)))
}


function typeFromName(name){
	switch(name.substr(-1)){
		case "#":
			return "float";
		break;case "%":
			return "integer";
		break;case "$":
			return "string";
		break;default:
			if(defint)
				return "integer"
			else
				return "float"
	}
}

function setVar(name,value){
	return current(variables)[name]=value;
}

//vDefaultFromT
function defaultValue(type){
	if(type==="integer"||type==="float")
		return 0;
	else if(type==="string")
		return "";
	else if(type==="?")
		return undefined;
	else
		assert(false,"invalid type: "+type);
}

function assert(condition,message){
	if(!condition){
		console.log(message);
		var error=new Error(message);
		error.name="RunError";
		throw error;
	}
}