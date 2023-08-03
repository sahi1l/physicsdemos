let paper, left,right,kegraph,Bstart,Bstop,Breset;
let KEbefore, KEafter;
let mmax = 10;
let vmax = 10;
let leftcolor = "red";
let rightcolor = "blue";
let collideflag=false;
let W=800, H=300;
let coords = new function() {
    //BLOCKS
    this.block = {};
    this.block.font = 30;
    this.block.y = H/8;
    this.block.left = W/2 - W/4; //initial position of left block
    this.block.right = W/2; //initial position of right block
    this.block.width = 80;
    this.block.height = this.block.width/2;
    this.block.arrowmul = 10; //how much larger should the arrow be compared to its value?
    this.ke = {};
    this.ke.font = 18;
    this.ke.left = this.ke.font*6; //enough room to fit "Before"
    this.ke.right = W - 30; //30 is some padding
    this.ke.maxwidth = this.ke.right - this.ke.left;
    this.ke.thickness = 30;
    this.ke.midY = H - 2*this.ke.thickness; //the midpoint between the two bars
    
}
let elastic=true; //IDEA: make this a toggle button between elastic and maximally inelastic
class Animate {
    constructor() {
        this.dt = 0.1;
        this.vscale=1;
        this.timeout=10;
        this.moving=[];
        this.step = this.step.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }
    step() {
        if(!collideflag && collisionQ()){
            collideflag=true;
            collide();
        }
        this.moving.forEach(function(a){a.step(); if(a.x<0){this.stop();}});
    };
    start() {
        this.stop();
        this.handle=setInterval(this.step,this.timeout);
    };
    stop() {
        clearInterval(this.handle);
    };
}
let animate = new Animate();
function collisionQ(){
    return (left.collideX()>right.collideX());
}
function lightup(task){
    $("#"+task).addClass("done");
}
function collide(){
    var bL=Math.sign(left.v);
    var bR=Math.sign(right.v);
    if(elastic){
        var vL=(left.v*(left.m-right.m)+2*right.m*right.v)/(left.m+right.m);
        var vR=(right.v*(right.m-left.m)+2*left.m*left.v)/(left.m+right.m);
        left.setvel(vL,true); right.setvel(vR,true);
    } else {
        var v=(left.m*left.v+right.m*right.v)/(left.m+right.m);
        left.setvel(v,true); right.setvel(v,true);
    }
    var aL=Math.sign(left.v);
    var aR=Math.sign(right.v);
    if(bR==0 && aL==0 && bL!=0){lightup("task1");}
    if(bR*bL<0 && aL*aR>0){lightup("task2");}
    if(bR*bL<0 && aL*aR<0){lightup("task3");}
    if(bL*bR>0 && aL*aR<0){lightup("task4");}
}
var DragValue=function(min,max,y,val,color,done){
    var fontsize=coords.block.font;
    this.obj=paper.text(0,y,"x").attr({"font-size":fontsize,fill:color});
    this.overlay=paper.rect(-fontsize*2,y-fontsize/2,fontsize*4,fontsize).attr({
        stroke:"",fill:leftcolor,opacity:0.});
    this.done=done;
    this.val=val;
    this.update=function(v,external=false){
        if(v!=undefined){this.val=v;}
        if(!external && this.val<min){this.val=min;}
        if(!external && this.val>max){this.val=max;}
        var display=Math.abs(this.val).toPrecision(2).replace(/\.0$/,"");
        this.obj.attr("text",display);
        this.done(this.val);
        KEUpdate();
    };
    function dragstart(x,y){
        this.oval=this.val;
    }
    function drag(dx,dy){
        this.update(Math.floor(this.oval+0.1*dx));
    }
    this.overlay.drag(drag,dragstart,null,this);
}
let Block = function(x0,y0,side,color) {
    let fontsize = coords.block.font;
    this.m=1;
    this.v=1;
    let W = coords.block.width;
    let size = W;
    let H = coords.block.height;
    this.collideX=function(){
        return this.x + W/2 * side;
    };
    var labelshift=0.5*size + 0.5*fontsize + 6;
    var arrowshift=0.5*size;
    this.setarrow=function(len){
        if(len==0){
            this.arrow.hide();
        } else {
            let l=Math.sign(len)*Math.min(1,(0.5+(Math.sqrt(Math.abs(len))))*size/4);
            let L=len+Math.sign(len)*coords.block.arrowmul;
            let path = `M ${-L} , ${arrowshift}
                        l ${2*L} , 0`; // Raphael.format("M{0},{1}l{2},0",-L,arrowshift,2*L);
            this.arrow.attr("path",path).show();
        }
        this.v=len;
    };
    this.reset=function(){this.move(x0);};
    this.move=function(pos){
        this.x=pos;
        this.obj.transform("");
        this.obj.translate(this.x,y0);
    };
    this.step=function(){
        this.move(this.x+this.v*animate.dt*animate.vscale);
    };
    this.setmass=function(val){
        this.m=parseInt(val);
        this.massW.update(this.m);
    };
    this.setvel=function(val,external){
        this.v=val;
        if(external){this.velW.update(this.v,true);}
        this.setarrow(val);
    };
    this.ke = function() {
        return this.m * this.v * this.v / 2.0;
    };
    paper.setStart();
    this.arrow=paper.path("M10,10l50,50").attr({"arrow-end":"normal","stroke-width":5});
    this.setarrow(10);
    this.block=paper.rect(-W/2,-H/2,W,H).attr({fill:color});
    this.massW=new DragValue(1,10,0,10,"white",$.proxy(function(v){this.m=v;},this));
    this.velW=new DragValue(-10,10,labelshift,5,"black",$.proxy(this.setvel,this));
    this.obj=paper.setFinish();
    this.move(x0);
};

