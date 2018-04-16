function multiply(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("float",a.value*b.value); //TODO: detect float vs int
	}else if(a.type==="string"){
		assert(b.isNumber(),"type wrong");
		return new Value("string",a.value.repeat(b.value));
	}
}

function greaterThan(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value>b.value)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value>b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function lessThan(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value<b.value)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value<b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function lessOrEqual(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value<=b.value)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value<=b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function greaterOrEqual(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value>=b.value)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value>=b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function equal(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value===b.value)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value===b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function notEqual(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value!==b.value)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value!==b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function logicalAnd(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value!==0 && b.value!==0)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value>b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function logicalOr(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("integer",(a.value<b.value)?1:0);
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("integer",(a.value<b.value)?1:0); //hopefully JS doesn't make "1"+"2" return 3...
	}
}

function add(a,b){
	if(a.isNumber()){
		assert(b.isNumber(),"type mismatch");
		return new Value("float",a.value+b.value); //TODO: detect float vs int
	}else if(a.type==="string"){
		assert(b.type==="string","type mismatch");
		return new Value("string",a.value+b.value); //hopefully JS doesn't make "1"+"2" return 3...
	}
	assert(false,"internal error, addition failed");
}

function subtract(a,b){
	assert(a.isNumber()&&b.isNumber(),"type mismatch");
	return new Value("float",a.value-b.value); //TODO: detect float vs int
}

function logicalNot(a){
	assert(a.isNumber(),"type mismatch");
	return new Value("integer",a.value?0:1);
}