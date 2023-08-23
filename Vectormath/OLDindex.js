import Score from "/lib/quiz.js";
import {randint} from "/lib/default.js";

function Arrow(dx,dy,cls="") {
    if (dy==undefined) {
        dy = dx[1];
        dx = dx[0];
    }
    let W = 50;  let H = 50; //size of the arrow
    let $result = $("<svg>").attr({width:W, height:H, viewBox:"-1.2 -1.2 2.4 2.4"});
    let sx = -5; let sy=0;
//    let $box = $("<rect>").attr({width:4, height: 4, x: -2, y:-2, fill:"white"}).appendTo($result);
    let $arrow = $("<line>").attr({x1:-dx, y1:-dy, x2:dx, y2:dy, stroke:"white", fill: "white","stroke-width": 0.1,"marker-end":"url(#triangle)"}).appendTo($result).addClass(cls);
    return $result[0].outerHTML;
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

function generator() {
    let vs = [ [rndSign(), 0], [0, rndSign()] ];
    if (rndSign()>0){
        vs = vs.reverse();
    }
    let sign = rndSign(); //+ or -
    let signdiv = `<span class="sign">${"-?+"[sign+1]}</span>`;
    let question = Arrow(vs[0]) + signdiv + Arrow(vs[1]);
    question = $("<div>").addClass("question").html(question)[0].outerHTML;
    
    let others = [];
    let cx = vs[0][0] + sign * vs[1][0];
    let cy = vs[0][1] + sign * vs[1][1];
    let correct = Arrow(cx,cy);
    
    for (let x of [-1,1]) {
        for (let y of [-1,1]) {
            if (!(x==cx && y==cy)) {
                others.push(Arrow(x,y));
            }
        }
    }
    
    return {text: question,
            correct: correct,
            others: others
           };
}

function init() {
    new Score($("#main"), 10, generator, {multiple: 2, noauto: true});
}

$(init)
