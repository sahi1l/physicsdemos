import {Score} from "../lib/quiz.js";
import {randint,choose} from "../lib/default.js";

function Arrow(angle,cls="") {
    let L = 50; //size of the viewbox
    let sx=0.2; let sy=0.2;
    angle = angle*90;
    let $result = $("<svg>").attr({width:L, height:L, viewBox:"-1.2 -1.2 2.4 2.4"});
    let $arrow = $("<polyline>").attr({points:`-1,0 1,0 ${1-sx},${sy} ${1-sx},${-sy} 1,0`})
        .attr({stroke:"black", fill: "black","stroke-width": 0.1,transform:`rotate(${angle})`})
        .appendTo($result).addClass(cls);
    let result = $result[0].outerHTML.replace("<svg ",`<svg class="${cls}" `);
    return result;
}
function randomVector(diagQ=false) {
    if(!diagQ) {
        let dx; let dy;
        while (true) {
            dx=randint(-1,1);
            dy=randint(-1,1);
            if ((dx==0) ^ (dy==0)) {break;} //only one of dx or dy must be zero
        }
        return [dx,dy];
    }
}
function rndSign(){
    if(Math.random()>0.5){return 1;}
    return -1;
}

function flip(angle) {
    return (angle+3)%4-1;
}
function sum(even,odd) {
    even = even*Math.sign(odd);
    return (even+odd)/2;
}
function generator() {
    let sign = rndSign();
    let angles = [choose([0,2]), choose([-1,1])];
    let cangle = sum(angles[0],angles[1]);
    if (randint(2)==1) {angles=angles.reverse();}
    let question;
    if (sign>0) {
        question = Arrow(angles[0]) + '<span class="sign">+</span>' + Arrow(angles[1]);
    } else {
        question = Arrow(angles[0]) + '<span class="sign">-</span>' + Arrow(2+angles[1]);
    }
        
    question = $("<div>").addClass("question").html(question)[0].outerHTML;
    let others = [];
    let correct = Arrow(cangle,"bg");
    for (let i = 1; i<=3; i++) {
        others.push(Arrow(cangle+i,"bg"));
    }
    
    
    return {text: question,
            correct: correct,
            others: others
           };
}

function init() {
    new Score($("#main"), 0, generator, {multiple: 2, noauto: true});
}

$(init);
