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
	STR$: {1:string,2:stringBase},
	RND:  {1:random1,2:random2},
	SIN:  {1:sine,2:sine2},
	COS:  {1:cosine,2:cosine2},
	ANG:  {2:angle},
	HYP:  {2:hypot},
	CLS:  {0:function(){$console.value=""}}
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
		console.log(a,b)
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

//integer division (idk if this works though)
function div(a,b){
	a.expect("number");
	b.expect("number");
	assert(b.value!==0,"divide by 0");
	return new Value("number",Math.floor(a.value/b.value));
}

//mod
function mod(a,b){
	expect(a,"number");
	expect(b,"number");
	assert(b.value!==0,"divide by 0");
	return new Value("number",a.value-Math.floor(a.value/b.value)*b.value);
}

function comparison(a,b,compareFunction){
	assert(a.type===b.type,"type mismatch")
	return new Value("number",compareFunction(a,b)?1:0);
}

function greaterThan(a,b){
	return comparison(a,b,function(a,b){return a.value>b.value});
}

function exponent(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",a.value**b.value);
}

function lessThan(a,b){
	return comparison(a,b,function(a,b){return a.value<b.value});
}

function lessOrEqual(a,b){
	return comparison(a,b,function(a,b){return a.value<=b.value});
}

function greaterOrEqual(a,b){
	return comparison(a,b,function(a,b){return a.value>=b.value});
}

function equal(a,b){
	return comparison(a,b,function(a,b){return a.value===b.value});
}

function notEqual(a,b){
	return comparison(a,b,function(a,b){return a.value!==b.value});
}

function logicalAnd(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",(a.truthy() && b.truthy())?1:0);
}

function logicalOr(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",(a.truthy() || b.truthy())?1:0);
}

function logicalNot(a){
	expect(a,"number");
	return new Value("number",a.truthy()?0:1);
}

function bitwiseNot(a){
	expect(a,"number");
	return new Value("number",~a.value);
}

function bitwiseAnd(a,b){
	expect(a,"number");
	expect(b,"number");
	return new Value("number",a.value & b.value);
}

function bitwiseOr(a,b){
	expect(a,"number");
	expect(b,"number");
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