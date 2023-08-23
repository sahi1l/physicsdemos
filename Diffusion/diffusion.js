import {randint,range,HSVtoRGB} from "../lib/default.js";
import Button from "../lib/buttons.js";
import { Help } from "../lib/default.js";
function hex(num) {
    let val = num.toString(16);
    while(val.length<2) {val="0"+val;}
    return val;
}
function randomColor(min=0,max=1){//min,max range from 0 to 1
    let result = "#";
    for (let i = 0; i<3; i++){
        result += hex(randint(min*255,max*255));
    }
    return result;
}
function progressColor(p) {
    let color = HSVtoRGB(p,1,0.8);
    return `#${hex(color.r)}${hex(color.g)}${hex(color.b)}`;
    //p ranges from 0 to 1
}
let Rcolor = "#7A1BBC"; //"#8C6F23"; //"#F5C344";
let Lcolor = "#1E4C40";
let Ccolor = "#75AFF1";
let Hcolor = "#CB8035";//"#C63361";

let canvas;
let graph;
let animation;

//--------------------------------------------------------------------------------
class Point {
    constructor(canvas,x,y,color,size=1) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.r = 0.4;
        this.color = color??"black";//progressColor(size);
        this.tail = {
            dx: 1.2*this.r * Math.cos(size*2*Math.PI),
            dy: 1.2*this.r * Math.sin(size*2*Math.PI),
            obj: this.canvas.paper.path("").attr({stroke:this.color, "stroke-width":0.1})
        };
        this.obj = this.canvas.paper.circle(0,0,this.r).attr({fill: this.color, stroke:""});// "stroke-width":0.05,stroke: "black"});
        this.place(this.x,this.y);
    }
    place(x,y) {
        this.x = x;
        this.y = y;
        x +=0.5;
        y +=0.5;
        this.obj.attr({cx:x, cy:y});
        this.tail.obj.attr("path",`M${x},${y}l${this.tail.dx},${this.tail.dy}`);
    }
    remove() {
        this.obj.remove();
        this.tail.obj.remove();
    }
    move() {
        let dir = randint(4);
        let dx = [1,0,-1,0][dir];
        let dy = [0,1,0,-1][dir];
        let nx = this.x + dx;
        let ny = this.y + dy;
        if ( nx<0 || nx>=this.canvas.Nx || ny<0 || ny>=this.canvas.Ny){
            if(nx>=0 && ny>=0){
            }
            return 1;}
        this.place(nx,ny);
        return 0;
    };
}
//================================================================================
class Canvas {    
    constructor(name) {
        this.$w = $(`#${name}`);
        this.W = this.$w.width();
        this.H = this.$w.height();
        this.maxAR = this.W/this.H; //how wide can it be versus tall?
        this.Nx = 10; //number of grid squares horizontally, should be even
        this.Ny = 10; //number of grid squares vertically
        this.N = 20;
        this.twoQ = false; 
        this.paper = Raphael(name,this.W,this.H);
        this.sides = {
            left: this.paper.rect(0,0,this.W/2,this.H).attr({fill:Lcolor,stroke:""}),
            right: this.paper.rect(this.W/2,0,this.W/2,this.H).attr({fill:Rcolor,stroke:""})
        };
        this.resize(this.Nx,this.Ny);
        this.border = {};
        this.bars = [];
        this.walkers = [[],[]]; //lists of walkers, cold and hot
        this.addPoint = this.addPoint.bind(this);
        this.setup();
    }
    setup() {
        this.clear();
        for(let n=0; n<this.N; n++){
            let x = randint(0,this.Nx/2);
            let y = randint(0,this.Ny);
            this.addPoint(x,y,false);
        }
    }
    resize(Nx,Ny) {
        this.Ny = Ny??this.Ny;
        this.maxNx = this.Ny * this.maxAR;
        this.paper.setViewBox(0,0,this.maxNx, this.Ny); //each grid space is 1x1
        Nx = Nx??this.Nx;
        this.Nx = Math.min(Nx,this.maxNx)??Nx;
        this.sides.left.attr({width:this.Nx/2, height:this.Ny});
        this.sides.right.attr({width:this.Nx/2, height: this.Ny, x: this.Nx/2});
        this.sides.left.toBack();
        this.sides.right.toBack();
        return this.Nx;
    }
    addPoint(x,y,hotQ=false){
        hotQ = hotQ + 0;
        let color = ["blue","red"][hotQ];
        if (!this.twoQ) {color=null;} //random colors
        let sz = 1 - (this.walkers[hotQ].length/this.N);
        this.walkers[hotQ].push(new Point(this,x,y,color,sz));
    }
    clear() {
        for (let ty of [0,1]) {
            for (let w of this.walkers[ty]){
                w.remove();
            }
        }
        this.walkers = [[],[]];
    }
};