class KEBar {
    constructor(label,y) {
        this.label = label;
        this.x0 = coords.ke.left;
        this.y = y;
        this.maxwidth = coords.ke.maxwidth;
        this.colwidth = coords.ke.thickness;
        this.fsize = coords.ke.font; 
        this.maxKE = mmax * vmax * vmax; //max mass * max velocity^2
        this.leftbar = paper.rect(this.x0, this.y - this.colwidth/2, this.maxwidth, this.colwidth)
            .attr({fill:leftcolor});
        this.rightbar = paper.rect(this.x0, this.y - this.colwidth/2, this.maxwidth, this.colwidth)
            .attr({fill:rightcolor});
        this.text = paper.text(this.x0-this.fsize, this.y, `${this.label}: `)
            .attr({"text-anchor":"end","font-size":this.fsize});
        let textY = this.y - this.colwidth/2 - 0.8*this.fsize;
        let txtattr = {"text-align":"middle","font-size":this.fsize};
        this.Ltext = paper.text(0, textY, "_").attr({...txtattr,fill:leftcolor});
        this.plus = paper.text(0, textY, "+").attr(txtattr);
        this.Rtext = paper.text(0,textY,"_").attr({...txtattr, fill:rightcolor});
        this.update(0,0);
    }
    update(Lval,Rval) {
        let Lwidth = Lval*this.maxwidth/this.maxKE;
        let Rwidth = Rval*this.maxwidth/this.maxKE;
        this.leftbar.attr({width:Lwidth});
        this.rightbar.attr({width:Rwidth, x: this.x0 + Lwidth});
        let Lx = this.x0 + Lwidth/2;
        let Px = this.x0 + Lwidth;
        let Rx = this.x0 + Lwidth + Rwidth/2;
        if (Px-Lx < this.fsize*1.5) {Lx = Px - this.fsize*1.5;}
        if (Rx-Px < this.fsize*1.5) {Rx = Px + this.fsize*1.5;}
        toggle(this.Ltext.attr({x:Lx, text:Lval.toFixed(1)}),Lval>0);
        toggle(this.plus.attr({x: Px}),Lval>0 && Rval>0);
        toggle(this.Rtext.attr({x:Rx, text:Rval.toFixed(1)}),Rval>0);
        
    }
}
function toggle(element,test) {
    if(test) {element.show();} else {element.hide();}
}
function KEUpdate() {
    if (collideflag) {
        KEafter.update(left.ke(),right.ke());
    } else {
        KEbefore.update(left.ke(),right.ke());
    }
}
/*
let KEGraph=function(){
    let xleft = coords.ke.left; 
    let xright = this.ke.right; 
    let colwidth = this.ke.thickness;
    var middle = this.ke.midY; 
    var beforeY = middle - colwidth; //the row for the "before" bar
    var afterY = middle + colwidth; //the row for the "after" bar
    var maxwidth=xright-xleft;
    var maxKE=1000.0; //
    this.beforeL=paper.rect(xleft,beforeY-colwidth/2,maxwidth,colwidth)
        .attr({fill:"red"});
    this.beforeR=paper.rect(xleft,beforeY-colwidth/2,maxwidth,colwidth)
        .attr({fill:"blue"});
    this.afterL=paper.rect(xleft,afterY-colwidth/2,maxwidth,colwidth)
        .attr({fill:"red"}).hide();
    this.afterR=paper.rect(xleft,afterY-colwidth/2,maxwidth,colwidth)
        .attr({fill:"blue"}).hide();
    this.beforeT=paper.text(xleft,beforeY-30,"KE Before").attr({"text-anchor":"start","font-size":18});
    this.afterT=paper.text(xleft,afterY-30,"KE After").attr({"text-anchor":"start","font-size":18});
    this.update=function(){
        var L=(0.5*left.m*left.v*left.v);
        var R=0.5*right.m*right.v*right.v;
        var LH=L*maxwidth/maxKE;
        var RH=R*maxwidth/maxKE;
        if(collideflag){
            this.afterL.attr({width:LH}).show();
            this.afterR.attr({x:xleft+LH,width:RH}).show();
        } else {
            this.beforeL.attr({width:LH});
            this.beforeR.attr({x:xleft+LH,width:RH});
        }
    };
    this.update();
    }
*/
function reset(){
    collideflag=false;
    animate.stop();
    left.reset();
    right.reset();
    left.setvel(Math.min(vmax,Math.abs(left.v.toFixed(0))),true);
    right.setvel(-Math.min(vmax,Math.abs(right.v.toFixed(0))),true);
    KEafter.update(0,0);
    KEUpdate();
    
}
function littlepics() {
    let block = "&#9632;";
    let larr = "&larr;";
    let rarr = "&rarr;";
    $("span[data-blocks]").each((i,w) => {
        let $w = $(w);
        let vals = $w.attr("data-blocks");
        let alt="";
        if (vals=="++" || vals=="--") {alt="same direction";}
        else if (vals=="+-") {alt="towards each other";}
        else if (vals=="-+") {alt="away from each other";}
        else if (vals=="+0") {alt="right block is stationary";}
        else if (vals=="0+") {alt="left block is stationary";}
        $w.attr("title",alt);
        for (let i in vals) {
            let v = vals[i];
            let color = [leftcolor,rightcolor][i];
            let symbol = "";
            if(v=="+") {symbol = block + rarr;}
            if(v=="-") {symbol = larr + block;}
            if(v=="0") {symbol = block;}
            
            $w.append($("<span>").html(symbol).css({color:color}));
        }
    });
}
function init() {
    paper=Raphael("canvas","100%","100%");
    paper.setViewBox(0,0,W,H);
    let blockY = coords.block.y;
    let blocksep = coords.block.sep;
    let barthickness = coords.ke.thickness;
    let barY = coords.ke.midY;
    left =  new Block(coords.block.left, blockY,  1, leftcolor);
    right = new Block(coords.block.right, blockY, -1, rightcolor);
    let title = paper.text( coords.ke.left,
                coords.ke.midY - 3*coords.ke.thickness,
                "Kinetic Energy")
        .attr({"font-size":coords.ke.font,"text-align":"center"});
    let bb = title.getBBox();
    paper.path("M"+bb.x+" "+(bb.y+bb.height)+"L"+(bb.x+bb.width)+" "+(bb.y+bb.height));
    KEbefore = new KEBar("Before", barY - barthickness, barthickness);
    KEafter  = new KEBar("After",  barY + barthickness, barthickness);
    left.setmass(10);
    left.setvel(4,true);
    right.setmass(5);
    right.setvel(0,true);
    KEUpdate();
    animate.moving=[left,right];
    $("#start").click($.proxy(animate.start,animate));
    $("#stop").click($.proxy(animate.stop,animate));
    $("#reset").click(reset);
    littlepics();
}

$(init);
/*I need to add a meter showing the kinetic energy in both: maybe a stacked bar graph*/
