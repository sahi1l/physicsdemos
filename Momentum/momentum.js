/*global Raphael,$*/
function constrain(x,min,max){
    return Math.min(max, Math.max(min,x));
}
function linmap(x,in_min,in_max,out_min,out_max){
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
//====================================================================================================
let paper;
let source,target,shooter,score;
const H=300;
const W=600; //height and width
const radius=30;
const dt=0.1;
const timeout=10;
const xmin=200;
const xmax=W-radius-10;
const mainY=H/2; //the vertical line that the balls move along
let vscale=1;
let collideflag=false;

let animate=new function(){
    this.moving=[];
    this.step=function(){
        if(!collideflag && collisionQ()){
            collideflag=true;
            collide();
        }
        this.moving.forEach(
            (a)=>{
                a.step();
                if(a.x<xmin){animate.stop();}}
        );
    };
    this.start=function(){
        this.stop();
        this.handle=setInterval($.proxy(this.step,this),timeout);
    };
    this.stop=function(){
        console.log("Stopped animation");
        clearInterval(this.handle);
    };
};
//============================================================
function collisionQ(){
    return (target.x-source.x)<2.1*radius;
}
function collide(){
    console.log("collide");
    let ptot = source.mom() + target.mom();
    let v=(ptot)/parseFloat(source.m+target.m);
    source.setvel(v);
    target.setvel(v);
    if (ptot==0) {
        score.win();
    } else {
        score.lose();
    }
//    if(source.mom == 0){
//        score.win();
//    } else {
//        score.lose();
//    }
    collideflag=true;
    shooter.again.show();
}
//============================================================
let Ball=function(start,color){
    let fontsize=30;
    let Ay=1.5*radius; //y of arrow
    let Vy=1*radius+fontsize+4; //y of velocity label
    this.color=color;
    this.m=0;
    this.v=0;
    this.setarrow=function(len){
        let L=Math.sign(len)*Math.min(1,(0.5+(Math.sqrt(Math.abs(len))))*radius/4);
        L=len+Math.sign(len)*10;
        let path=Raphael.format("M{0},{1}l{2},0",-L,Ay,2*L);
        this.arrow.attr("path",path);
    };
    this.reset=function(){
        this.move(start);
    };
    this.move=function(pos){
        this.x=pos;
        this.obj.transform("");
        this.obj.translate(this.x,mainY);
    };
    this.step=function(){
        this.move(this.x+this.v*dt*vscale);
    };
    this.mom = function() {
        return this.m * this.v;
    };
    this.setmass=function(val){
        this.mass.attr("text",val);
        this.m=parseInt(val);
    };
    this.setvel=function(val){
        this.v=val;
        let display=Math.abs(val).toPrecision(2).replace(/\.0$/,"");
        this.vel.attr("text",display);
        this.setarrow(val);
    };

    paper.setStart();
    this.arrow=paper.path("M10,10")
        .attr({"arrow-end":"normal","stroke-width":5});
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
    animate.moving=[];
    chooseProblem(source,target);
    shooter.v2x(1);
    source.reset();
    target.reset();
}
//============================================================
let Score=function(){
    this.won=0; this.total=0;
    this.obj=paper.text(10,mainY-100,"")
        .attr({"stroke":"black",
               "stroke-width":1,
               fill:"yellow",
               "text-anchor":"start",
               "font-size":36
             });
    this.display=function(){
        this.obj.attr("text",
                      `Correct: ${this.won}\nTries: ${this.total}`);
    };
    this.display();
    this.win=function(){
        this.won++; this.total++; this.display();
    };
    this.lose=function(){
        this.total++; this.display();
    };
};
//============================================================
class Button {
    constructor(paper, color, label,smin,smax,y) {
        let left = smin;
        let width = smax-smin;
        let fontsize = 24;
        let height = 2*fontsize + 4;
        paper.setStart();
        paper.rect(left,
                   y,
                   smax-smin,
                   height
                  ).attr({fill:color,cursor:"pointer"});
        paper.text(left + width/2,
                   y + height/2,
                   label
                  ).attr({fill:"white","font-size":fontsize,cursor:"pointer"});
        this.button = paper.setFinish();
        
    }
    hide() {this.button.hide();}
    show() {this.button.show();}
}
//============================================================
let Shooter=function(){
    let thumbH=50;
    let thumbW=20;
    let smin=20;
    let smax=xmin - radius - thumbW/2;
    let grooveH=4;
    let vmax=20;
    let fontsize=24;
    let pad=4;
    let y=mainY;

    this.v=1;
    this.x=0;
    this.groove=paper.rect(smin,mainY-grooveH/2,smax-smin,grooveH)
        .attr({fill:"grey"});
    this.thumb=paper.rect(0,y-thumbH/2, thumbW, thumbH)
        .attr({fill:"red"});
    paper.setStart();
    paper.text(smin,mainY-thumbH-10,"Drag to change speed.")
        .attr({"text-anchor":"start","font-size":16});
    paper.path(Raphael.format("M{0},{1}L{2},{3}",smax-20,mainY-thumbH,smax-8,mainY-thumbH+15))
        .attr({"arrow-end":"classic","stroke-width":3});
    this.help=paper.setFinish();

    this.launch = new Button(paper, "red", "Launch", smin, smax, mainY + 60);
    this.launch.button.click(function(){
        animate.moving=[target,source];
        shooter.launch.hide();
        shooter.thumb.hide();
        shooter.help.hide();
    });
    this.again = new Button(paper, "blue", "Again", smin, smax, mainY + 60);
    this.again.button.hide();
    this.again.button.click(again);
    this.groove.drag(
        function(dx,dy,x,y){shooter.x2v(x-thumbW/2); shooter.updatethumb();},
        function(x,y){shooter.x2v(x-thumbW/2); shooter.updatethumb();},
        undefined);
        
    this.dragstart=function(x,y){
        shooter.help.animate({opacity:0},200);
        shooter.x2v(getMouseX(x));
    };
    this.dragmove=function(dx,dy,nx,ny){
        shooter.x2v(getMouseX(nx));
        this.updatethumb();
    };
    this.dragend=function(){};
    this.thumb.drag(this.dragmove,this.dragstart,this.dragend,this,this,this);

    this.updatethumb=function(){
        this.thumb.attr({x:this.x-thumbW/2});
        source.setvel(this.v);
    };
    this.v2x=function(v){
        this.v=Math.round(constrain(v,1,vmax));
//        let bRect = this.groove.node.getBoundingClientRect();
//        let smin = bRect.left;
//        let smax = bRect.right;
        this.x=linmap(this.v, 1,vmax, smax,smin);
        this.updatethumb();
    };
    this.x2v=function(x){
        this.x=constrain(x,smin,smax);
        this.v=Math.round(linmap(this.x, smax, smin, 1, vmax));
        this.updatethumb();
    };

    this.v2x(1);
    this.updatethumb();
    
};
//============================================================
function chooseProblem(src,tgt){
    function f(x,y,z){
        return Math.pow(2,x) * Math.pow(3,y) * Math.pow(5,z);
    };
    function randint(max){
        return Math.floor(Math.random()*(max+1));
    };
        let a,b,c,z;
    do {
        a=randint(3);
        b=randint(2);
        c=randint(2);
        z=(a==0) + (b==0) + (c==0);
    } while (a+b+c<3 || z>1);
    let N=f(a,b,c);
    let m,n=f(randint(a), randint(b), randint(c));
    do {
        m=f(randint(a), randint(b), randint(c));
    } while (Math.max(m,N/m)==Math.max(n,N/n) || Math.min(m,N/m)>20);
    src.setmass(Math.max(m,N/m));
    src.setvel(1);
    tgt.setmass(Math.max(n,N/n));
    tgt.setvel(-Math.min(n,N/n));
    vscale = Math.max(1,5/Math.min(n,N/n));
}

function getMouseX(val){
    let bRect = $("#canvas")[0].getBoundingClientRect();
    let px2pt = bRect.width/W;
    return val/px2pt;
}
function init(){
    paper=Raphael("canvas","100%","100%");
    paper.setViewBox(0,0,W,H);
    source=new Ball(xmin,"red");
    target=new Ball(xmax,"lightblue");
    shooter=new Shooter();
    score=new Score();
    chooseProblem(source,target);
    animate.moving=[];
    animate.start();
}
$(init);
