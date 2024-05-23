/*global $,Raphael*/
import {Help} from "../lib/default.js";
//CLASSES
let block;
let pivot;
let com;
let normal;
let ROT;
let Sizer;
let buttons;
let thump = new Audio('thump.mp3');
//----------------------------------------
let paper;
let W;
let H=600;
let offset;
let active=0;
class _buttons {
    constructor() {
        let $root=$("#buttons");
        this.left = $("<button>").appendTo($root).html("<-").on("click",()=>{Jump(0)});
        this.right = $("<button>").appendTo($root).html("->").on("click",()=>{Jump(90)});;
        this.reset = $("<button>").appendTo($root).html("Reset").on("click",()=>{block.resetSize()});
    }
}

class _block {
    constructor() {
        this.width = 100;
        this.height = H/3;
        let x0 = pivot.x - this.width;
        let y0 = pivot.y - this.height;
        let color = "#222";
        let bcolor = "black";
        this.back = paper.rect(x0,y0,this.width,this.height)
            .attr({fill:color, stroke: bcolor}); //was bblock
        this.front = paper.rect(x0,y0,this.width,this.height)
            .attr({fill:color, stroke: bcolor, opacity:0.1}); //was block
        this.front.mousedown((event)=>{
            ROT.click(event.pageX,event.pageY);
            //ROT.clickA=ROT.Ang(event.pageX,event.pageY);
	    //ROT.start=ROT.angle;
	    this.front.mousemove((event)=>{Turn(event.pageX,event.pageY);});
        });
        this.stopTurn = this.stopTurn.bind(this);
        this.front.mouseout(this.stopTurn);
        this.front.mouseup(this.stopTurn);
        
    }
    resetSize() {
        this.width=100;
        this.height=H/3;
        Resize();
        DrawRectangle();
    }
    getBox() {
        return this.front.getBBox(false);
    }
    toFront() {
        this.front.toFront();
    }
    stopTurn() {
        ROT.clickA=null;
        this.front.unmousemove();
        Fall(0,2);
    }
    rotate(angle) {
        ROT.transform(this.front);
        ROT.transform(this.back);
    }
    resize() {
        let x0 = pivot.x - this.width;
        let y0 = pivot.y - this.height;
        let attr = {x: x0, y:y0, width: this.width, height: this.height};
        this.front.attr(attr);
        this.back.attr(attr);
    }
    
}
ROT = new class {
    constructor(){
        this.start=0; //was sAngle
        this.clickA=null;
        this.angle=0;
    }
    dragging() {
        return (this.clickA!==null);
    }
    set(angle) {
        if(angle<0) {angle=0;}
        if(angle>90) {angle=90;}
        this.angle = angle;
    }
    M() {
        let M = Raphael.matrix(1,0,0,1,0,0);
        M.rotate(this.angle,pivot.x,pivot.y);
        return M;
    }
    transform(widget) {
        widget.transform(this.M().toTransformString());
    }
    Ang(x,y){
        //problem: screen coordinates
        return Raphael.deg(Math.atan2(y-offset.top-pivot.y,x-offset.left-pivot.x));
    }
    click(x,y) {
        this.clickA = this.Ang(x,y);
        this.start = this.angle;
    }
}
class _pivot {
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
class _com {
    constructor(x,y) {
        //x and y are percentages of the total block
        this.x = x;
        this.y = y;
        this.color = "#8af";
        this.dot = paper.circle(pivot.x-block.width*x, pivot.y-block.height*y,5,5);
        this.dot.attr("fill",this.color);
        this.Garrow = paper.path().attr({"stroke-width":5,stroke:this.color,fill:this.color});
        this.Gtxt = paper.text(0,0,"mg").attr({"font-size":24,fill:this.color});
        this.move = this.move.bind(this);
        this.start = this.start.bind(this);
        this.up = this.up.bind(this);
        this.dot.drag(this.move, this.start, this.up);
        
    }
    start(){
        this.ox=this.dot.attr("cx");
        this.oy=this.dot.attr("cy");
        this.dot.attr({fill:"white"});
    };
    move(dx,dy) {
        let a=Raphael.rad(ROT.angle);
        let nx = this.ox+dx;
        let ny = this.oy+dy;
        let IM = ROT.M().invert();
        let Nx = IM.x(nx,ny);
        let Ny = IM.y(nx,ny);
        this.x=-(Nx-pivot.x)/block.width;
        this.y=-(Ny-pivot.y)/block.height;
        DrawGravity();
    };
    up(){
        this.dot.attr({fill: this.color});
    };



