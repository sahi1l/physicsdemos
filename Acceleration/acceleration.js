/*global $,Raphael*/
import {Score} from "../lib/quiz.js";
import {randint,choose} from "../lib/default.js";
let W=300; let H=300;
let extras = 0; //difficulty level, maybe implement with a slider? or over time?
let txtshift = 0;
let fontSize = 18;
let CANVAS = {};
function setupCanvas() {
    //This is to avoid the rush condition when canvases are deleted and recreated.
    //I might even be able to stick this into the canvas class?
    CANVAS.$w = $("<div id=canvas>");
    CANVAS.paper = Raphael(CANVAS.$w[0],"100%",250);
}

function hArrow(paper,y,base,length,color,text) {
    let lineL = length/1.1;
    paper.path(`M${base},${y}l${lineL},0}`)
        .attr({"stroke-width":5,"stroke":color,"stroke-linecap":"round"});
    //arrowhead
    let sign = Math.sign(length);
    let size = 10; 
    let path = `M${base+length},${y}l${-sign*size*2},${size}l0,${-2*size}z`;
    paper.path(path).attr({"fill":color,stroke:""});
    //text
    let shift=-15; //amount to shift the text
    paper.text(base+length/3, y+shift,
               text).attr({"font-size":fontSize, "fill":color});
};
function vArrow(paper,x,base,length,color,text) {
    //line
    let lineL = length/1.1; //length of the line so it doesn't stick through the arrowhead
    paper.path(`M${x},${base}l0,${lineL}`)
        .attr({"stroke-width":5,"stroke":color,"stroke-linecap":"round"});
    //arrowhead
    let sign = Math.sign(length);
    let size = 10; 
    let path = `M${x},${base+length}l${size},${-sign*size*2}l${-2*size},0z`;
    paper.path(path).attr({"fill":color,stroke:""});
    //text
    let shift=5; //amount to shift the text
    paper.text(x+shift,
               base+length/2,
               text).attr({"font-size":fontSize, "fill":color, "text-anchor":"start"});
}
function rect(paper, attr) {
    let hrange = new Range(attr.left, attr.right, attr.width, attr.center);
    let vrange = new Range(attr.top, attr.bottom, attr.height, attr.middle);
    return paper.rect(hrange.min, vrange.min, hrange.span, vrange.span).data({H: hrange, V:vrange});
};
class Range {
    constructor(min,max,span,center) {
        if (center) {
            this.center = center;
            if (span) {
                this.span = span;
                this.min = center - span/2;
                this.max = center + span/2;
            } else if (min) {
                this.min = min;
                this.span = 2*(center - min);
                this.max = center + this.span/2;
            } else if (max) {
                this.max = max;
                this.span = 2*(max - center);
                this.min = center - this.span/2;
            }
        } else {
            this.min = min ?? (max - span);
            this.max = max ?? (min + span);
            this.span = span ?? (max - min);
            this.center = (this.min + this.max)/2;
        }
        if (this.min == undefined || this.max == undefined || this.span == undefined || this.center == undefined) {
            throw("Range did not receive two defined values");
        }
    }
};
function Horizontal(prams={}){
    let $w = CANVAS.$w;
    $w.appendTo("body");
    let paper = CANVAS.paper;
    paper.clear();
    let direction = prams.direction ?? choose([-1,1]);
    let accdir = prams.accdir ?? choose([-1,1]);
    let mass = randint(1,6);
    let acceleration = randint(1,4);
    let ma = mass * accdir * acceleration;
    let force = mass*acceleration + randint(1,6); //randint 
    let solution = {
        text : $w,
        correct : `${force - ma}N`,
        others : [`${force}N`, `${force + ma}N`]
    };


    let boxSz = 60;
    //Y dimensions
    let base = 200;
    let vely = base-100;
    let accy = 50;
    //X dimensions
    let arrowL = 60;
    let center = 150;
    let floor = paper.path(`M0,${base}l300,0`).attr("stroke-width",2);
    let box = rect(paper, {
        bottom: base,
        height: boxSz,
        width: boxSz,
        center: center,
    } ).attr("fill","#aaa");
    let masstxt = paper.text(center,
                             box.data("V").center,
                             `${mass}kg`
                            )
        .attr("font-size",fontSize);
    let givenArrow = hArrow(paper, base - boxSz/2, center + boxSz/2, arrowL, "blue", `${force}N`);
    let guessArrow = hArrow(paper, base - boxSz/2, center - boxSz/2, -arrowL, "blue", "F");
    let acctxt = paper.text(center, accy, `|a| = ${acceleration}m/s²`
                           ).attr({"font-size": fontSize, "fill": "purple"});
    let velarrow = hArrow(paper, vely, center, arrowL*(direction), "red", "v");
    let changetxt = paper.text(center + arrowL*direction, vely + fontSize,
               (direction==accdir)?"speeding up":"slowing down");
    changetxt.attr({"font-size":0.8*fontSize, "font-family": "Times Italic","fill": "red"});
    $(changetxt.node).css({"font-style":"italic","line-height":9});
    box.toFront();
    masstxt.toFront();
    return solution;
}    
function Elevator(prams={}){
    let $w = CANVAS.$w;
    $w.appendTo("body");
    let paper = CANVAS.paper;
    paper.clear();
    let g = 10;
    let mass = randint(1,6);
    let acceleration = randint(1,4);
    let weight = g*mass;
    let direction = prams.direction ?? choose([-1,1]);
    let accdir = prams.accdir ?? choose([-1,1]);
    let ma = mass * accdir * acceleration;
    let solution = {
        text : $w,
        correct : `${weight + ma}N`,
        others : [`${weight}N`, `${weight - ma}N`]
    };
    let center = 100;
    let base = 175;
    let eleSz = 150;
    let boxSz = 60;
    let velx = 205;
    let arrowL = 60;
    let elevator = rect(paper, {height: eleSz,
                                bottom: base,
                                center: center,
                                width: eleSz,
                               }).attr("stroke-width",2);
    let box = rect(paper, {
        bottom: base,
        height: boxSz,
        width: boxSz,
        center: center,
    } ).attr("fill","#aaa");
    let masstxt = paper.text(center, box.data("V").center
                             , `${mass}kg`)
        .attr("font-size",fontSize);
    let weightArrow = vArrow(paper, center, base, arrowL, "blue", `${weight}N`);
    let NArrow = vArrow(paper, center, base-boxSz, -arrowL, "blue", "F");
    let acctxt = paper.text(center,
                            base - boxSz - arrowL - fontSize*3/4,
                            `|a| = ${acceleration}m/s²`
                           ).attr({"font-size": fontSize, "fill": "purple"});
    let velarrow = vArrow(paper, velx, base - eleSz/2, arrowL*(-direction), "red", "v");
    paper.setStart();
    paper.text(velx,
               base - eleSz/2 + (arrowL+fontSize)*(-direction),
               (direction==accdir)?"speeding":"slowing");
    paper.text(velx,
               base-eleSz/2 + (arrowL+fontSize)*(-direction)+0.6*fontSize,
               (direction==accdir)?"up":"down");
    let changetxt = paper.setFinish();
    changetxt.attr({"font-size":0.8*fontSize, "font-family": "Times Italic","fill": "red"});
    $(changetxt.node).css({"font-style":"italic","line-height":9});
    box.toFront();
    masstxt.toFront();
    return solution;
};
function generator() {
    let solution = randint(2)?Horizontal():Elevator();
    if (extras) {
        let values = [parseFloat(solution.correct),parseFloat(solution.others[0]),parseFloat(solution.others[1])];
        let min = Math.min(...values);
        let max = Math.max(...values);
        let avg = (min+max)/2;
        console.log(values);
        console.log("MMA",min,max,avg);
        min = Math.max(0,2*min - avg);
        max = 2*max - avg;
        console.log("MMA",min,max,avg);
        let duh = 0;
        for (let i = 0; i<extras && duh<100;duh++) {
            let val = randint(min,max+1);
            if (!values.includes(val) && !values.includes(val+1) && !values.includes(val-1)) {
                values.push(val);
                solution.others.push(`${val}N`);
                i++;
            }
        }
    }
    return {text: solution.text,
            correct: solution.correct,
            others: solution.others
           };
}

function unit_test() {
    //test Elevator correct answers
    for(let dir of [-1,1]) {
        for (let accdir of [-1,1]) {
            let soln = Elevator({direction:dir,accdir:accdir});
            let correct = parseFloat(soln.correct);
            let wrong = parseFloat(soln.others[0]);
            if (Math.sign(correct-wrong) != accdir){console.log("Error when dir,accdir =",dir,accdir);}
        }
    }
    for(let dir of [-1,1]) {
        for (let accdir of [-1,1]) {
            let soln = Horizontal({direction:dir,accdir:accdir});
            let correct = parseFloat(soln.correct);
            let wrong = parseFloat(soln.others[0]);
        }
    }

}
function init() {
    let $root = $("demo-quiz");
    setupCanvas();
    let DEBUG = false;
    if (DEBUG) {unit_test();
    } else {
        new Score($root, 0, generator, {noauto: true, canvas: false, sort: "number"});
        $(".answers").prepend("<div>What is F?</div>");
    }
}

$(init);
