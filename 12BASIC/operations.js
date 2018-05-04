var builtins={
	"^":  {2:exponent},
	"*":  {2:multiply},
	">":  {2:greaterThan},
	"<":  {2:lessThan},
	">=": {2:greaterOrEqual},
	"<=": {2:lessOrEqual},
	"==": {2:equal},
	"!=": {2:notEqual},
	"-":  {2:subtract,1:negate},
	"!":  {1:logicalNot},
	"+":  {2:add},
	"/":  {2:divide},
	"<<": {2:leftShift},
	">>": {2:rightShift},
	"AND":{2:logicalAnd},
	"OR": {2:logicalOr},
	"&":  {2:bitwiseAnd},
	"|":  {2:bitwiseOr},
	"~":  {2:bitwiseXor,1:bitwiseNot},
	"%":  {2:mod},
	"\\": {2:div},
	"NOT":{1:bitwiseNot},
	
	MID$: {3:mid},
	ASC:  {1:ascii},
	CHR$: {1:character},
	LEN:  {1:length},
	VAL:  {1:value,2:valueBase},
	STR$: {1:string,2:paddedString,3:paddedStringBase},
	RND:  {1:random1,2:random2},
	SIN:  {1:sine,2:sine2},
	COS:  {1:cosine,2:cosine2},
	ANG:  {2:angle},
	HYP:  {2:hypot},
	INSTR:{2:instr2,3:instr3},
	UCASE$:{1:ucase},
	LCASE$:{1:lcase},
	RIGHT$:{2:right},
	INPUT:{0:inputNumber},
	INPUT$:{0:input},
};

function expect(x,type){
	assert(x.type===type,"type mismatch")
}

function add(a,b){
	if(a.type==="number"){
		expect(b,"number");
		return new Value("number",a.value+b.value);
	}else{
		expect(a,"string");
		return new Value("string",a.value+b.toString());
	}
}

function subtract(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",a.value-b.value);
}

function negate(a){
	a.expect("number");
	return new Value("number",-a.value);
}

function multiply(a,b){
	if(a.isNumber()){
		expect(b,"number");
		return new Value("number",a.value*b.value);
	}else{
		assert(a.type==="string" && b.type==="number","type mismatch");
		return new Value("string",a.value.repeat(b.value));
	}
}

function divide(a,b){
	a.expect("number");
	b.expect("number");
	assert(b.value!==0,"divide by 0");
	return new Value("number",a.value/b.value);
}

//floor division
function div(a,b){
	a.expect("number");
	b.expect("number");
	assert(b.value!==0,"divide by 0");
	return new Value("number",Math.floor(a.value/b.value));
}

//mod
function mod(a,b){
	a.expect("number");
	a.expect("number");
	assert(b.value!==0,"divide by 0");
	return new Value("number",a.value-Math.floor(a.value/b.value)*b.value);
}

function comparison(a,b,compareFunction){
	assert(a.type===b.type,"type mismatch");
	return new Value("number",compareFunction(a.value,b.value)?1:0);
}

function greaterThan(a,b){
	return comparison(a,b,function(a,b){return a>b});
}

function exponent(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",a.value**b.value);
}

function lessThan(a,b){
	return comparison(a,b,function(a,b){return a<b});
}

function lessOrEqual(a,b){
	return comparison(a,b,function(a,b){return a<=b});
}

function greaterOrEqual(a,b){
	return comparison(a,b,function(a,b){return a>=b});
}

function equal(a,b){
	return comparison(a,b,function(a,b){return a===b});
}

function notEqual(a,b){
	return comparison(a,b,function(a,b){return a!==b});
}

function logicalAnd(a,b){
	return new Value("number",(a.truthy() && b.truthy())?1:0);
}

function logicalOr(a,b){
	if(a.truthy())
		return a.copy();
	else
		return b.copy();
}

function logicalNot(a){
	return new Value("number",a.truthy()?0:1);
}

function bitwiseNot(a){
	a.expect("number");
	return new Value("number",~a.value);
}

function bitwiseAnd(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",a.value & b.value);
}

function bitwiseOr(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",a.value | b.value);
}

function bitwiseXor(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",a.value ^ b.value);
}

function leftShift(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",a.value<<b.value);
}

function rightShift(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",a.value>>b.value);
}

function right(a,b){
	a.expect("string");
	b.expect("number");
	assert(b.value>=0,"domain error");
	return new Value("string",a.value.substr(a.value.length-b.value));
}
