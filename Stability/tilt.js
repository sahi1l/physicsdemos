/*global $,Raphael*/
import {Help} from "../lib/default.js";
let paper,bblock;
let W;
let H=600;
let height=H/3;
let width=100;
let colorG="#8af";
//let clickx=0;
let offset;
let active=0;
//let COMX=0.5;//fraction of the way over (when to the left)
//let COMY=0.5; //fraction of the way up (when to the left)

let block; class _block {
    constructor() {
        this.width = 100;
        this.height = H/3;
        let x0 = pivot.x - width;
        let y0 = pivot.y - height;
        let color = "#222";
        let bcolor = "black";
        this.back = paper.rect(x0,y0,this.width,this.height)
            .attr({fill:color, stroke: bcolor}); //was bblock
        this.front = paper.rect(x0,y0,this.width,this.height)
            .attr({fill:color, stroke: bcolor, opacity:0.1}); //was block
        this.front.mousedown((event)=>{
	    ROT.clickA=ROT.Ang(event.pageX,event.pageY);
	    ROT.start=ROT.angle;
	    this.front.mousemove((event)=>{Turn(event.pageX,event.pageY);});
        });
        this.stopTurn = this.stopTurn.bind(this);
        this.front.mouseout(this.stopTurn);
        this.front.mouseup(this.stopTurn);
        
    }
    toFront() {
        this.front.toFront();
    }
    stopTurn() {
        ROT.clickA=720;
        this.front.unmousemove();
        Fall(0,2);
    }
    rotate(angle) {
        this.front.transform("R"+angle+","+pivot.x+","+pivot.y);
        this.back.transform("R"+angle+","+pivot.x+","+pivot.y);

    }
    resize() {
        let x0 = pivot.x - width;
        let y0 = pivot.y - height;
        let attr = {x: x0, y:y0, width: width, height: height};
        this.front.attr(attr);
        this.back.attr(attr);
    }
    
}
let ROT = new class {
    constructor(){
        this.start=0; //was sAngle
        this.clickA=720;
        this.angle=0;
    }
    Ang(x,y){
        //problem: screen coordinates
        return Math.atan2(y-offset.top-pivot.y,x-offset.left-pivot.x)/Math.PI*180;
    }
}
let pivot; class _pivot {
    constructor() {
        this.base = paper.path();
        this.widget = paper.circle(0,0,5).attr("fill","yellow");
        this.reset();
    }
    reset() {
        this.x = W/3;
        this.y = H/2;
        this.widget.attr({cx: this.x, cy: this.y});
        this.base.attr({path:`M0,${this.y}l${W},0`});
    }
}
let com; class _com {
    constructor(x,y) {
        //x and y are percentages of the total block
        this.x = x;
        this.y = y;
        this.dot = paper.circle(pivot.x-width*x, pivot.y-height*y,5,5);
        this.dot.attr("fill",colorG);
        this.dot.drag(comMove, comStart, comUp);
        this.Garrow = paper.path().attr({"stroke-width":5,stroke:colorG,fill:colorG});
        this.Gtxt = paper.text(0,0,"mg").attr({"font-size":24,fill:colorG});
        
    }
    pos(angle) {
        let a=angle*Math.PI/180;
        let dx=(width*this.x)*Math.cos(a)-(height*this.y)*Math.sin(a);
        let dy=+(width*this.x)*Math.sin(a)+(height*this.y)*Math.cos(a);
        let x = pivot.x - dx;
        let y = pivot.y - dy;
        return {x:x, y:y};
    }
    resize(angle) {
        let x = this.pos(angle).x;
        let y = this.pos(angle).y;
        let a = angle * Math.PI/180;
        this.dot.attr({cx:x, cy: y});
        let arrowhead = "l10,-20l-20,0l10,20";
        this.Garrow.attr({path:`M${x},${y}l0,50`+arrowhead})
        this.Gtxt.attr({x: x+30, y:y+30});
        this.dot.toFront();
        return [x,y];
    }
    rotate(angle) {
        this.resize(angle);
        //this.dot.transform(`R${angle},${pivot.x},${pivot.y}`);
    }
}

let Garrow;
let Gtxt;
let Sizer;
//function pD(event){event.preventDefault();};
//function nil(event){;};

function DrawGravity() {
//    let a=angle*Math.PI/180;
//    let dx=(width*com.x)*Math.cos(a)-(height*com.y)*Math.sin(a);
//    let dy=+(width*com.x)*Math.sin(a)+(height*com.y)*Math.cos(a);
//    let path="M"+(pivot.x-dx)+","+(pivot.y-dy)+"L"+(pivot.x-dx)+","+pivot.y+"l10,-20l-20,0l10,20";
//    Garrow.attr({path:path});
    //    Gtxt.attr({x:pivot.x-dx+30,y:pivot.y-dy+30});
    let [x,y] = com.resize(ROT.angle);
    //    com.dot.toFront();
    normal.position(ROT.angle);
//    if(angle<=0 || angle>=90) {
//        normal.move(x);
//    } else {
//        normal.move(pivot.x);
//    }
}

