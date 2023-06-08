var W=1000;
var H=300;
var c=50; //speed of light
var v=40; //speed of train
var L=400; //width of train
var Htrain=L/3; //height of train
var y0=H/2;
var radius=10; //size of light "ball"
var dt=0.1;
var paper;
var train,rear,front;
function movingObject(type,x0,y0,v){
    if(type=="train"){
        this.object=paper.rect(x0,y0,L,Htrain).attr({fill:"#ccf"})
    } else {
        this.object=paper.circle(x0,y0,radius).attr({fill:"red"})
    }
    var that=this;
    this.v=v
    this.draw=function(){
        if (type=="train"){
            that.object.attr({x:that.x,y:that.y})
        } else {
            that.object.attr({cx:that.x,cy:that.y})
        }
    }
    this.step=function(){
        that.x=that.x+that.v*dt;
        that.draw();
        if(type!="train"){
            if((that.x<train.x || that.x>train.x+L) && $("#showtrain").prop("checked")){
                that.object.hide();
                return false;
            } else {that.object.show();}
        }
        return true; //does the object still exist
    }
    this.init=function(){
        that.x=x0;
        that.y=y0;
        that.draw()
        that.object.show();
    }
    this.init()
}
function step(){
    train.step();
    var flag= rear.step();
    flag = front.step() || flag;
    return flag;
}
var handle;
function animate(){
    var flag=step();
    if(flag){handle=setTimeout(animate,100);}
}
function run(){
    stop();
    train.v=parseFloat($("#train").val())*c;
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
    revealTrain();
    animate();
}
function stop(){
    clearTimeout(handle);
    train.init();
    rear.init();
    front.init();
}
function revealTrain(){
    if($("#showtrain").prop("checked")){train.object.show();} else {train.object.hide();}
}
function init(){
    paper=Raphael("canvas",W,H);
    $("canvas").width(W);
    $("canvas").height(H);
    train=new movingObject("train",0,y0-Htrain/2,v)
    rear=new movingObject("light",L/2,y0,-c)
    front=new movingObject("light",L/2,y0,c)
    $("#start").click(run)
    $("#stop").click(stop)
    $("#showtrain").click(revealTrain)
    revealTrain()
}
$(init);
