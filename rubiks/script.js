//sorry this code isn't that great
//I wrote it quickly

var cube=Array(6);
for(var i=0;i<6;i++){
	cube[i]=Array(9);
	for(var j=0;j<9;j++){
		cube[i][j]=i;
	}
}

//012
//783
//654

var up=0
var front=1
var right=2
var down=3
var back=4
var left=5

var colors=["yellow","red","green","white","orange","blue"];

var canvas=document.getElementById("canvas");
var scrambleButton=document.getElementById("scrambleButton"); // these lines are actually unnecessary !

var c2d=canvas.getContext("2d");

scrambleButton.onclick=function(){
	scramble(cube,1000);
	var x=290,y=0
	drawface(cube,left,c2d,x,y+30,30);
	drawface(cube,front,c2d,x+30,y+30,30);
	drawface(cube,right,c2d,x+60,y+30,30);
	drawface(cube,up,c2d,x+30,y,30);
	drawface(cube,down,c2d,x+30,y+60,30);
	drawface(cube,back,c2d,x+90,y+30,30);
	var size=100
	var topMap=map(cube,up)
	var frontMap=map(cube,front)
	var rightMap=map(cube,right)
	c2d.strokeStyle="black";
	c2d.lineWidth=size/10;
	c2d.miterLimit=1;
	x=size/10
	y=size/10
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			topsquare(c2d,x+(i/2-j/2+4/4)*size,y+(i/4+j/4)*size,size,colors[topMap[j][i]])
			frontsquare(c2d,x+(i/2)*size,y+(i/4+j/2+3/4)*size,size,colors[frontMap[j][i]])
			rightsquare(c2d,x+(i/2+6/4)*size,y+(-i/4+j/2+5/4)*size,size,colors[rightMap[j][i]])
		}
	}
}
scrambleButton.click();

function scramble(cube,moves){
	for(var i=0;i<moves;i++){
		var n=Math.random()*3|0
		switch(n){
		case 0:
			rotateup(cube)
		break;case 1:
			rotateright(cube)
		break;case 2:
			turnup(cube)
		}
	}
}

function fillShape(c2d,points,color){
	c2d.fillStyle=color;
	c2d.beginPath();
	for(var i=0;i<points.length;i++){
		c2d.lineTo(points[i].x,points[i].y)
	}
	c2d.closePath();
	c2d.fill();
	c2d.stroke();
}

function topsquare(c2d,x,y,size,color){
	fillShape(c2d,[{x:x,y:y+size/4},{x:x+size/2,y:y},{x:x+size,y:y+size/4},{x:x+size/2,y:y+size/2}],color)
}

function frontsquare(x2d,x,y,size,color){
	fillShape(c2d,[{x:x,y:y},{x:x+size/2,y:y+size/4},{x:x+size/2,y:y+size*3/4},{x:x,y:y+size/2}],color)
}

function rightsquare(x2d,x,y,size,color){
	fillShape(c2d,[{x:x,y:y+size/4},{x:x+size/2,y:y},{x:x+size/2,y:y+size/2},{x:x,y:y+size*3/4}],color)
}

function drawface(cube,face,c2d,x,y,size){
	c2d.fillStyle="black";
	
	c2d.fillRect(x,y,size,size);
	var cubieSize=size/3
	var cubieBorder=size/30
	var faceMap=map(cube,face)
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			c2d.fillStyle=colors[faceMap[j][i]]
			c2d.fillRect(x+i*cubieSize+cubieBorder,y+j*cubieSize+cubieBorder,cubieSize-cubieBorder*2,cubieSize-cubieBorder*2);
		}
	}
}

function rotateup(cube){
	var temp=cube[up]
	cube[up]=cube[front]
	cube[front]=cube[down]
	cube[down]=cube[back]
	turnfaceonly(cube,down)
	turnfaceonly(cube,down)
	cube[back]=temp
	turnfaceonly(cube,back)
	turnfaceonly(cube,back)
	
	turnfaceonly(cube,right)
	turnfaceonly(cube,left)
	turnfaceonly(cube,left)
	turnfaceonly(cube,left)
}

function turnfaceonly(cube,face){
	var temp=cube[face][0]
	cube[face][0]=cube[face][6]
	cube[face][6]=cube[face][4]
	cube[face][4]=cube[face][2]
	cube[face][2]=temp
	
	temp=cube[face][1]
	cube[face][1]=cube[face][7]
	cube[face][7]=cube[face][5]
	cube[face][5]=cube[face][3]
	cube[face][3]=temp
}

function rotateright(cube){
	var temp=cube[front]
	cube[front]=cube[left]
	cube[left]=cube[back]
	cube[back]=cube[right]
	cube[right]=temp
	
	turnfaceonly(cube,down)
	turnfaceonly(cube,up)
	turnfaceonly(cube,up)
	turnfaceonly(cube,up)
}

function turnup(cube){
	turnfaceonly(cube,up)
	
	for(var i=0;i<3;i++){
		temp=cube[front][i]
		cube[front][i]=cube[right][i]
		cube[right][i]=cube[back][i]
		cube[back][i]=cube[left][i]
		cube[left][i]=temp
	}
}

function map(cube,face){
	return [
		[cube[face][0],cube[face][1],cube[face][2]],
		[cube[face][7],cube[face][8],cube[face][3]],
		[cube[face][6],cube[face][5],cube[face][4]]
	]
}

//oh no
