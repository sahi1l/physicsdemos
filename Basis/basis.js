import {Score} from "../lib/quiz.js";
import {randint,choose} from "../lib/default.js";
let CANVAS = {};
let H = 100;
let W = 100;
let unitvectors = ["xy","ıȷ"];
let uvmode = 0; //or 1
function setupCanvas() {
    CANVAS.$w = $("<div>").appendTo("body");
    CANVAS.paper = Raphael(CANVAS.$w[0], 3*W, H);
    let ax = 50; let pad = 20; let fsz = 16;
    CANVAS.paper.path(`M${3*W-ax-pad},${pad}  l0,${ax},20l${ax},0`)
        .attr({"arrow-start":"classic",
               "arrow-end":"classic",
               "stroke-width":2});
    let yax = CANVAS.paper.text(3*W-ax-pad,pad-fsz,"+y").attr("font-size",fsz);
    let xax = CANVAS.paper.text(3*W-pad,pad+ax,"+x").attr({"font-size":fsz,"text-anchor":"start"});
    
}
function drawArrow(code,number) {
    if(!number) {number="";}
    if(code[1]=="x"){
        CANVAS.arrow.attr("path",`M0,${H/2}l${W},0`);
        CANVAS.magnitude.attr({x:W/2, y:H/2-18, text:number});
    } else {
        CANVAS.arrow.attr("path",`M${W/2},${H}l0,${-H}`);
        CANVAS.magnitude.attr({x:H/2+18, y:W/2, text:number});
    };
    if(code[0]=="+"){
        CANVAS.arrow.attr({"arrow-start":"none","arrow-end":"classic"});
    } else {
        CANVAS.arrow.attr({"arrow-start":"classic","arrow-end":"none"});
    }
}
function formatAnswer(answer,M,questionType){
    let sign = answer[0];
    let dir = answer[1];
    let num = sign + parseInt(M);
    let sfx1;
    let sfx2;
    if (questionType==1){
	return (dir=="x")?(`(${num},0)`):(`(0,${num})`);
    } else {
	if (dir=="x") {sfx1 = unitvectors[uvmode][0];}
	else {sfx1 = unitvectors[uvmode][1];}
	sfx1 = `<span class="hatted">${sfx1}</span>`;
	return `${num}${sfx1}`;
    }
}
function generator() {
    CANVAS.$w.appendTo("body");
    let M = randint(2,9);
    uvmode = randint(0,2)%2;
    let questionType = choose([0,1],{id:"questiontype",N:2});
//    let questionType = randint(2); //0 for +x, 1 for (+5,0)
    
    let answers = ["+x","-x","+y","-y"];
	
    let solution = choose(answers,{id:"solution"});
    drawArrow(solution,M);
    let correct = formatAnswer(solution, M, questionType);
    let others = [];
    for (let key of answers) {
        if (solution != key) {
	    others.push(formatAnswer(key,M,questionType));
        }
    }
return {text: CANVAS.$w, 
            correct: correct,
            others: others
           };
    
}

function init() {
    setupCanvas();
    $("#units input").on("change",(e) => {
        console.debug("e=",e);
        let value = $("#units input[name=unit]:checked").prop("value");
        uvmode = 0+(value == "ij");
        
    });
    CANVAS.arrow = CANVAS.paper.path("M0,0L2,2").attr({stroke:"black", "stroke-width":8});
    CANVAS.magnitude = CANVAS.paper.text(0,0,"")
        .attr({"font-size":18});
    new Score($("main"), 10, generator, {multiple: 2, noauto: true});
}

$(init)
