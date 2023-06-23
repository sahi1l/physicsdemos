var dt=0.1;
var vscale=1;
var timeout=10;
var elastic=true; 
var animate=new function(){
    that=this;
    this.moving=[];
    this.step=function(){
        if(!collideflag && collisionQ()){
            collideflag=true;
            collide();
        }
        this.moving.forEach(function(a){a.step(); if(a.x<0){animate.stop();}});
    }
    this.start=function(){
        this.stop();
        that.handle=setInterval($.proxy(this.step,this),timeout);
    }
    this.stop=function(){
        clearInterval(this.handle);
    }
}
function collisionQ(){
    return (left.collideX()>right.collideX());
}
var collideflag=false;
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
var DragValue=function(min,max,y,val,done){
    var fontsize=30;
    this.obj=paper.text(0,y,"x").attr("font-size",fontsize);
    this.overlay=paper.rect(-fontsize*2,y-fontsize/2,fontsize*4,fontsize).attr({
        stroke:"",fill:"red",opacity:0.});
    this.done=done;
    this.val=val;
    this.update=function(v){
        if(v!=undefined){this.val=v;}
        if(this.val<min){this.val=min;}
        if(this.val>max){this.val=max;}
        var display=Math.abs(this.val).toPrecision(2).replace(/\.0$/,"");
        this.obj.attr("text",display);
        this.done(this.val);
        kegraph.update();
    }
    function bleh(){
    }
    function dragstart(x,y){
        this.oval=this.val;
    }
    function drag(dx,dy){
        this.update(Math.floor(this.oval+0.1*dx));
    }
    this.overlay.drag(drag,dragstart,bleh,this);
//    return this.obj;
}
var Block = function(x0,y0,side,color) {
    var fontsize=30;
    this.m=1;
    this.v=1;
    var size=80;
    var W=size;
    var H=size/2;
    this.collideX=function(){
        return this.x+W/2*side;
    }
    var labelshift=0.5*size+0.5*fontsize+6;
    var arrowshift=0.5*size;
    this.setarrow=function(len){
//        console.log(len);
        if(len==0){
            this.arrow.hide();
        } else {
            var l=Math.sign(len)*Math.min(1,(0.5+(Math.sqrt(Math.abs(len))))*size/4);
            L=len+Math.sign(len)*10;
            var path=Raphael.format("M{0},{1}l{2},0",-L,arrowshift,2*L);
            this.arrow.attr("path",path).show();
        }
        this.v=len;
    }
    this.reset=function(){this.move(x0);}
    this.move=function(pos){
        this.x=pos;
        this.obj.transform("");
        this.obj.translate(this.x,y0);
    }
    this.step=function(){
        this.move(this.x+this.v*dt*vscale);
    }
    this.setmass=function(val){
        this.m=parseInt(val);
        this.massW.update(this.m);
        console.log("hi");
    }
    this.setvel=function(val,external){
        this.v=val;
//        var display=Math.abs(val).toPrecision(2).replace(/\.0$/,"")
        if(external){this.velW.update(this.v);}
//        this.vel.attr("text",display);
        this.setarrow(val);
    }
    paper.setStart();
    this.arrow=paper.path("M10,10l50,50").attr({"arrow-end":"normal","stroke-width":5});
    this.setarrow(10);
    this.block=paper.rect(-W/2,-H/2,W,H).attr({fill:color});
    this.massW=new DragValue(1,10,0,10,$.proxy(function(v){this.m=v;},this));
    //    this.mass=paper.text(0,0,"m").attr({"font-size":fontsize,"text-anchor":"middle"});
    this.velW=new DragValue(-10,10,labelshift,5,$.proxy(this.setvel,this));
//    this.vel=paper.text(0,labelshift,"v").attr({"font-size":fontsize});
    this.obj=paper.setFinish();
    this.move(x0);
};

KEGraph=function(){
    var xleft=80;
    var xright=W-30;
    colwidth=30;
    var middle=H-2*colwidth;
    var beforeY=middle-colwidth;
    var afterY=middle+colwidth;
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
//            console.log(L,LH);
        if(collideflag){
            this.afterL.attr({width:LH}).show();
            this.afterR.attr({x:xleft+LH,width:RH}).show();
        } else {
            this.beforeL.attr({width:LH});
            this.beforeR.attr({x:xleft+LH,width:RH});
        }
    }
    this.update();
}
reset=function(){
    collideflag=false;
    animate.stop();
    left.reset();
    right.reset();
    left.setvel(Math.abs(left.v));
    right.setvel(-Math.abs(right.v));
    
}
Button=function(x,y,text,command){
    var width=40;
    var height=20;
    paper.setStart();
    paper.rect(x-width/2,y-height/2,width,height).attr({fill:"#ddd"});
    paper.text(x,y,text).attr({"text-anchor":"middle"});
    this.obj=paper.setFinish();
    this.obj.click(command);
}
var paper, left,right,kegraph,Bstart,Bstop,Breset;
var W=900, H=300;
init=function(){
    paper=Raphael("canvas",W,H);
    left=new Block(3*W/8,H/8,1,"#f88");
    right=new Block(5*W/8,H/8,-1,"#88f");
    kegraph=new KEGraph();
    left.setmass(10);
    left.setvel(4,true);
    right.setmass(5);
    right.setvel(0,true);
    animate.moving=[left,right];
    $("#start").click($.proxy(animate.start,animate));
    $("#stop").click($.proxy(animate.stop,animate));
    $("#reset").click(reset);
    
    //    Bstart=new Button(30,H-120,"Start",function(){animate.start();});
//    Bstop=new Button(30,H-90,"Stop",function(){animate.stop();});
//    Breset=new Button(30,H-60,"Reset",reset);
}

$(init);
/*I need to add a meter showing the kinetic energy in both: maybe a stacked bar graph*/
