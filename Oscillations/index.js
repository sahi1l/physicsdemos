/*global $*/
import {Canvas,Score} from "../lib/quiz.js";

class NewCanvas {
    constructor($root) {
        this.$w = $("<my-canvas>");
        if($root) {
            this.$w.appendTo($root);
            this.$root = $root;
        }
        this.paper = Raphael(this.$w[0],"100%","100%");
        this.paper.setViewBox(0,0,100,100);
    }
    clear() {
        this.paper.clear();
    }
}
function UpdateClock(phase) {
    let $w = $("#clock");
    $w.html(phase.toFixed(1)+"s");
}
class Oscillator {
    constructor($root) {
        this.$canvas = new NewCanvas($root);
        this.period = 2;
        let P = this.$canvas.paper;
        this.wall = {x:1, bot: 50};
        this.block = {x0: 50, W: 15, H: 10};
        this.wall.obj = P.path(`M${this.wall.x},10L${this.wall.x},${this.wall.bot}L99,${this.wall.bot}`).attr("stroke-width",2);
        this.mid = P.path(`M${this.block.x0},0l0,100`).attr({"stroke-width":0.5,"stroke-dasharray":"."});
        this.block.obj = P.rect(0,0,0,0).attr({fill:"white"});
        this.spring = P.path("").attr("stroke-dasharray","-");
        this.moveto(0);
        this.running = false;
        this.phase = 0;
        this.dphase = 0.01;
        this.step = this.step.bind(this);
    }
    moveto(p){
        let W = this.block.W;
        let H = this.block.H;
        let X0 = this.block.x0;
        let Y0 = this.wall.bot - H/2;
        let A = 30; //Math.min(X0-this.wall.x,99-X0); //amplitude
        let x = X0-W/2 + A*p;
        let color = "white";
        if(Math.abs(p) < 0.2) {
            let fade = Math.floor(Math.abs(p)/0.2*15).toString(16);
            color = "#F"+fade+fade;
        } else if (Math.abs(p) > 0.95) {
            let fade = Math.floor(15-(Math.abs(p)-0.9)/0.1*15).toString(16);
            color = "#"+fade+fade+"F";
        }
        
        this.block.obj.attr({
            fill: color,
            x:x,
            y: Y0-H/2,
            width: W,
            height: H});
        this.spring.attr("path",`M${this.wall.x},${Y0}L${x},${Y0}`);
    };
    step() {
        this.phase += this.dphase;
        this.moveto(Math.sin(2*Math.PI*this.phase));
        UpdateClock(this.phase*this.period);
    }
}
function generator(canvas) {
    return {text: "This is a test of the quiz layout.",
            correct: "A",
            others: ["B","C","D"]
           };
}

function init() {
    let osc = new Oscillator($("demo-quiz"));
    setInterval(osc.step,50);
//    new Score($("demo-quiz"), 10, generator, {multiple: 2, noauto: true});
}

$(init)
