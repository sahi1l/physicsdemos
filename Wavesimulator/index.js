import {choose} from "../lib/default.js";
import Button from "../lib/buttons.js";
let paper;
let W=800;
let H=300;
let Ndots=500;
let border=10;
let radius=5;
let dots=[];
let colors = ["gold","green","blue","purple","brown","pink"];
let HI;
let prams = {"wavelength":200,
             "frequency": 1,
             "amplitude": 20,
             "transverse": true,
            };
//let wavelength=200;
//let frequency=1;
//let amplitude=20;
//let transverse=true;
//let highlight=false;
let time=0;
let dt=0.1;
let stoppedQ=false;
function run(){
    if(!stoppedQ){
        move(time);
        time+=dt;
        setTimeout(run,100);
    } else {stoppedQ=0;}
};
function changeSettings(){
    if (stoppedQ) {
        move(0);
    }
    HI.setup();
}
function move(t){
    let x; let y;
        
    for (var dot of dots){
        var D=prams.amplitude * Math.cos(2*Math.PI*((dot.x0-border)/prams.wavelength-t*prams.frequency));
        if(prams.transverse===true){
            x=dot.x0;
            y=dot.y0+D;
        } else {
            x=dot.x0+D;
            y=dot.y0;
        }
        dot.obj.attr({cx:x,cy:y});
    }
}
class Highlighted {
    constructor(){
        this.$w = $("#highlight");
        this.setup = this.setup.bind(this);
        this.$w.on("click",this.setup);
        this.dots = paper.set(); //was highlights
        this.coords = [];
        this.lines = paper.set();
    }
    addDot(dot) {
        this.dots.push(dot);
        dot.attr({"fill":"red"});
        this.coords.push({x:parseFloat(dot.attr("cx")),y:parseFloat(dot.attr("cy"))});
        dot.toFront();
    }
    getPath(x1,y1,x2,y2){
        return `M${x1},${y1}L${x2},${y2}`;
    }
    setup() {
        //make the dots red and add the lines, or remove
        console.debug("running setup");
        this.lines.remove();
        if (this.active()) {
//            this.dots.attr({fill:"white", stroke:"black", "stroke-width":3});
            for (let co of this.coords) {
                
                let line =
                    paper.rect(0,0,0,0).attr({stroke:"black","stroke-width":5});
                    //paper.path("M0,0").attr({stroke:"black", "stroke-width":5});
                this.lines.push(line);
                let path;
                let w = 4;
                let A = parseFloat(prams.amplitude);
                if (prams.transverse) {
                    line.attr({x: co.x-w, y: co.y-A, width: 2*w, height: 2*A});
//                    path = this.getPath(co.x, co.y + A, co.x, co.y - A);
                } else {
                    line.attr({y: co.y-w, x: co.x-A, height: 2*w, width: 2*A});
//                    path = this.getPath(co.x+A, co.y, co.x - A, co.y);
                }
//                line.attr({path: path});
                line.toFront();
                
            }
            this.dots.toFront();
        } else {
//            this.dots.attr("fill",choose(colors));
        }
    }
    active(val) {
        if (val === undefined) {
            return this.$w[0].checked;
        } else {
            this.$w[0].checked = val;
            this.setup();
            return null;
        }
    }
}

/*
  function addLines(e){
    console.debug("Running addLines");
    let hiQ = e;
    if (hiQ == undefined) {
        hiQ = prams.highlight;
    } else if (hiQ !== true && hiQ !== false){
        hiQ= e.currentTarget.checked;
    }
    prams.highlight = hiQ;
    for (let h of highlights) {h.attr("fill","black");}
    hilines.remove();

    console.debug("addlines",prams.highlight);
    if(!prams.highlight==true){return;}

    console.debug("adding lines");
    for (let h of highlights) {h.attr("fill","red");}
    let lattr = {"stroke-dasharray":"-",stroke:"red"};
    paper.setStart();
    for (let O of highlights) {
        console.debug(O);
        let x = O.attr("cx");
        let y = O.attr("cy");
        let path;
        if (prams.transverse) {
            path =  `M${x},${H/2+prams.amplitude}L${x},${H/2-prams.amplitude}`;
        }
        else {
            path = `M${x+prams.amplitude},${y}L${x-prams.amplitude},${y}`;
        }
        console.debug(path);
        paper.path(path).attr(lattr);
    }
    hilines = paper.setFinish();
    console.debug(hilines);
    }
*/
function rs(onQ,e) {
    if(onQ) {stoppedQ=0; run();}
    else {stoppedQ=1;}
}
function init(){
    paper=Raphael("canvas",W,H);
    $("#canvas").height(H);
    $("#canvas").width(W);
    dots=[];
    HI = new Highlighted();
    for (let pram of ["wavelength","frequency","amplitude"]) {
        let $w = $(`#${pram}`);
        $w.on("input",(e,$w_ = $w, pram_=pram)=>{
            prams[pram_] = parseFloat($w_.val());move(0);
            changeSettings();
        });
        $w.trigger("input");
    }
    $("input[name='type']").on("input",(e)=>{
        prams.transverse = (e.currentTarget.value=="true");
        changeSettings();
    });
    let runstop = new Button(["Run","Stop"], rs, false).$w.appendTo($("#runstop"));
    for(let i=0;i<Ndots;i++){
        let x=i/Ndots*(W-2*border)+border;
        let y=Math.random()*50-25+H/2;
        
        let O={obj:paper.circle(x,y,radius).attr({fill:choose(colors)}),
               x0:x,
               y0:y};
        dots.push(O);
        if(i%100==50){
            HI.addDot(O.obj);
        }
        else {O.obj.toBack();}
    }
    move(0);
    
    
}
$(init);
