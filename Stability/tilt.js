import {Help} from "../lib/default.js";
let paper,block,bblock,com;
let pivotX=300;
let pivotY=350;
let height=200;
let width=100;
let arrowL=40;
let sAngle=0;
let clickA=720;
let colorG="#8af";
//let clickx=0;
let offset;
let angle=0;
let active=0;
let COMX=0.5;//fraction of the way over (when to the left)
let COMY=0.5; //fraction of the way up (when to the left)
let COM=0.5; //fraction of the way up
let Garrow;
let Gtxt;
let Sizer;
function pD(event){event.preventDefault();};
function nil(event){;};

function Ang(x,y){
    //problem: screen coordinates
    return Math.atan2(y-offset.top-pivotY,x-offset.left-pivotX)/Math.PI*180;
}
function DrawGravity() {
    let a=angle*Math.PI/180;
    let dx=(width*COMX)*Math.cos(a)-(height*COMY)*Math.sin(a);
    let dy=+(width*COMX)*Math.sin(a)+(height*COMY)*Math.cos(a);
    let path="M"+(pivotX-dx)+","+(pivotY-dy)+"L"+(pivotX-dx)+","+pivotY+"l10,-20l-20,0l10,20";
    Garrow.attr({path:path});
    Gtxt.attr({x:pivotX-dx+30,y:pivotY-dy+30});

}
function init(){
    paper = Raphael("canvas",800,600);
    offset=$("#canvas").offset();
    //Baseline
    paper.path("M0,"+pivotY+"l"+(pivotX*2)+",0");
    //Normal Force: should actually move over when block is prone
    paper.path("M"+pivotX+","+pivotY+"l0,50l0,-50l10,20l-20,0Z").attr({"stroke-width":5,stroke:"red",fill:"red"});
    let duh=paper.text(pivotX+20,pivotY+40,"N").attr({fill:"red","font-size":36});
    //    duh.drag(nil,nil,nil);
    block=paper.rect(pivotX-width,pivotY-height,width,height);
    block.attr({fill:"#222",stroke:"black",opacity:0.1});
    bblock=paper.rect(pivotX-width,pivotY-height,width,height).attr({fill:"#222",stroke:"black"});
    bblock.toBack();
    //Gravity:
    Garrow=paper.path("M"+(pivotX-width*COMX)+","+(pivotY-height*COMY)+"l0,50").attr({"stroke-width":5,stroke:colorG,fill:colorG});
    Gtxt=paper.text((pivotX-width*COMX)+30,(pivotY-height*COMY),"mg").attr({"font-size":24,fill:colorG});
    block.toFront();
    Sizer=paper.rect(pivotX-width,pivotY-height,Math.min(width,height)*0.1,Math.min(width,height)*0.1).attr({fill:"gray"});
    Sizer.drag(szMove,szStart,szUp);
    com=paper.circle(pivotX-width*COMX,pivotY-height*COMY,5,5);
    com.attr("fill",colorG);
    com.drag(comMove,comStart,comUp);
    DrawGravity();
    block.mousedown(function(event){
	clickA=Ang(event.pageX,event.pageY);
	sAngle=angle;
	block.mousemove(function(event){Turn(event.pageX,event.pageY);});
    });
    block.mouseout(stopTurn);
    block.mouseup(stopTurn);
    new Help($("#help"),"toggle");

}
function stopTurn(event){
    clickA=720;
    block.unmousemove();
    Fall(0,2);
}
function DrawRectangle(){
    block.transform("R"+angle+","+pivotX+","+pivotY);
    bblock.transform("R"+angle+","+pivotX+","+pivotY);
    com.transform("R"+angle+","+pivotX+","+pivotY);
    Sizer.transform("R"+angle+","+pivotX+","+pivotY);
    DrawGravity();
}
function Turn(x,y){
    //Need to allow mousemove over entire page, not just the block!
    //Solution: an underlying object on top of the paper, the size of the paper
    //consider drag instead!
    //also, instead of X, how about calculate the d-theta with respect to the pivot
    if(clickA<=360){
	let newangle=sAngle+Ang(x,y)-clickA;
	if(newangle<0){newangle=0;}
	if(newangle>90){newangle=90;}
	angle=newangle;
	DrawRectangle();
    }
}
function Fall(omega,alpha) {
    let dt=0.05;
    alpha=5*Math.sin(angle/180*Math.PI);
    let x=-width*COMX*Math.cos(angle/180*Math.PI)+height*COMY*Math.sin(angle/180*Math.PI);
    if(x<0){
	if(angle<=0){
	    Bounce(2,0);
	    return;} //possible jolt first
	angle=angle+omega*dt;
	omega=omega-alpha*dt;
	DrawRectangle();
    }
    if(x>0){
	if(angle>=90){Bounce(2,1);return;}
	angle=angle+omega*dt;
	omega=omega+alpha*dt;
	DrawRectangle();
    }
    if(clickA==720){setTimeout((o=omega,a=alpha)=>Fall(o,a),10);}
}
function Bounce(off,side){
    if(clickA==720){return;}
    if(side==1){
	angle=90-(off%2)*1;
    } else {
	angle=(off%2)*1;
    }
    DrawRectangle(angle);
    if(off>0){
	setTimeout((o=off,s=side)=>{Bounce(o-1,s);},20);
    }
}
//THE CENTER OF MASS
function comStart(){
    this.ox=this.attr("cx");
    this.oy=this.attr("cy");
    this.oc=this.attr("fill");
    this.attr({fill:"white"});
};
function comMove(dx,dy) {
    let a=angle*Math.PI/180;
    let Dx=dx*Math.cos(a)+dy*Math.sin(a);
    let Dy=dy*Math.cos(a)-dx*Math.sin(a);
    this.attr({cx:this.ox+Dx,cy:this.oy+Dy});
    COMX=-(this.attr("cx")-pivotX)/width;
    COMY=-(this.attr("cy")-pivotY)/height;
    DrawGravity();
};
function comUp(){
    this.attr({fill: this.oc});
};

function szStart(){
    this.ox=this.attr("x");
    this.oy=this.attr("y");
    this.oc=this.attr("fill");
    this.attr({fill:"white"});
};
function szMove(dx,dy){
    let a=angle*Math.PI/180;
    let Dx=dx*Math.cos(a)+dy*Math.sin(a);
    let Dy=dy*Math.cos(a)-dx*Math.sin(a);
    this.attr({x:this.ox+Dx,y:this.oy+Dy});
    width=pivotX-this.attr("x");
    height=pivotY-this.attr("y");
    Resize();
    DrawRectangle();
};
function szUp(){
    this.attr({fill:this.oc});
    Resize();
    DrawRectangle();
};

function Resize() {
    block.attr({x:pivotX-width,y:pivotY-height,width:width,height:height});
    bblock.attr({x:pivotX-width,y:pivotY-height,width:width,height:height});
    com.attr({cx:pivotX-width*COMX,cy:pivotY-height*COMY});
}

$(init);
