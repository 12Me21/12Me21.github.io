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

window.onload=function(){
	window.setTimeout(function(){
		var c2d=$canvas.getContext("2d")
		c2d.gcls("black")
		c2d.gputchr($canvas.width,$canvas.height,"test",16,"red")
	},1000)
}
