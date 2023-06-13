let paper;
//var W=800; var H=800;
let rmin=10;
let rmax=48;
let planet;
let dots, tdots;
let r=20;
let ship, target;
let acceleration = 0;
let collected = 0;
var captured;
var flame;
var firing=0;
var maxcollected=3;
dangle=0.1;
var count=0;
let fuel=0;
let winW;
var winQ=false;
var clickhandle,stephandle;
var start,elapsed;
function init(){
    start=new Date();
    paper=Raphael("game","100%","100%");
    paper.setViewBox(-50,-50,100,100);
    planet=paper.circle(0,0,rmin*0.9).attr({fill:"blue"});
    paper.setStart();
    flame=paper.ellipse(rmin,0,0.5,2).attr({fill:"orange",stroke:""}).hide();
    paper.circle(rmin,0,1).attr({fill:"grey",stroke:""});
    ship=paper.setFinish();
    ship.angle=0; ship.r = r;
    target=paper.circle(rmin,0,1).attr({fill:"yellow",stroke:""});
    placeTarget();
    dots=paper.set();
    tdots=paper.set();
    captured=paper.set();
    
    $("#upbutton").mousedown(upButton).mouseup(keyReleased);
    $("#downbutton").mousedown(downButton).mouseup(keyReleased);
    $("#upbutton").on("touchstart",upButton).on("touchend",keyReleased);
    $("#downbutton").on("touchstart",downButton).on("touchend",keyReleased);
    winW=paper.text(0,0,"Win!").attr({fill:"white","font-size":6,"text-anchor":"middle"}).hide();
    step();
}
document.addEventListener('keydown',keyPressed);
document.addEventListener('keyup',keyReleased);
function nodefault(e) {
    e.preventDefault();
    e.stopPropagation();
}
function placeTarget(){
    target.r=Math.random(1)*(0.99*rmax-1.01*rmin)+1.01*rmin;
    target.angle=Math.random(1)*2*Math.PI;
    target.attr({cx:r*Math.cos(target.angle),cy:r*Math.sin(target.angle)});
}
function Win(){
    if(Math.hypot(ship.X-target.attr("cx"),ship.Y-target.attr("cy"))<2){
        var col=paper.circle(target.attr("cx"),target.attr("cy"),target.attr("r")).attr({fill:"yellow","stroke-width":0});
        target.hide();
        col.animate({cx:-49+2*collected+Math.floor((collected)/3),cy:48,r:1},500);
        captured.push(col);
        collected++;
        if(collected>=maxcollected){
            ship.remove();
            target.remove();
            clearTimeout(stephandle);
            winW.show();
            winQ=true;
        } else {
            placeTarget();
            target.show();
        }
   }
}
function upButton(e){
    if(e){
	nodefault(e);
    }
    speedUp();
    clickhandle=setTimeout(upButton,100);
}
function downButton(e){
    if(e){
	nodefault(e);
    }
    slowDown();
    clickhandle=setTimeout(downButton,100);
}
function speedUp(){
    if(changevel(1)){
        acceleration=-1;
        flame.show();
    } else {flame.hide();}
}
function slowDown(){
    if(changevel(-1)){
        acceleration=1;
        flame.show();
    } else {flame.hide();}
}
function keyPressed(event){
    switch(event.keyCode){
    case 38:
        speedUp();
        event.preventDefault();
        break;
    case 40:
        slowDown();
        event.preventDefault();
        break;
    }
}
function keyReleased(event){
    clearTimeout(clickhandle);
    acceleration=0;
    flame.hide();
}
function step(){
    if(winQ){return;}
    elapsed=new Date()-start;
    $("#time").html(parseInt(elapsed/1000));
    count++;
    flame.attr({ry:Math.random()+1});
    ship.X=ship.r*Math.cos(ship.angle);
    ship.Y=ship.r*Math.sin(ship.angle);
    ship.attr({cx:ship.X,cy:ship.Y});
    target.attr({cx:target.r*Math.cos(target.angle),cy:target.r*Math.sin(target.angle)});
    ship.transform('r'+ship.angle*180/Math.PI);
    
    flame.translate(0,acceleration);
    dots.push(
        paper.circle(ship.r*Math.cos(ship.angle),ship.r*Math.sin(ship.angle),0.1)
            .attr({"fill":"red","stroke-width":0})
    );
    tdots.push(
        paper.circle(target.r*Math.cos(target.angle),target.r*Math.sin(target.angle),0.1)
        .attr({"fill":"yellow","stroke-width":0})
        );
    while(dots.length>300){
        dots.splice(0,1).remove();
        tdots.splice(0,1).remove();
    }

    ship.toFront();
    ship.angle+=3.16*Math.pow(ship.r,-1.5);
    target.angle+=3.16*Math.pow(target.r,-1.5);
    Win();
    stephandle=setTimeout(step,20);
}
function changevel(dv){
    var v0=1000;
    var v=v0/Math.sqrt(ship.r);
    v+=dv;
    var nr=Math.pow(v0/v,2);
    if(nr<rmin){nr=rmin; ship.r=nr; return 0;}
    if(nr>rmax){nr=rmax; ship.r=nr; return 0;}
    fuel++;
    UpdateFuel();
    ship.r=nr; return 1;
}
function UpdateFuel(){
    $("#fuel").html(fuel);
}
$(init);