    pos(angle) {
        let a=Raphael.rad(angle);
        let dx=(block.width*this.x)*Math.cos(a)-(block.height*this.y)*Math.sin(a);
        let dy=+(block.width*this.x)*Math.sin(a)+(block.height*this.y)*Math.cos(a);
        let x = pivot.x - dx;
        let y = pivot.y - dy;
        return {x:x, y:y};
    }
    resize(angle=0) {
        let x = this.pos(angle).x;
        let y = this.pos(angle).y;
        let a = Raphael.rad(angle);
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
function DrawGravity() {
    com.resize(ROT.angle);
    normal.position(ROT.angle);
}

class _sizer {
    constructor() {
        this.passiveColor = "gray";
        this.activeColor = "white";
        this.widget = paper.rect(0,0,0,0).attr({fill:this.passiveColor});
        this.reset();
        this.move = this.move.bind(this);
        this.start = this.start.bind(this);
        this.up = this.up.bind(this);
        this.widget.drag(this.move,this.start,this.up);
    }
    reset(angle=0) {
        let size = Math.min(block.width,block.height)*0.2;
        this.widget.attr({x:pivot.x-block.width,
                          y:pivot.y-block.height,
                          width: size,
                          height: size});
        ROT.transform(this.widget);
    }
    move(dx,dy){
        let a=Raphael.rad(ROT.angle);
        let Dx=dx*Math.cos(a)+dy*Math.sin(a);
        let Dy=dy*Math.cos(a)-dx*Math.sin(a);
        let nx = this.ox + Dx;
        let ny = this.oy + Dy;
        let nw = pivot.x - nx;
        let nh = pivot.y - ny;
        if (nw>=5 && nh>=5) {
	    this.widget.attr({x:nx, y:ny});
	    block.width = nw;
	    block.height = nh;
	    Resize();
	    DrawRectangle();
        }
    }
    start(){
        this.ox=this.widget.attr("x");
        this.oy=this.widget.attr("y");
        this.widget.attr({fill:this.activeColor});
    };
    up() {
        this.widget.attr({fill:this.passiveColor});
        Resize();
        DrawRectangle();
    }
}

class _normal {
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
    buttons = new _buttons();
    W=$("#canvas")[0].getBoundingClientRect().width;
    pivot = new _pivot();
    offset=$("#canvas").offset();
    normal = new _normal(pivot.x,pivot.y);
    block = new _block();
    com = new _com(0.5,0.5);
    block.toFront();
    Sizer = new _sizer();
    DrawGravity();
    new Help($("#help"),"toggle");

}
function DrawRectangle(){
    
    block.rotate(ROT.angle);
    com.resize(ROT.angle);
    Sizer.reset(ROT.angle);
    DrawGravity();
}
function Turn(x,y){
    //Need to allow mousemove over entire page, not just the block!
    //Solution: an underlying object on top of the paper, the size of the paper
    //consider drag instead!
    //also, instead of X, how about calculate the d-theta with respect to the pivot
    if(ROT.clickA!=null){
	let newangle=ROT.start + ROT.Ang(x,y) - ROT.clickA;
        ROT.set(newangle);
	DrawRectangle();
    }
}
function Jump(newangle){
    console.debug("Jump");
    ROT.set(newangle);
    DrawRectangle();
    if(newangle==0) {
        Done(0,10);
    } else {
        Done(1,10);
    }
}
function Fall(omega,alpha) {
    let dt=0.05;
    alpha=5*Math.sin(Raphael.rad(ROT.angle));
    let x = -block.width*com.x*Math.cos(Raphael.rad(ROT.angle))
        +block.height*com.y*Math.sin(Raphael.rad(ROT.angle));
    if(Math.abs(x)<0.5) {
        //balancing on one end
        omega=0;
        DrawRectangle();
        return;
    }
    if(x<0){
	if(ROT.angle<=0){
            Done(0,omega);
            thump.play();
	    Bounce(1,0);
	    return;
        } //possible jolt first
	ROT.set(ROT.angle+omega*dt);
	omega=omega-alpha*dt;
	DrawRectangle();
    }
    if(x>0){
	if(ROT.angle>=90){
            Done(1,omega);
            return;
        }
	ROT.set(ROT.angle+omega*dt);
	omega=omega+alpha*dt;
	DrawRectangle();
    }
    
    if(!ROT.dragging()){setTimeout((o=omega,a=alpha)=>Fall(o,a),10);}
}

function Done(side=0,omega){
    thump.volume = Math.pow(Math.min(1,Math.abs(omega)/20),2);
    thump.play();
    Bounce(1,side);
}
function Bounce(off,side){
    if(!ROT.dragging()){return;}
    if(side==1){
	ROT.set(90-(off%2)*2);
    } else {
	ROT.set((off%2)*2);
    }
    DrawRectangle(ROT.angle);
    if(off>0){
	setTimeout((o=off,s=side)=>{Bounce(o-1,s);},50);
    }
}
function Resize() {
    block.resize();
    com.resize();
}

$(init);
