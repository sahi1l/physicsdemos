let paper;
let W=400;
let H=200;
let vw=5;
let t=0; let dt=0.1;
let cnt=0; let cntmax=30; //number of tics between each wave
//dt*cntmax is the period of the wave
let wavefronts = [];
let car;
let lEar,rEar;
let handle;
let audiocontext = new AudioContext();
function beep(f){
    let oscillator = audiocontext.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = f;
    oscillator.connect(audiocontext.destination);
    oscillator.start(); 
    oscillator.stop(audiocontext.currentTime+0.1);
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
        if (this.r > Math.hypot(W,H)/2) { 
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
        this.obj.click(()=>{this.togglebeep();});
	this.f0 = 100;
        this.txt = paper.text(this.x,this.y+30,"").attr({"font-size":14});
        this.clear();
        this.togglebeep.bind(this);
    }
    setfreq(){
	let f;
        if (vw==this.sign*car.v) {
            f = "∞";
        } else {
            f = car.f0 * vw/(vw-this.sign*car.v);
            f = f.toFixed(0);
        }
	this.txt.attr("text",`${f}Hz`);
    }
    togglebeep(){
        this.beepon = !this.beepon;
        let bw = this.beepon?3:1;
        this.obj.attr("stroke-width",bw);

    }
    light(x){
        if (Math.abs(x-this.x)<1){
            this.obj.attr({fill:"blue"});
            if(this.beepon){beep(this.f);}
        }
    }
    clear(){
        this.obj.attr({fill:"white"});
    }
}
class Car {
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
        this.obj.click(()=>{this.togglebeep();});
        this.togglebeep.bind(this);
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
        this.obj.attr({fill:"blue"});
        if(this.beepon){beep(200);}
    }
}
function animate(){
    lEar.clear();
    rEar.clear();
    car.clear();
    for (let wf of wavefronts){
        let r = wf.draw(t);
        if (r) {
            rEar.light(wf.x+r);
            lEar.light(wf.x-r);
        }
    }
    car.draw(t);
    t += dt;
    cnt += 1;
    if (cnt>cntmax){
        car.add_wave(t);
        cnt=0;
    }
    
    if (car.x(t)>W/2+rEar.x || car.x(t)<lEar.x-W/2){
        stop();
    }
}
function start(){
    while (wavefronts.length){
        wavefronts.pop().delete();
    }
    console.debug(wavefronts);
    stop();
    t=0;
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
    console.debug("W,H,size=",W,H,size);
}
function init(){
    let $root = $("main"); //.css({"width":400,"border":"1px solid black"});
    let $canvas = $("#canvas");
    adjustSize();
    let canvas = $canvas[0];
    paper = Raphael(canvas,"100%","100%");
    paper.setViewBox(0,0,W,H);
    car = new Car(W/2,H/2,0);
    //    let f = cntmax*dt
    //cntmax*dt is the amount of time between each wavefront
    let lambda = vw*cntmax*dt;
    //the 0.45 is tuned to make the ears and center in sync
    //except no, I need to adjust in a different way
    let earDelta = (Math.floor(W/2/lambda))*lambda-15;

        //70 * cntmax * dt;
    console.debug(lambda,earDelta);
    lEar = new Ear(W/2 - earDelta,H/2,400,-1);
    rEar = new Ear(W/2 + earDelta,H/2,600,+1);
    console.log(lEar.x);
    console.log(rEar.x);
    console.debug($(".under").css("display"));
    let $controls = $("#controls");
    let $start = $("#start").click(start);
    let $stop = $("#stop").click(stop);
    let $carvel = $("#carvel");
    $carvel.on("input", ()=>{
        car.v=vw*$carvel.val();
        $("#carvelValue").html($carvel.val());
        start();});
    start();
}
$(init);
