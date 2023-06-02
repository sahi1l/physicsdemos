var paper;
var W=800; var H=800;
var rmin=10;
var rmax=48;
var planet; var dots, tdots;
var angle=0,r=20;
var ship, target;
var acceleration=0;
var collected=0;
var captured;
var flame;
var firing=0;
var maxcollected=3;
dangle=0.1;
var count=0;
var fuel=0,fuelW,winW;
var timeW;
var winQ=false;
var clickhandle,stephandle;
var start,elapsed;
function init(){
    start=new Date();
    paper=Raphael("game",W,H);
    $("#game").width(W);
    $("#game").height(H);
    paper.setViewBox(-50,-50,100,100);
//    var upbtn=paper.image("UpButton.png",30,40,9,9);
//    var dnbtn=paper.image("DownButton.png",40,40,9,9);
    fuelW=paper.text(-49,44,"Fuel used: 0").attr({fill:"white","font-size":2,"text-anchor":"start"});
    timeW=paper.text(-49,46,"Time elapsed: 0").attr({fill:"white","font-size":2,"text-anchor":"start"});
    //FIX: Add time elapsed
    planet=paper.circle(0,0,rmin*0.9).attr({fill:"blue"});
//    flame=paper.ellipse(rmin,0,0.5,2).attr({fill:"orange",stroke:""});
    paper.setStart();
    
    //ship=paper.circle(rmin,0,1).attr({fill:"grey",stroke:""});
    flame=paper.ellipse(rmin,0,0.5,2).attr({fill:"orange",stroke:""}).hide();
    paper.circle(rmin,0,1).attr({fill:"grey",stroke:""});
    ship=paper.setFinish();
    ship.angle=0; ship.r=r;
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
/*        if(changevel(1)){
            acceleration=-1;
            flame.show();
        } else {flame.hide();}
*/
        break;
    case 40:
        slowDown();
        event.preventDefault();
/*        if(changevel(-1)){
            acceleration=1;
            flame.show();
        } else {flame.hide();}
*/
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
    timeW.attr("text","Time elapsed: "+parseInt(elapsed/1000));
    count++;
    flame.attr({ry:Math.random()+1});
    ship.X=ship.r*Math.cos(ship.angle);
    ship.Y=ship.r*Math.sin(ship.angle);
    ship.attr({cx:ship.X,cy:ship.Y});
 //   flame.attr({cx:ship.r*Math.cos(ship.angle),cy:ship.r*Math.sin(ship.angle)})
    target.attr({cx:target.r*Math.cos(target.angle),cy:target.r*Math.sin(target.angle)});
    ship.transform('r'+ship.angle*180/Math.PI);
    
    flame.translate(0,acceleration);
//    flame.transform('t0,1'+'r'+ship.angle*180/Math.PI+','+ship.cx+','+ship.cy);
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
    fuelW.attr("text","Fuel used: "+fuel);
}
$(init);

/*TYPES OF GOALS:
1. Stationary target
2. Moving target
3. Match period of flashing?
*/

/*
Should be some indiction (flame?) that it's speeding up or slowing down
*/
