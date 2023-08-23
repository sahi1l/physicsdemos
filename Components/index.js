/*global Snap,$ */
import {Score} from "../lib/quiz.js";
import {Help} from "../lib/default.js";
//FIX: Add +x and +y axes
var guess={x:1,y:1,vertical:false};
var correct={x:1,y:1,vertical:false};
const vlength = 40;
var timeout;
//var sign={x:1,y:1};
//var vertical=false;
let fadedColor = "#aaa";
function SetMagnitude(val){$(".magnitude").each(function(i,e){e.innerHTML=val;});}
function SetAngle(val){$(".angle").each(function(i,e){e.innerHTML=val;});}
function ToggleSign(which){
    guess[which]=-guess[which];
    var c;
    if(guess[which]>0){c="+";} else {c="-";}
    $("#"+which).html(c);
}
function ToggleTrig(){
    guess.vertical=!guess.vertical;
    let x="cos";
    let y="sin";
    if(guess.vertical){//trig means vertical
        x="sin"; y="cos";
    }
    $("#xtrig").html(x); $("#ytrig").html(y);
}
var paper=undefined,base,vector,AngleText,arc,correctQ,circle,mask,arrow;
class Arrow {
    constructor(paper,x1,y1,x2,y2,attrs={}) {
        let sc = 2; //scale of arrowhead
        this.color = attrs.color??"grey";
        this.width = attrs.width??3;
        this.class = attrs.class??"";
        this.obj = paper.group();
        this.headid = "head" + parseInt(1e6*Math.random());
        this.arrowhead=paper.polyline(0,-sc,2*sc,0,0,sc).attr({fill:this.color,class:this.class});
        this.arrowhead.marker(0,-sc,2*sc,2*sc,sc,0).attr({id:this.headid});
        this.line = paper.line(x1,y1,x2,y2)
            .attr({"stroke-width":this.width,
                   "stroke-linecap":"round",
                   "stroke": this.color,
                   "class": this.class
                  });
        this.obj.append(this.line);
        this.line.node.style['marker-end'] = Snap.url(this.headid);
        console.debug(this.line);
    }
    attr(args) {
        this.line.attr(args);
    }
    setColor(color) {
        this.line.node.style["stroke"]=color;
        this.arrowhead.node.style["fill"] = color;
    }
}
class LabelledArrow {
    /*An arrow with a label and a dotted arc between angle (0-360) and horizontal or vertical*/
    constructor(paper,length,angle,vertical) {
        this.color = "grey";
        this.paper = paper;
        this.length = length;

        
        this.mask = paper.group();
        this.mask.rect = paper.polyline(0,0,0,0).attr({fill:"black"});
        this.mask.wedge = paper.polyline(0,0,0,0).attr({fill:"white"});
        this.mask.append(this.mask.rect);
        this.mask.append(this.mask.wedge);
        
        this.circle = paper.circle(0,0,0.8*length)
            .attr({"stroke-dasharray": "1,1",
                   "fill": "transparent",
                   "stroke": "grey",
                   "mask": this.mask
                  });
        this.vector = new Arrow(paper,0,0,0,0);
/*        this.vector = paper.line(0,0,0,0)
            .attr({"stroke-width":3,
                   "stroke-linecap":"round",
                   "stroke":this.color});
*/
        this.label = paper.text(0,0,"?°")
            .attr({"font-size":parseInt(length/6), "text-anchor": "middle", "dominant-baseline":"middle"});

        
        if(angle!=undefined) {this.SetAngle(angle,vertical);}
        this.vector.setColor("var(--main-color)");
    }

    Components(xs,ys,angle,vertical) {
        let radians=angle*Math.PI/180.0;
        if(vertical){
            return {x:xs*Math.sin(radians),
                    y:ys*Math.cos(radians)};
        } else {
            return {x:xs*Math.cos(radians),
                    y:ys*Math.sin(radians)};
        }
    }
    
