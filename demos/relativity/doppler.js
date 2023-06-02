var W=500;
var H=300;
var c=50; //speed of light
var v=40; //speed of train
var L=400; //width of train
var Htrain=L/3; //height of train
var y0=H/2;
var radius=10; //size of light "ball"
var dt=0.1;
var t=0;
var paper;
var train,rear,front;

function movingClock(x0){
    this.object=paper.rect(x0-clockw/2,y0-clockh/2,clockw,clockh).attr({fill:"#ccf"});
    var that=this;
    that.x=x0;
    this.v=v; //FIX
    this.draw=function(){
            that.object.attr({x:that.x-clockw/2,y:that.y-clockh/2})
    }
    this.step=function(){
        that.x=that.x+that.v*dt;
        that.draw();
        return (that.x<W-clockw*2);
    }
    this.init=function(){
        that.x=x0;
        that.y=y0;
        that.draw()
    }
    this.init()
}
function Photons(v,target){
    this.v=v;
    this.objects=[];
    this.xs=[];
    this.N=0;
    var that=this;
    console.log(v,target);
    this.clear=function(){
        for(i=0;i<this.xs.length;i++){
            this.objects[i].remove();
        }
        this.xs=[];
        this.objects=[];
    }
    this.draw=function(){
        for(i=0;i<this.xs.length;i++){
            that.objects[i].attr({cx:that.xs[i]});
        }
    }
    this.add=function(x){
        that.objects.push(paper.circle(x,y0,5).attr({fill:"red"}));
        that.xs.push(x);
    }
    this.step=function(){
//    console.log("c=",that.v);
        for(i=that.xs.length-1;i>=0;i--){
            var x=that.xs[i];
            x=x+that.v*dt;
            if(x<0 || x>W){ //erase
                flash(target);
                that.objects[i].hide();
//                that.xs=that.xs.slice(0,-1);
//                that.objects[i].remove();
//                that.objects=that.objects.slice(0,-1);
            } else {
                var ox=that.xs[i];
                that.xs[i]=x;
//                console.log(that.xs[i],x,ox);
            }
        }
        that.draw();
    }
}
function step(){
    var flag=clock.step();
    if(t%5==0){
        toward.add(clock.x);
        away.add(clock.x);
    }
    t+=1;
    away.step();
    toward.step();
//    alice.attr({fill:""});
//    tom.attr({fill:""});
    return flag;
}
var handle;
function animate(){
    var flag=step();
    if(flag){handle=setTimeout(animate,100);}
}
function run(){
    stop();
    toward.clear();
    away.clear();
    t=0;
    clock.v=parseFloat($("#train").val())*c;
/*
    if($("#relativistic").prop("checked")){
        rear.v=-c;
        front.v=c;
    }
    else {
        trainframe=train.v/2;
        trainframe=c;
        rear.v=(-trainframe+train.v);///(1-(trainframe*train.v)/(c*c));
        front.v=trainframe+train.v;///(1+(trainframe*train.v)/(c*c));;
    }
    */
    animate();
}
function stop(){
    clearTimeout(handle);
    clock.init();
}
function flash(who){
//    who.attr({fill:"blue"});
//    setTimeout(function(){alice.attr({fill:""});tom.attr({fill:""});},50)
}
var clock,tom,alice; //clocks
var toward,away; //lists of photons
var clockh=20,clockw=20; //sizes of clocks
var x; //position of moving clock
var xA=10; var xT=W-10;
function init(){
    paper=Raphael("canvas",W,H);
    $("canvas").width(W);
    $("canvas").height(H);
    x=W/2;
    clock=new movingClock(W/2);
    tom=paper.rect(xT-clockw/2,y0-clockh/2,clockw,clockh);
    alice=paper.rect(xA-clockw/2,y0-clockh/2,clockw,clockh);
    toward=new Photons(c,tom);
    away=new Photons(-c,alice);
    $("#start").click(run)
    $("#stop").click(stop)
}
$(init);