//================================================================================
class Animation {
    constructor(canvas,graph) {
        this.canvas = canvas;
        this.graph = graph;
        this.step = this.step.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.reset = this.reset.bind(this);
        this.buttons = $("#buttons");
        this.$start = new Button("Start", this.start);
        this.$stop = new Button("Stop", this.stop);
        this.$reset = new Button("Reset", this.reset);
        this.$start.$w.appendTo(this.buttons);
        this.$stop.$w.appendTo(this.buttons);
        this.$reset.$w.appendTo(this.buttons);
    }
    
    start() {
        if(this.handle == undefined) {
            this.handle = setInterval(this.step,100);
        }
    }
    stop() {
        if (this.handle != undefined) {
            clearInterval(this.handle);
            this.handle = undefined;
        }
    }
    step() {
        let left=0;
        let iterations = Math.ceil(this.canvas.N / 20);
        iterations = 1;
        for (let ty=0; ty<=(this.canvas.twoQ+0); ty++){//cold and then maybe hot
            for(let w of this.canvas.walkers[ty]) {
                for (let i=0; i < (ty+1) * iterations; i++) { //hot particles move twice as much
                    w.move();
                }
                if (this.graph.active) {
                    left += (1+ty) * (w.x < this.canvas.Nx/2); //hot particles count for twice
                }
            }
        }
        if (this.graph.active) {
            this.graph.add(left);
        }
    }
    reset() {
        this.canvas.setup();
        this.graph.reset();
    }
}
function reset() {
    canvas.setup();
    graph.reset();
}
//================================================================================
class Graph {
    constructor() {
        this.$w = $("#graph");
        this.W = 600;
        this.H = 200;
        this.paper = Raphael("graph",this.W,this.H);
        this.axis = this.paper.path(`M${this.co(0,1)}L${this.co(0,0)}L${this.co(1,0)}`)
            .attr({"stroke-width":4,
                   "arrow-start":"classic",
                   "arrow-end":"classic"});
        //add grid lines next
        let gridattr = {"stroke-width":1, "stroke-dasharray":"."};
        let gridN=10.0; //number of grid lines
        this.gridN = gridN;
        this.matchT = 0;
        this.stdev = {N: 0,
                      S: 0,
                      SS: 0,
                      get: function() {
                          return Math.sqrt(this.SS/this.N - (this.S/this.N)**2);
                      },
                      clear: function() {
                          this.N = 0;
                          this.S = 0;
                          this.SS = 0;
                      }
                     };
        for(let i=1; i<=gridN; i++){
            let width = (i*2==gridN) ? {"stroke-width":2} : {};
            this.paper.path(this.M(0,i/gridN)
                            +this.L(1,i/gridN)).attr(gridattr).attr(width);
            this.paper.path(this.M(i/gridN,0)
                            +this.L(i/gridN,1)).attr(gridattr).attr(width);
        }
        
        this.lblfsize = 12;
        this.xlabels = this.makeLabels(0);
        this.ylabels = this.makeLabels(1);
        this.paper.text(...this.Co(0.5,0,0,-this.lblfsize*1.9),"time").attr({"text-anchor":"middle","font-size":1.5*this.lblfsize});
        let ypos = [this.lblfsize, this.Co(0,0.5)[1]];
        this.paper.text(...ypos,"# particles").attr({"font-size":1.5*this.lblfsize}).rotate(-90,...ypos);
        this.active = true;
        this.paper.setStart();
        this.paper.path("").attr({stroke: Lcolor,"stroke-width":2});
        this.paper.path("").attr({stroke: Rcolor,"stroke-width":2});
        this.curves = this.paper.setFinish();
        this.data = [[],[]]; //these are the coordinates that go into the path
        this.t = 0;
        this.dt = 1;
        this.Tmax = 100; //maximum time, grows over time
        this.Nmax = 100; //needs to be set somewhere, maybe in reset by Animation?
        this.setLabels();
        this.add(this.Nmax);
    }
    reset(Nmax) {
        if(Nmax) {this.Nmax = Nmax;}
        this.data = [[],[]];
        this.t = 0;
        this.Tmax = 100;
        this.add(this.Nmax);
        this.setLabels();
        this.stdev.N = 0;
        this.stdev.S = 0;
        this.matchT = 0;
        this.stdev.clear();
        $("#fluctuation").html("--");
        $("#tmatch").html("--");
    }
    makeLabels(yQ,skips=1) {
        let my = yQ;
        let mx = 1-yQ;
        let result = {};
        let adj = [{dx:0, dy:-10, anchor: "middle"}, {dx:-5, dy:0, anchor: "end"}][my];
        for (let i=skips; i<=this.gridN; i+=skips){
            let val = i/this.gridN;
            result[val] = this.paper.text(...this.Co(mx*val,my*val,adj.dx,adj.dy))
                .attr({"font-size":this.lblfsize,"text-anchor":adj.anchor, text:"xx"});
        }
        return result;
    }
    makePath(L) {
        //L is of the form [ [x0,y0], [x1,y1], [x2,y2], ...]
        let pfx = "M";
        let path = "";
        for(let [x,y] of L){
            let [X,Y] = this.Co((x/this.Tmax),(y/this.Nmax)).map(fix);
            path += `${pfx}${X},${Y}`;
            pfx = "L";
        }
        return path;
    }
    draw(){
        for(let i of [0,1]) {
            let line=this.curves[i];
            let path = this.makePath(this.data[i]);
            this.curves[i].attr("path",path);
        }
    }
    add(left) {
        let val = left;
        if (!this.matchT && left<=this.Nmax/2) {this.matchT = this.t; $("#tmatch").html(this.t);}
        if(this.matchT) {
            this.stdev.N += 1;
            this.stdev.S += val;
            this.stdev.SS += val*val;
            $("#fluctuation").html((this.stdev.get()/this.Nmax*100).toFixed(1)+"%");
        }
        this.data[0].push([this.t, val]);
        this.data[1].push([this.t, this.Nmax-val]);
        this.draw();
        this.t += this.dt;
        this.adjustTime();
    }
    setLabels() {
        for (let x in this.xlabels){
            this.xlabels[x].attr("text",this.Tmax*x);
        }
        for (let y in this.ylabels){
            this.ylabels[y].attr("text",this.Nmax*y);
        }
    }
    adjustTime() {
        if (this.t > this.Tmax) {
            this.Tmax *= 2;
            this.setLabels();
        }
    }
    M(x,y) {return `M${this.co(x,y)}`;}
    L(x,y) {return `L${this.co(x,y)}`;}
    Co(x,y,dx,dy) {return this.co(x,y,dx,dy).split(" ").map(Number);}
                        