let normal; class _normal {
    constructor(x,y) {
        this.x=x;
        this.y=y;
        this.arrow = paper.path("M"+this.x+","+this.y+"l0,50l0,-50l10,20l-20,0Z").attr({"stroke-width":5,stroke:"red",fill:"red"});
        this.txt = paper.text(this.x+20,this.y+40,"N").attr({fill:"red","font-size":36});
    }
    move(x) {
        this.x=x;
        this.arrow.attr("path","M"+this.x+","+this.y+"l0,50l0,-50l10,20l-20,0Z");
        this.txt.attr("x",this.x+20);
    }
    position(angle) {
        if (angle<=0 || angle>=90) {
            normal.move(com.pos(angle).x);
        } else {
            normal.move(pivot.x);
        }
    }
}
function init(){
    paper = Raphael("canvas","100%",H);
    W=$("#canvas")[0].getBoundingClientRect().width;
    pivot = new _pivot();
    offset=$("#canvas").offset();
    //Baseline
    //Normal Force: should actually move over when block is prone
    normal = new _normal(pivot.x,pivot.y);
    block = new _block();
/*    block=paper.rect(pivot.x-width,pivot.y-height,width,height);
    block.attr({fill:"#222",stroke:"green",opacity:0.1});
    bblock=paper.rect(pivot.x-width,pivot.y-height,width,height).attr({fill:"#222",stroke:"red"});
    bblock.toBack();
    */
    //Gravity:
    com = new _com(0.5,0.5);
    block.toFront();
    Sizer=paper.rect(pivot.x-width,pivot.y-height,Math.min(width,height)*0.2,Math.min(width,height)*0.2).attr({fill:"gray"});
    Sizer.drag(szMove,szStart,szUp);
//    com=paper.circle(pivot.x-width*COMX,pivot.y-height*COMY,5,5);
//    com.attr("fill",colorG);
//    com.drag(comMove,comStart,comUp);
    DrawGravity();
    new Help($("#help"),"toggle");

}
function DrawRectangle(){
    block.rotate(ROT.angle);
    com.resize(ROT.angle);
    Sizer.transform("R"+ROT.angle+","+pivot.x+","+pivot.y);
    DrawGravity();
}
function Turn(x,y){
    //Need to allow mousemove over entire page, not just the block!
    //Solution: an underlying object on top of the paper, the size of the paper
    //consider drag instead!
    //also, instead of X, how about calculate the d-theta with respect to the pivot
    if(ROT.clickA<=360){
	let newangle=ROT.start+ROT.Ang(x,y)-ROT.clickA;
	if(newangle<0){newangle=0;}
	if(newangle>90){newangle=90;}
	ROT.angle=newangle;
	DrawRectangle();
    }
}
function Fall(omega,alpha) {
    let dt=0.05;
    alpha=5*Math.sin(ROT.angle/180*Math.PI);
    let x=-width*com.x*Math.cos(ROT.angle/180*Math.PI)+height*com.y*Math.sin(ROT.angle/180*Math.PI);
    if(x<0){
	if(ROT.angle<=0){
	    Bounce(2,0);
	    return;} //possible jolt first
	ROT.angle=ROT.angle+omega*dt;
	omega=omega-alpha*dt;
	DrawRectangle();
    }
    if(x>0){
	if(ROT.angle>=90){Bounce(2,1);return;}
	ROT.angle=ROT.angle+omega*dt;
	omega=omega+alpha*dt;
	DrawRectangle();
    }
    if(ROT.clickA==720){setTimeout((o=omega,a=alpha)=>Fall(o,a),10);}
}
function Bounce(off,side){
    if(ROT.clickA==720){return;}
    if(side==1){
	ROT.angle=90-(off%2)*1;
    } else {
	ROT.angle=(off%2)*1;
    }
    DrawRectangle(ROT.angle);
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
    let a=ROT.angle*Math.PI/180;
    let Dx=dx*Math.cos(a)+dy*Math.sin(a);
    let Dy=dy*Math.cos(a)-dx*Math.sin(a);
    this.attr({cx:this.ox+Dx,cy:this.oy+Dy});
    com.x=-(this.attr("cx")-pivot.x)/width;
    com.y=-(this.attr("cy")-pivot.y)/height;
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
    let a=ROT.angle*Math.PI/180;
    let Dx=dx*Math.cos(a)+dy*Math.sin(a);
    let Dy=dy*Math.cos(a)-dx*Math.sin(a);
    let nx = this.ox + Dx;
    let ny = this.oy + Dy;
    let nw = pivot.x - nx;
    let nh = pivot.y - ny;
    if (nw>=5 && nh>=5) {
	this.attr({x:nx, y:ny});
	width = nw;
	height = nh;
	Resize();
	DrawRectangle();
    }
};
function szUp(){
    this.attr({fill:this.oc});
    Resize();
    DrawRectangle();
};

function Resize() {
    block.resize();
    com.resize();
}

$(init);
