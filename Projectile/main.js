var paper,background;
var Xmax,Ymax;
var cannon,platform,ball,wheel;
var angle=0,H=60;
var g=1,dt=0.5;
//var V=20;
var d2r=Math.PI/180.;
function TiltCannon(ang){
    angle=ang;
    var rule="R"+(-angle)+","+(wheel.attr("x")+0.5*wheel.attr("width"))+","+(wheel.attr("y")+0.5*wheel.attr("height"));
    cannon.transform(rule);
    ball.transform(rule);
}
function Fire(){
    Reset();
    var bbox=ball.getBBox(false);
    ball.transform("");
    ball.x=0.5*(bbox.x+bbox.x2);
    ball.y=0.5*(bbox.y+bbox.y2);
    ball.vx=velS.value*Math.cos(angle*d2r);
    ball.vy=-velS.value*Math.sin(angle*d2r);
    ball.t=0;
    ball.attr({cx:0.5*(bbox.x+bbox.x2),cy:0.5*(bbox.y+bbox.y2),fill:"black"});
    setTimeout(move,10);
}
move=function(){
    ball.vy+=g*dt;
    ball.x+=ball.vx*dt;
    ball.y+=ball.vy*dt;
    ball.attr({cx:ball.x,cy:ball.y});
    if(ball.x<Xmax && ball.y<Ymax){setTimeout(move,10);}
}
function place(height,ang){
    H=height; angle=ang;
    platform.attr({y:Ymax-height,height:height});
    cannon.attr({y:Ymax-height-40});
    wheel.attr({y:Ymax-height-40});
    ball.attr({cx:110,cy:Ymax-height-25});
    TiltCannon(angle);
}
function Reset(){
    ball.attr({fill:"none",stroke:"none"});
    place(H,angle);
}
var init=function (name,wd,ht){
    paper=Raphael(name,wd,ht);Xmax=wd;Ymax=ht;
    background=paper.rect(0,0,wd,ht).attr({fill:"white"});
    platform=paper.rect(10,Ymax-60,80,60).attr({fill:"blue"});
    cannon=paper.image("cannon.png",30,Ymax-100,80,30);
    wheel=paper.image("wheel.png",30,Ymax-100,40,40);
    ball=paper.circle(110,Ymax-85,8).attr({fill:"none",stroke:"none"});
    Reset();
    place(60,0);
    wheel.click(Fire);
    cannon.mousedown(canStart);
    cannon.mousemove(canMove);
    cannon.mouseup(canStop);
    platform.mousedown(platStart);
    platform.mousemove(platMove);
    platform.mouseup(platStop);
    background.mouseup(function(){canStop();platStop();});
};
var canQ=0;
canStart=function(event){
    Reset();
    canQ=1;
};
canMove=function(event){
    if(canQ){
	nA=-Math.atan2(event.pageY-paper.canvas.offsetTop-wheel.attr("y")-0.5*wheel.attr("height"),
		       event.pageX-paper.canvas.offsetLeft-wheel.attr("x")-0.5*wheel.attr("width")
		      )/d2r;
	console.log(nA);
	place(H,nA);
    }
};
canStop=function(){
    canQ=0;
    Reset();
    
};
//----------------------------------------
var platQ=0;
platStart=function(event){
    Reset();
    platQ=1;
    platform.oy=event.pageY;
    platform.oh=H;
};
platMove=function(event){
    if(platQ){
	Reset();
	H=platform.oh-(event.pageY-platform.oy);
	place(H,angle);
    }
};
platStop=function(){
    platQ=0;
    Reset();
}
    