    co(x,y,dx=0,dy=0) {
        //input: x and y between 0 and 1
        //output: coordinates in the Raphael box
        //returns as a space-delimited string
        //dx and dy are adjustments in pixels, although dy is reversed so that down is negative
        this.Mpad = 60;
        this.mpad = 10;
        let X = Number((x*(this.W-this.Mpad-this.mpad) + this.Mpad+dx).toPrecision(8));
        let Y = Number(((1-y)*(this.H-this.Mpad-this.mpad) + this.mpad - dy).toPrecision(8));
        return `${X} ${Y}`;
    }
}
function fix(n) {
    return n.toPrecision(8).replace(/0+$/,"");
}
//================================================================================
class Slider {
    constructor($root, label, prams, fn){
        this.fn = fn;
        let $w = $("<div>").addClass("slider").appendTo($root);
        let $label = $("<span>").addClass("label").html(label+": ").appendTo($w);
        this.$value = $("<span>").addClass("value").html(".").appendTo($w);
        this.$slider = $(`<input type="range" min=${prams.min} max=${prams.max} step=${prams.step} value=${prams.default}>`).appendTo($w);

        /*
        let $w = $("<tr>").appendTo($root);
        $("<td>").html(label+":").appendTo($w);
        let td = $("<td>").appendTo($w);
        this.$value = $("<span>").html(".").appendTo(td);
        td = $("<td>").appendTo($w);
        this.$slider = $(`<input type="range" min=${prams.min} max=${prams.max} step=${prams.step} value=${prams.default}>`).appendTo(td);
        this.$slider.addClass("slider");
        */
        this.update = this.update.bind(this);
        this.$slider.on("input",this.update);
        this.update();
    }
    val() {
        return this.$slider.val();
    }
    update() {
        let val = this.$slider.val();
        this.$value.html(val);
        if(this.fn) {this.fn(val);}
        animation.reset();
    }
}
//================================================================================
let init = () => {
    canvas = new Canvas("diffusion");
    graph = new Graph();
    graph.reset(canvas.N);
    animation = new Animation(canvas,graph);
    let $controls = $("#controls");
    new Slider($controls, "# Particles",{min: 100, max: 1000,step: 100, default: 100},
               (N)=>{
                   graph.reset(N);
                   canvas.N = N;
               });
    new Slider($controls, "Width", {min: 2, max: 40, step: 2, default: 10},
               (width) => {canvas.resize(width,undefined);}
              );
    new Slider($controls, "Height", {min: 2, max: 40, step: 1, default: 10},
               (height) => {canvas.resize(undefined, height);}
              );
    $("#stats").appendTo($controls);
    new Help($("#help"),"toggle");

};

$(init);
