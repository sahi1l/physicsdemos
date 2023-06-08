function constrain(x,min,max){
    return Math.min(max, Math.max(min,x));
}
function linmap(x,in_min,in_max,out_min,out_max){
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
//====================================================================================================
var H=300, W=900; //height and width
var radius=30;
var vscale=1;
var dt=0.1; var timeout=10;
var xmin=200, xmax=W-radius-10;
var mainY=H/2; //where the action takes place, mostly

animate=new function(){
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
        this.handle=setInterval($.proxy(this.step,this),timeout);
    }
    this.stop=function(){
        console.log("Stopped animation");
        clearInterval(this.handle);
    }
}
function collisionQ(){
    return (target.x-source.x)<2.1*radius;
}
var collideflag=false;
function collide(){
    console.log("collide");
    var v=(source.m*source.v+target.m*target.v)/parseFloat(source.m+target.m);
    source.setvel(v);
    target.setvel(v);
    if(source.m*source.v+target.m*target.v==0){
        score.win();
    } else {
        score.lose();
    }
    collideflag=true;
    shooter.again.show();
//    animate.moving=[source,target];
//    animate.start();
}
//============================================================
var Ball=function(start,color){
    var fontsize=30;
    var Ay=1.5*radius; //y of arrow
    var Vy=1*radius+fontsize+4; //y of velocity label
    this.color=color;
    this.m=0;
    this.v=0;
    this.setarrow=function(len){
        var L=Math.sign(len)*Math.min(1,(0.5+(Math.sqrt(Math.abs(len))))*radius/4);
        L=len+Math.sign(len)*10;
        var path=Raphael.format("M{0},{1}l{2},0",-L,Ay,2*L);
        this.arrow.attr("path",path);
    }
    this.reset=function(){
        this.move(start);
    }
    this.move=function(pos){
        this.x=pos;
        //        this.x=Math.min(xmax,Math.max(xmin,pos));
        this.obj.transform("");
        this.obj.translate(this.x,mainY);
    }
    this.step=function(){
        this.move(this.x+this.v*dt*vscale);
    }
    this.setmass=function(val){
        this.mass.attr("text",val);
        this.m=parseInt(val);
    }
    this.setvel=function(val){
        this.v=val;
        var display=Math.abs(val).toPrecision(2).replace(/\.0$/,"")
        this.vel.attr("text",display);
        this.setarrow(val);
    }

    paper.setStart();
    this.arrow=paper.path("M10,10").attr({"arrow-end":"normal","stroke-width":5});
    this.setarrow(-10);
    this.ball=paper.circle(0,0,radius).attr({fill:this.color});
    this.mass=paper.text(0,0,"m").attr({"font-size":fontsize});
    this.vel=paper.text(0,Vy,"v").attr({"font-size":fontsize});
    this.obj=paper.setFinish();
    this.move(start);
};
function again(){
    shooter.launch.show();
    shooter.thumb.show();
    shooter.again.hide();
    collideflag=false;
//    animate.stop();
    animate.moving=[];
    chooseProblem(source,target);
    shooter.v2x(1);
    source.reset();
    target.reset();
}
//============================================================
var Score=function(){
    this.won=0; this.total=0;
    this.obj=paper.text(10,mainY-100,"0 out of 0").attr({"stroke":"black","stroke-width":1,fill:"yellow","text-anchor":"start","font-size":36});
    this.display=function(){
        this.obj.attr("text",this.won+" out of "+this.total);
    }
    this.win=function(){
        this.won++; this.total++; this.display();
    }
    this.lose=function(){
        this.total++; this.display();
    }
}
//============================================================
var Shooter=function(){
    var thumbH=30, thumbW=10;
    var smin=10, smax=xmin-radius-thumbW/2;
    var grooveH=4;
    var vmax=20;
    var fontsize=24; var pad=4;
    var y=mainY;
    this.v=1;
    this.x=0;
    this.groove=paper.rect(smin,mainY-grooveH/2,smax-smin,grooveH).attr({fill:"grey"});
    this.thumb=paper.rect(0,y-thumbH/2, thumbW, thumbH).attr({fill:"red"});
    paper.setStart();
    paper.text(smin,mainY-thumbH-10,"Drag to change speed.").attr({"text-anchor":"start","font-size":16});
    paper.path(Raphael.format("M{0},{1}L{2},{3}",smax-20,mainY-thumbH,smax-8,mainY-thumbH+15))
        .attr({"arrow-end":"classic","stroke-width":3});
    this.help=paper.setFinish();
    paper.setStart();
    paper.rect(smin,y+thumbH-pad/2,smax-smin,fontsize+pad).attr({fill:"red"});
    paper.text(smin+(smax-smin)*0.5,y+thumbH+fontsize*0.5,"Launch").attr({fill:"white","font-size":fontsize});
    this.launch=paper.setFinish();
    this.launch.click(function(){
        animate.moving=[target,source];
        shooter.launch.hide();
        shooter.thumb.hide();
    });
    paper.setStart();
    paper.rect(smin,y+thumbH-pad/2,smax-smin,fontsize+pad).attr({fill:"blue"});
    paper.text(smin+(smax-smin)*0.5,y+thumbH+fontsize*0.5,"Again").attr({fill:"white","font-size":fontsize});
    this.again=paper.setFinish();
    this.again.hide();
    this.again.click(again);
    this.groove.drag(
        function(dx,dy,x,y){shooter.x2v(x-thumbW/2); shooter.updatethumb();},
        function(x,y){shooter.x2v(x-thumbW/2); shooter.updatethumb();},
        undefined);
        
    this.dragstart=function(x,y){shooter.help.animate({opacity:0},200);}
    this.dragmove=function(dx,dy,nx,ny){
        shooter.x2v(nx);
        this.updatethumb();
    }
    this.dragend=function(){}
    this.thumb.drag(this.dragmove,this.dragstart,this.dragend,this,this,this);
    this.updatethumb=function(){
        this.thumb.attr({x:this.x-thumbW/2});
        source.setvel(this.v);
    }
    this.v2x=function(v){
        this.v=Math.round(constrain(v,1,vmax));
        this.x=linmap(this.v, 1,vmax, smax,smin);
        this.updatethumb();
    }
    this.x2v=function(x){
        this.x=constrain(x,smin,smax);
        this.v=Math.round(linmap(this.x, smax,smin, 1,vmax));
        this.updatethumb();
    }

    this.v2x(1);
    this.updatethumb();
    
}
//============================================================
function chooseProblem(src,tgt){
    function f(x,y,z){
        return Math.pow(2,x) * Math.pow(3,y) * Math.pow(5,z);
    };
    function randint(max){
        return Math.floor(Math.random()*(max+1));
    };
        var a,b,c,z;
    do {
        a=randint(3);
        b=randint(2);
        c=randint(2);
        z=(a==0) + (b==0) + (c==0);
    } while (a+b+c<3 || z>1);
    var N=f(a,b,c);
    var m,n=f(randint(a), randint(b), randint(c));
    do {
        m=f(randint(a), randint(b), randint(c));
    } while (Math.max(m,N/m)==Math.max(n,N/n) || Math.min(m,N/m)>20);
    src.setmass(Math.max(m,N/m));
    src.setvel(1);
    tgt.setmass(Math.max(n,N/n));
    tgt.setvel(-Math.min(n,N/n));
    vscale=Math.max(1,5/Math.min(n,N/n));
}

var paper;
var source,target,shooter,score;
function init(){
    paper=Raphael("canvas",W,H);
    source=new Ball(xmin,"red");
    target=new Ball(xmax,"lightblue");
    shooter=new Shooter();
    score=new Score();
    chooseProblem(source,target);
    animate.moving=[];
    animate.start();
}
$(init);
