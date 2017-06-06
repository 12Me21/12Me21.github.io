function shuffle(array){
	var i;
	for (i = array.length - 1; i >= 1; i -= 1) {
		array.swap(i, Math.floor(Math.random() * (i + 1)));
    }
    return array;
}

//should be built-in
Array.prototype.swap = function(a, b) {
	var temp = this[a];
	this[a] = this[b];
	this[b] = temp;
}
