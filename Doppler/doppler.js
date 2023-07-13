import { HelpTour } from "../lib/help.js";
let paper;
let W=450;
let H=200;
let vw=5;
let t=0; let dt=0.1;
let cnt=0; let cntmax=30; //number of tics between each wave
//dt*cntmax is the period of the wave
let wavefronts = [];
let source;
let lEar,rEar;
let handle;
let help;
let srccolor = "red";
let earcolor = "blue";
let audiocontext = new AudioContext();
function setupOscillator(f,that){
    that.oscillator = audiocontext.createOscillator();
    that.oscillator.type = "triangle";
    that.oscillator.frequency.value = f;
    that.oscillator.connect(audiocontext.destination);
}
function beep(f,that){
    that.oscillator.start();
    that.oscillator.stop(audiocontext.currentTime+0.05);
    setupOscillator(f,that);
}
class Wavefront {
    constructor(x,y,t) {
        this.x = x; //the initial x position of the wavefront
        this.y = y; //the initial y position of the wavefront
        this.t0 = t; //the time the wavefront starts
        this.obj = paper.circle(this.x,this.y,0);
        this.r = 0;
        this.active = true;
        this.obj.toBack();
    }
    draw(t){
        if (!this.active) {return null;}
        let r=0;
        if (t>this.t0){
            this.r = vw*(t-this.t0);
        }
        if (this.r > Math.max(W,H/2)) {
            this.active = false;
            this.delete();
            return null;
        }
        this.obj.attr({r:this.r});
        return this.r;
    };
    delete() {
        this.obj.remove();
    }
}
class Ear {
    constructor(x,y,soundHz,sign){
        this.height = 30;
        this.width = 10;
        this.x = x;
        this.y = y;
	this.sign = sign;
        this.f = soundHz??400;
        this.beepon = false;
        this.obj = paper.rect(this.x-this.width/2,this.y-this.height/2,this.width,this.height);
        this.togglebeep = this.togglebeep.bind(this);
        this.obj.click(()=>{help.hide();this.togglebeep();});
	this.f0 = 100;
        this.txt = paper.text(this.x,this.y+30,"").attr({"font-size":14});
        this.clear();
        this.togglebeep.bind(this);
        this.drag = this.drag.bind(this);
        this.sdrag = this.sdrag.bind(this);
        this.edrag = this.edrag.bind(this);
        this.obj.drag(this.drag,this.sdrag,this.edrag);
        this.nobeep=false;
        this.oscillator=null;
        setupOscillator(this.f,this);
        help.addText(x,y-this.height,"Observer",earcolor,"middle")
            .node.style.fontWeight = 'bold';
        help.addVArrow(x,y+60,y+40,earcolor,1);
        help.addText(x+this.sign*35,y+85,"The frequency\nI hear.",earcolor,this.sign<0?"start":"end");
        help.addHArrow(y,x-30,x+30,earcolor);
        help.addText(x,y-10,"(drag me)",earcolor,"middle").node.style["font-size"]="12px"
    }
    sdrag(x,y) {
        this.ox = this.x;
        if (this.x>W/2) {this.osign=1;} else {this.osign=-1;}
    }
    drag(dx,dy,x,y){
        if (Math.abs(dx)>2) {this.nobeep = true;}
        let earDelta = this.osign*((this.ox + dx) - W/2);
        moveEars(earDelta);
    }
    edrag() {
        setTimeout((t=this)=>{t.nobeep=false},500);
    }
    move(x) {
        this.x = x;
        this.obj.attr({x:this.x-this.width/2});
        this.txt.attr({x:this.x});
    }
    setfreq(){
	let f;
        if (vw==this.sign*source.v) {
            f = "∞";
        } else {
            f = source.f0 * vw/(vw-this.sign*source.v);
            f = f.toFixed(0);
        }
	this.txt.attr("text",`${f}Hz`);
    }
    togglebeep(){
        if(this.nobeep){return;}
        this.beepon = !this.beepon;
        let bw = this.beepon?3:1;
        this.obj.attr("stroke-width",bw);

    }
    light(x){
        if (Math.abs(x-this.x)<2){
            this.obj.attr({fill:earcolor});
            if(this.beepon){beep(this.f,this);}
        }
    }
    clear(){
        this.obj.attr({fill:"white"});
    }
}
class Source {
    constructor(x,y,v){
        this.x0 = x;
        this.y = y;
        this.v = v;
        this.r = 8;
        this.width = 12;
        this.height = 8;
        this.beepon = false;
	this.f0 = 100;
        this.obj = paper.circle(this.x0, this.y,this.r).attr({fill:"black"});
	this.txt = paper.text(this.x0,this.y+30,`${this.f0}Hz`).attr({"font-size":14});
	
        this.togglebeep = this.togglebeep.bind(this);
        this.obj.click(()=>{help.hide();this.togglebeep();});
        this.togglebeep.bind(this);
        this.clear = this.clear.bind(this);
        this.oscillator=null;
        setupOscillator(200,this);
        help.addText(this.x0,this.y-20,"Source",srccolor,"middle").node.style.fontWeight = 'bold';
        help.addVArrow(this.x0,this.y+60,this.y+40,srccolor,1);
        help.addText(this.x0,this.y+85,"The frequency\nI produce",
                     srccolor,"middle");
    }
    togglebeep(){
        this.beepon = !this.beepon;
        let bw = this.beepon?3:1;
        this.obj.attr("stroke-width",bw);

    }

