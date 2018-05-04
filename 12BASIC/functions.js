function mid(a,b,c){
	a.expect("string");
	b.expect("number");
	c.expect("number");
	var start=b.value;
	var length=c.value;
	if(start<0){
		length-=-start;
		start=0;
	}
	assert(length>=0,"domain error");
	return new Value("string",a.value.substr(start,length));
}

function length(a){
	expect(a,"string");
	return new Value("number",a.value.length);
}

function ascii(a){
	a.expect("string");
	assert(a.value.length>0,"empty string in ASC");
	return new Value("number",a.value.charCodeAt(0));
}

function character(a){
	a.expect("number");
	return new Value("string",String.fromCharCode(a.value & 255));
}

//this should be more strict!
function value(a){
	a.expect("string");
	return new Value("number",parseFloat(a.value)||0);
}

//this should be more strict!
function valueBase(a,b){
	a.expect("string");
	b.expect("number");
	if(b.value==10)
		return new Value("number",parseFloat(a.value)||0);
	else
		return new Value("number",parseInt(a.value,b.value)||0);
}

//this should be more strict!
function string(a){
	a.expect("number");
	return new Value("string",a.toString());
}

//this should be more strict!
function stringBase(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("string",a.toString(b.value));
}

function random1(a){
	a.expect("number");
	return new Value("number",Math.floor(Math.random()*a));
}

function random2(a,b){
	a.expect("number");
	b.expect("number");
	var start=a.value
	var range=b.value-start+1
	return new Value("number",Math.floor(Math.random()*range)+start);
}

function sine(a){
	a.expect("number");
	return new Value("number",Math.sin(a.value*(Math.PI*2)));
}

function cosine(a){
	a.expect("number");
	return new Value("number",Math.cos(a.value*(Math.PI*2)));
}

function angle(a,b){
	a.expect("number");
	b.expect("number");
	var atan=Math.atan2(b.value,a.value)/(Math.PI*2)
	return new Value("number",atan>=0?atan:atan+1);
}

function hypot(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.sqrt(a.value**2+b.value**2));
}

function sine2(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.sin(a.value*(Math.PI*2))*b.value);
}

function cosine2(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.cos(a.value*(Math.PI*2))*b.value);
}

function instr2(a,b){
	a.expect("string");
	b.expect("string");
	return new Value("number",a.value.indexOf(b.value));
}

function instr3(a,b,c){
	a.expect("number");
	b.expect("string");
	c.expect("string");
	return new Value("number",b.value.indexOf(c.value,a.value));
}

function ucase(a){
	a.expect("string");
	return new Value("string",a.value.toUpperCase());
}

function lcase(a){
	a.expect("string");
	return new Value("string",a.value.toLowerCase());
}