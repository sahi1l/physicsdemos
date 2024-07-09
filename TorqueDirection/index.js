import {Score} from "../lib/quiz.js";
let $main;
function arrow(paper,x,y,L,dir,text,boxQ=false) {
    //just a horizontal arrow...for now (dunh dunh dunh)
    //dir will be an angle in degrees, eventually
    let fsize = 24;
    let lineobj = paper.path(`M${x},${y}m${-L/2},0l${L},0`)
        .attr({"arrow-end":"classic","stroke-width":4});
    let textobj = paper.text(x,y-fsize,text)
        .attr({"font-size":fsize, "text-anchor":"middle"});
    let st = paper.set();
    st.push(lineobj,textobj);
    if (boxQ) {
        let size = L/2;
        let boxobj = paper.rect(x-L/2-size,y-size/2,size,size);
        st.push(boxobj);
    }
    st.rotate(dir,x,y);
    textobj.rotate(-dir,x,y-fsize);
    return st;
}
function rn(min,max) {
    return (max-min)*Math.random()+min;
}
function generator(canvas) {
    let boxW = 100;
    let boxH = 100;
    let boxX = 100;
    let boxY = 100;
    let box = canvas.paper.rect(boxX,boxY,boxW,boxH);
    let actionX = 100; //x position of force's action, currently on left side of box
    let actionY = Math.random()*boxH + boxY;
    let forceAngle = rn(-60,60)/180*Math.PI;
    let forceMag = 50;
    let forcedX = -forceMag*Math.cos(forceAngle);
    let forcedY = forceMag*Math.sin(forceAngle);
    let forceV = canvas.paper.path(`M${actionX},${actionY}l${forcedX},${forcedY}`)
        .attr({"arrow-start":"classic","stroke-width":4,"stroke":"blue"});
    canvas.paper.text(actionX+forcedX,actionY+forcedY+20*(forceAngle>0?1:-1),"F").attr({fill:"blue","font-size":36,"font-family":"serif"});
    let pivotX; let pivotY; let rX; let rY; let angle=0;
    let minAngle = 20; //maximum angle from 90° where two arrows might look "perpendicular"
    do {
        pivotX = rn(0.25,1)*boxW + boxX;
        pivotY = rn(0,1)*boxH + boxY;
        if(Math.hypot(pivotX-actionX,pivotY-actionY)>0) {
            angle = (pivotX-actionX)*forcedY - (pivotY-actionY)*forcedX;
            angle /= Math.hypot(pivotX-actionX,pivotY-actionY) * forceMag;
        }
    } while (Math.abs(angle) < minAngle*Math.PI/180);
    canvas.paper.circle(pivotX,pivotY,5).attr({fill:"purple",stroke:""});
    canvas.paper.text(pivotX,pivotY-15,"pivot").attr({fill:"purple","font-style":"italic","font-family":"serif","font-size":20});
    let cwQ = angle>0?1:-1;
    //canvas.paper.text(50,50,cwQ); DEBUG
    let poss = ["counterclockwise ⤿","","clockwise ⤾"];
    return {text: "This force exerts a ... torque.",
            correct: poss[cwQ+1],
            others: [poss[-cwQ+1]]
           };
}

function init(){
    $main = $("demo-quiz");
    new Score($main,30,generator,{canvas:true,sort:"a"});
}
$(init);
