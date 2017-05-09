CanvasRenderingContext2D.prototype.gcls=function(color){
	this.beginPath()
	this.rect(0, 0, this.canvas.width, this.canvas.height)
	this.fillStyle = color
	this.fill();
}

CanvasRenderingContext2D.prototype.gputchr=function(x,y,text,scale,color){
	this.font = scale+"px SmileBASIC"
	this.fillStyle = color
	this.fillText(text, x, y+scale);
}

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

window.onload=function(){
	var c2d=$canvas.getContext("2d")
	c2d.gcls("black")
	c2d.gputchr($canvas.width/2-(urlParams.text.length*32/2),$canvas.height/2-(32/2),urlParams.text,32,urlParams.color)
}
