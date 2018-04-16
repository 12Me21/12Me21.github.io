function Value(type,value,arrayDims){
	//if(!arrayDims){
	this.type=type;
	if(value===undefined){
		this.value=defaultValue(type);
	}else
		this.value=value;
	/*}else{
		this.type=type;
		var size=arrayDims.reduce(function(x,y){return x*y},1);
		if(value===undefined){
			this.value=new Array(size).fill(defaultValue(type));
		}else{
			assert(value.length===size,"wrong size when initializing array");
			this.value=value;
		}
	}*/
}

Value.prototype.isNumber=function(){
	return this.type==="integer" || this.type==="float";
}