    clear(){
        this.obj.attr({fill:"white"});
    }
    x(t){ 
        return  this.x0+this.v*t;
    }       
    draw(t){
        this.obj.attr({cx:this.x(t)});
    }
    add_wave(t){
        wavefronts.push(new Wavefront(this.x(t),this.y,t));
        this.obj.attr({fill:srccolor});
        if(t>0 && this.beepon){beep(200,this);}
    }
}
function animate(){
    lEar.clear();
    rEar.clear();
    source.clear();
    for (let wf of wavefronts){
        let r = wf.draw(t);
        if (r) {
            rEar.light(wf.x+r);
            lEar.light(wf.x-r);
        }
    }
    source.draw(t);
    t += dt;
    cnt += 1;
    if (cnt>cntmax){
        source.add_wave(t);
        cnt=0;
    }
        if (source.x(t) > (rEar.x+source.r) || source.x(t)< (lEar.x-source.r)){
//    if (source.x(t)<-source.r || source.x(t)>W+source.r){ //no because the ear doesn't get waves from behind
        stop();
    }
}
function start(){
    while (wavefronts.length){
        wavefronts.pop().delete();
    }
    stop();
    t=t%(cntmax*dt);
    for(let t=-10; t<1; t++){
        source.add_wave(t*dt*cntmax);
    }
    lEar.setfreq();
    rEar.setfreq();
    handle = setInterval(animate,20);
}
function stop() {
    if (handle){
        clearInterval(handle);
        handle = null;
    }
}
function adjustSize() {
    let Y = $("#canvas").position().top;
    let size = 0.8*Math.min($(window).width()/2,$(window).height()-Y);
    H = size;
    W = size*2;
    $("#canvas").css({width: W,height:H});
}
function moveEars(earDelta) {
    let lambda = vw*cntmax*dt;
    lEar.move(W/2-earDelta);
    rEar.move(W/2+earDelta);
}
function init(){
    let $root = $("main");
    let $canvas = $("#canvas");
    adjustSize();
    let canvas = $canvas[0];
    paper = Raphael(canvas,"100%","100%");
    paper.setViewBox(-5,0,W+10,H);
    help = new HelpTour(paper,20);
    source = new Source(W/2,H/2,0);

    //cntmax*dt is the amount of time between each wavefront
    let lambda = vw*cntmax*dt;
    let earDelta = (Math.floor(W/2/lambda)-2)*lambda;

        //70 * cntmax * dt;
    lEar = new Ear(W/2 - earDelta,H/2,400,-1);
    rEar = new Ear(W/2 + earDelta,H/2,600,+1);
    let $controls = $("#controls");
    let $start = $("#start").click(start);
    let $stop = $("#stop").click(()=>{help.hide();stop();});
    let $carvel = $("#carvel");
    $carvel.on("input", ()=>{
        help.hide();
        source.v=vw*$carvel.val();
        $("#carvelValue").html(Math.abs($carvel.val()));
        if($carvel.val()==0) {
            $("#direction").html("");
            $("#vw").hide();
        } else {
            $("#direction").html($carvel.val()>0?"&rarr;":"&larr;");
            $("#vw").show();
        }
        start();});
    $("#vw").hide();
    start();
}
$(init);
