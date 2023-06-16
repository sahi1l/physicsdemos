let paper;
let W=1000;
let H=300;
let Ndots=500;
let border=100;
let radius=5;
let dots=[];
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
    addLines();
}
function move(t){
    let x; let y;
        
    for (var dot of dots){
        var D=prams.amplitude*Math.cos(2*Math.PI*((dot.x0-border)/prams.wavelength-t*prams.frequency));
        if(prams.transverse===true){
            x=dot.x0;
            y=H/2+D;
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
        this.$w.on("click",this.setup);
        this.dots = paper.set(); //was highlights
        this.coords = [];
        this.lines = paper.set();
    }
    addDot(dot) {
        this.dots.push(dot);
        this.coords.push({x:dot.attr("cx"),y:dot.attr("cy")});
        dot.toFront();
    }
    getPath(x1,y1,x2,y2){
        return `M${x1},${y1}L${x2},${y2}`;
    }
    setup() {
        //make the dots red and add the lines, or remove
        this.lines.remove();
        if (this.active()) {
            this.dots.attr("fill","red");
            for (let co of this.coords) {
                let line = paper.path();
                this.lines.push(line);
                let path;
                let A = prams.amplitude;
                if (prams.transverse) {
                    path = this.getPath(co.x, co.y + A, co.x, co.y - A);
                } else {
                    path = this.getPath(co.x+A, co.y, co.x-A, co.y);
                }
                this.line.attr({path: path});
            }
        } else {
            this.dots.attr("fill","black");
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
function init(){
    paper=Raphael("canvas",W,H);
    $("#canvas").height(H);
    $("#canvas").width(W);
    dots=[];
    let HI = new Highlighted();
    for (let pram of ["wavelength","frequency","amplitude"]) {
        let $w = $(`#${pram}`);
        $w.on("input",(e,$w_ = $w, pram_=pram)=>{prams[pram_] = $w_.val();move(0);});
        $w.trigger("input");
    }
    $("input[name='type']").on("input",(e)=>{
        console.debug("clicked",e.currentTarget.value);
        prams.transverse = (e.currentTarget.value=="true");
        move(0);
    });
    console.debug("prams.transverse=",prams.transverse);


    hilines = paper.set();
    for(let i=0;i<Ndots;i++){
        let x=i/Ndots*(W-2*border)+border;
        let y=Math.random()*50-25+H/2;
        let O={obj:paper.circle(x,y,radius).attr({fill:"black"}),
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
