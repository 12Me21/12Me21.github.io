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
		window.location.hash="3"
		c2d.gputchr($canvas.width/2-((window.location.hash.length-1)*32/2),$canvas.height/2-(32/2),window.location.hash.substr(1),32,"red")
	},1000)
}
