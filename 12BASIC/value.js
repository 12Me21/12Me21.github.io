function Value(type,value){
	assert(type==="number"||type==="string","invalid type when creating value");
	this.type=type;
	if(value===undefined)
		this.value=defaultValue(type);
	else{
		//	value=parseFloat("0"+value)||0;
		this.value=value;
	}
}

var BasicNumber=Object.create(Value)

Value.prototype.copy=function(){
	return new Value(this.type,this.value);
}

Value.prototype.toString=function(base){
	if(this.type==="string")
		return this.value
	else
		return this.value.toString(base).toUpperCase();
}

Value.prototype.truthy=function(){
	if(this.type==="string")
		return this.value!=="";
	else
		return this.value!==0;
}

Value.prototype.expect=function(type){
	assert(this.type===type,"type mismatch");
}

//don't use
Value.prototype.isNumber=function(){
	return this.type==="number";
}