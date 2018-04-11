var ip,block,ast,variables=[{TABSTEP:{value:4}}],functions={},builtins={CLS:function(){$console.value=""}}

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

function expr(n){
	if(n.length!=1){
		throw "too complex expression :(";
	}
	switch(n[0].type){
		case "variable":
			return getVar(n[0].name).value;
		break;case "literal":
			return eval(n[0].value);
		break;default:
			throw "idk value";
	}
	return n[0].value;
}

function print(text){
	$console.value+=text;
}

function run(astIn){
	ast=astIn;
	ip=[-1];
	block=[ast[0]];
	functions=ast[1];
	window.requestAnimationFrame(step);
}

function step(){
	console.log(block)
	ip[ip.length-1]=current(ip)+1
	while(current(ip)>=current(block).code.length){
		var now=current(block);
		switch(now.type){
			case "WHILE":
				if(expr(now.condition))
					ip[ip.length-1]=0;
				else
					leaveBlock();
			break;case "FOR":
				if(now.step!==undefined){
					getVar(now.variable.name).value+=expr(now.step);
				}else{
					getVar(now.variable.name).value++;
				}
				if(getVar(now.variable.name).value<=expr(now.end)){
					ip[ip.length-1]=0;
				}else{
					leaveBlock();
				}
			break;case "main":
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
			if(expr(now.condition));
				enterBlock();
		break;case "INC":
			if(now.value)
				getVar(now.variable.name).value+=expr(now.value);
			else
				getVar(now.variable.name).value++;
		break;case "DEC":
			if(now.value)
				getVar(now.variable.name).value-=expr(now.value);
			else
				getVar(now.variable.name).value--;
		break;case "DIM":
				console.log(now.inputs);
		break;case "PRINT":
			for(var i=0;i<now.inputs.length;i++){
				var n=now.inputs[i];
				var next=now.inputs[i+1];
				n=expr(n).toString();
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
			getVar(now.variable.name).value=expr(now.start)
			if(getVar(now.variable.name).value<=expr(now.end))
				enterBlock();
		break;case "function":
			if(builtins[now.name]){
				builtins[now.name](...now.inputs.map(function(x){return expr(x)}))
			}else{
				var x=functions[now.name];
				if(x){
					enterBlock(x);
					variables.push({})
					if(x.outputs){
						for(var i=0;i<x.outputs.length;i++){
							makeVar(x.outputs[i])
						}
					}
					for(var i=0;i<x.inputs.length;i++){
						makeVar(x.inputs[i])
						getVar(x.inputs[i]).value=expr(now.inputs[i])
					}
					console.log(current(variables))
				}else
					throw "undefined function";
			}
		break;case "END":case "STOP":
			return;
		break;case "assignment":
			getVar(now.variable.name).value=expr(now.value);
		break;default:
			throw "unsupported instruction"+now.type;
	}
	
	window.requestAnimationFrame(step);
}

function getVar(name){
	var i=variables.length-1;
	var ret;
	while(!ret&&i>=0){
		ret=variables[i][name];
		i--;
	}
	if(!ret)
		ret=makeVar(name)
	return ret;
}

function makeVar(x){
	return current(variables)[x]={value:0}
}