    SetAngle(xs,ys,vertical,angle) {//FIX: Maybe figure out xs/ys separately...later. Bigger nightmare than I thought.

        let XS = xs*this.length;
        let YS = -ys*this.length;
        let full = this.Components(XS, YS, angle, vertical);
        let half = this.Components(XS, YS, 0.5*angle, vertical);
        let zero = this.Components(XS, YS, 0, vertical);
        if(vertical) {
            base.attr({x1:0, y1: -this.length, x2: 0, y2: this.length});
        } else {
            base.attr({x1: -this.length, y1:0, x2: this.length, y2: 0});
        }
        this.vector.attr({x2: full.x, y2: full.y});
        this.label.attr({x: 0.6*half.x,
                         y: 0.6*half.y,
                         text: angle+"°"});
        let M = Math.max(Math.abs(full.x/full.y),Math.abs(full.y/full.x));
        let X = 20*M*full.x; let Y = 20*M*full.y;

        this.mask.rect.attr("points", [0,0,X,0,X,Y,0,Y].join(","));
        if(vertical) {
            this.mask.wedge.attr("points", [0,0,X,Y,0,Y,0,0].join(","));
        } else {
            this.mask.wedge.attr("points", [0,0,X,Y,X,0,0,0].join(","));
        }
    }
}
function CheckAnswer(){
    //Is the answer correct?
    if(guess.x==correct.x && guess.y==correct.y && guess.vertical==correct.vertical){
        correctQ.attr({text:"Correct!",fill:"var(--right-color)",opacity:1});
        score.correct++;
        score.number++;
        score.total++;
        if(score.number>score.max){
            correctQ.animate({opacity:0},2000,Win);
        } else {
            correctQ.animate({opacity:0},2000,RandomVector);
        }
    } else {
        score.total++; score.error++;
        correctQ.attr({text:"Try again",fill:"var(--wrong-color)",opacity:1});
        correctQ.animate({opacity:0},2000);
    }
    updateScore();
}
function Win(){
    $("#win>.click").click(start);
    $("#win>#percentage").html(score.error+' errors<br>'+score.max
                               +' questions');
    $("#win").attr({opacity:0}).show().animate({opacity:1},2000);
}
function updateScore(){
    var suffix=" errors"; if(score.error==1){suffix=" error";}
    $("#score").html(score.error+suffix);
}
function updateNumber(){
    $("#number").html(score.number+" of "+score.max);
}
function RandomVector(){
    updateNumber();
    let xs,ys,vertical;
    do {
        xs = Math.floor(Math.random()*2)*2-1;
        ys = Math.floor(Math.random()*2)*2-1;
        vertical = Math.floor(Math.random()*2);
    } while (xs==correct.x && ys==correct.y && vertical==correct.vertical);
    let angle = Math.floor(Math.random()*13)*5+20;
//    [xs,ys,vertical] = [1,1,0];

    correct = {x:xs, y:ys, vertical: vertical};
    console.debug("correct: ",correct);
    arrow.SetAngle(xs,ys,vertical, angle);
    $(".angle").each(function(i,e){e.innerHTML=angle;});
}
var score={correct:0,total:0,number:1,max:10,error:0};
function init() {
    if(paper!=undefined){paper.remove();}
    paper = Snap("#canvas");
    let size = vlength+10;
    paper.attr({viewBox:[-size,-size,2*size,2*size].join(",")});
    //basis
    let basis = {size: 10};
    basis.cx = size-basis.size-10;
    basis.cy = 2*basis.size-size+5;
    basis.x = new Arrow(paper,basis.cx,basis.cy,basis.cx+basis.size,basis.cy,{width:1,color:fadedColor});
    basis.y = new Arrow(paper,basis.cx,basis.cy,basis.cx,basis.cy-basis.size,{width:1,color:fadedColor});
    let font = {"font-size":size/10,"text-anchor":"middle","dominant-baseline":"middle",fill:fadedColor};
    basis.tx = paper.text(basis.cx+basis.size+5,basis.cy,"+x").attr(font);
    basis.ty = paper.text(basis.cx,basis.cy-basis.size-5,"+y").attr(font);
    
    base=paper.line(0,0,30,0).attr(
        {stroke:"black",
         "stroke-dasharray": "1,1"
        });
    let vectorcolor = "grey";
    arrow = new LabelledArrow(paper,vlength);
    correctQ=paper.text(-50,43,"")
        .attr({"font-size":10,"text-anchor":"start",opacity:0});
    $(".trig").click(ToggleTrig);
    $("#x").click(function(){ToggleSign("x")});
    $("#y").click(function(){ToggleSign("y")});
    $("#check").click(CheckAnswer);
    new Help($("#help"));
    start();
    }

function start(){
    score.correct=0;
    score.total=0;
    score.number=1;
    score.error=0;
    $("#win").hide();
    correctQ.attr({opacity:0});
    RandomVector();
    updateScore();
}

$(init);
