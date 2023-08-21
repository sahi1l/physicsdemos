/*global $*/
import {Score} from "../lib/quiz.js";
import {randint} from "../lib/default.js";
function generator(canvas) {
    /* Given two rays.  Types of questions to ask:
     * Which material is faster/slower?
     * Which material has the higher/lower index of refraction.
     */
    //Step 1: Draw the rays
    let W = canvas.W;
    let H = canvas.H;
    let colors = ["#faa","#aaf"];
    canvas.paper.rect(0,0,W,H/2).attr({"fill":colors[0], stroke:""});
    canvas.paper.rect(0,H/2,W,H/2).attr({"fill":colors[1], stroke:""});
    canvas.paper.path(`M${W/2},0l0,${H}`) //normal
        .attr({"stroke-dasharray":"-","stroke-width":2});
    let x0,x1;
    let flag = false;
    while (!flag) {
        x0 = randint(30,W);
        x1 = randint(30,W);
        let ratio = Math.max(x0,x1)/Math.min(x0,x1);
        if (ratio>2) {flag=true;}
    }
    console.debug(x0,x1,Math.max(x0,x1)/Math.min(x0,x1));
    let dv = Math.sign(x1-x0); //change in speed
    let start = 1;
    let y0=0, y1=H;
    if(Math.random()<0.5) {[y0,y1] = [y1,y0]; start=-1;}
    if(x1>W/2){
        y1 = (H/2) + (W/2)*(y1-H/2)/x1;
        x1 = W/2;

    }
    if(Math.random()<0.5) {
        x0=-x0;
    } else {x1=-x1;}
    canvas.paper.text(H/2-H/4*Math.sign(x0)*start,W/4,"A").attr({fill: "#f88", "font-size": 80, "text-anchor":"middle"});
    canvas.paper.text(H/2-H/4*Math.sign(x1)*start,3*W/4,"B").attr({fill: "#88f", "font-size": 80, "text-anchor":"middle"});

    console.debug("dv=",dv);
    canvas.paper.setStart();
    canvas.paper.path(`M${x0+W/2},${y0}L${W/2},${H/2}`)
        .attr({"arrow-end":"classic"});

    canvas.paper.path(`M${x1+W/2},${y1}L${W/2},${H/2}`)
        .attr({"arrow-start":"classic"});//FIX: put arrowhead at 
    canvas.paper.setFinish().attr({"stroke-width":6});
    let result = {};
    let answers = [];
    let choice = randint(0,4);
    switch (choice) {
    case 0:
    case 3:
        result.text = "This ray is";
        answers = ["slowing down","","speeding up"];
        break;
    case 1:
        result.text = "Which material has the<BR><U>higher</U> index of refraction?";
        answers = ['<span class="A">A</span>',"",'<span class="B">B</span>'];
        dv *= -start;
        break;
    case 2:
        result.text = "Which material has the<BR><U>lower</U> index of refraction?";
        answers = ['<span class="A">A</span>',"",'<span class="B">B</span>'];
        dv *= start;
        break;
    }
    result.correct = answers[dv+1];
    result.others = [answers[-dv+1]];
    
    return result;
}

function init() {
    new Score($("demo-quiz"), 10, generator, {noauto: false,canvas: true,sort:"a"});
}

$(init)
