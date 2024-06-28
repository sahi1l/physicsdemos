/*global $,Raphael*/
let $main;
let paper;
let maxes = {
    weight: 40,
    tension: 40,
    muS: 1
};
let dim = {
    W: 100,
    H: 100,
    baseY: 70,
    block: {
        width: 30,
        height: 30,
        cX: 50,
    },
    rope: {
        right: 100,
        height: 3,
    },
}
let objects = {};
function appendTspan(node,text,cls){
    let tspan = document.createElementNS('http://www.w3.org/2000/svg','tspan');
    tspan.setAttribute("dy","0px");
    tspan.classList.add(cls);
    tspan.innerHTML=text;
    node.appendChild(tspan);
    return tspan;
}
let background;
class Background {
    constructor(){
        this.v = 0;
        this.a = 0;
        this.running = false;
        this.interval = null;
        this.shift = 0;
        this.root = $(".moving");
        this.step = this.step.bind(this);
    }
    start(a,v) {
        this.a = a;
        objects.acceleration.change(a);
        if(this.interval==null) {
            this.v = v??0;
            this.interval = setInterval(this.step.bind(this),100);
        }
    }
    step() {
        this.v += objects.acceleration.get() * 0.1;
        console.debug(this.v);
        this.v = Math.min(25,this.v);
        this.shift += this.v * 1;
        this.shift = this.shift % 100;
        if(this.v<=0){SwitchToStatic();}
        this.root.each((i,w)=>{w.style.backgroundPositionX = this.shift+"%";});
    }
    stop() {
        if(this.interval) {clearInterval(this.interval);}
        this.interval = null;
        this.dt = null;
    }
}
class FrictionScale {
    constructor(left,right,y) {
        this.left = left;
        this.right = right;
        this.y = y;
        this.width = right-left;
        let fsize = 4;
        this.maxV = maxes.weight * maxes.muS;
        paper.setStart();
        this.base = paper.rect(this.left,this.y,this.width,2).attr({fill:"white","stroke-width":0.5});
        this.fill = paper.rect(this.left,this.y,this.width/2,2).attr({fill:"blue",stroke:""});
        this.max = paper.text(this.left + this.width/2, this.y+1.5*fsize, "|\n20N")
            .attr({fill:"blue","font-size":fsize});
        this.current = paper.path("").attr({stroke:"blue","arrow-end":"classic"})
        this.all = paper.setFinish();
        this.draw(10,30);

        ;
    }
    draw(cur,max) {
        let Xmax = this.left + max/this.maxV * this.width;
        let Xcur = this.left + cur/this.maxV * this.width;
        let midY = (this.y +objects.friction.bottom)/2;
        console.debug(Xmax,Xcur);
        this.fill.attr({width: Xmax - this.left});
        this.max.attr({x: Xmax,text: `|\nSmax=${Number(max).toFixed(1)}N`});
        this.current.attr({path: `M${objects.friction.data.cx},${objects.friction.bottom}
                                   L${objects.friction.data.cx},${midY}
                                   L${Xcur},${midY}
                                   L${Xcur},${this.y-1}`});
    }
    toggle(onQ) {
        if(onQ) {
            this.all.show();
        } else {
            this.all.hide();
        }
    }
}
let ready = false; //don't call Calculate until all objects are defined
let movingQ = false;
function Calculate() {
    if (!ready) {return;}
    objects.normal.change(objects.weight.get());
    let Smax = objects.weight.get() * objects.muS.get();
    let K = objects.weight.get() * objects.muK.get();
    let T = objects.tension.get();
    objects.friction.scale.draw(T,Smax);
    if(movingQ) {
        if(T<Smax){
            $brake.show();
        }
        objects.friction.change(K);
        objects.acceleration.change((T-K)/objects.weight.get());
    } else {
        $brake.hide();
        objects.friction.change(T);
    }
    if(T>Smax){
        SwitchToKinetic();

    } else if(movingQ && background.v<0) {
        SwitchToStatic();
    }
}
function SwitchToKinetic() {
    //Hide the static friction slider
    objects.friction.scale.toggle(false);
    objects.friction.label.attr("text","Kinetic\nFriction");
    movingQ = true;
    let T = objects.tension.get();
    let K = objects.muK.get() * objects.weight.get();
    let a = (T-K)/objects.weight.get();
    objects.acceleration.change(a);
    background.start(a);
    objects.friction.recolor("red");
    $("#static").hide();
    $("#kinetic").show();
    
}
function SwitchToStatic() {
    objects.friction.scale.toggle(true);
    objects.friction.label.attr("text","Static\nFriction");
    movingQ = false;
    background.stop();
    objects.acceleration.change(0);
    objects.friction.recolor("blue");
    $("#static").show();
    $("#kinetic").hide();
    Calculate();
}
class Slider {
    constructor(data){
        //        title,units,left,top,width,min,max,initial)
        this.width = data.width;
        this.units = data.units??"";
        this.callback = data.callback;
        this.lineheight = 3;
        this.sliderQ = data.sliderQ??true;
        this.width = data.width ?? this.lineheight*7;
        this.x = data.cx-this.width/2;
        this.y = data.top+1;
        this.left = this.x;
        this.right = this.x + this.width;
        this.bottom = this.y + this.lineheight*5;
        this.color = data.color??"black";
        this.label = paper.text(this.x+this.width/2, this.y+0.6*this.lineheight, data.title)
            .attr({"font-size":1.5*this.lineheight,fill:this.color});
        this.data = data;
        this.precision = data.precision??1;
        this.val = data.init??0;
        if(this.sliderQ) {
            let sliderdata = {
                x: this.x,
                y: this.y + 1.2*this.lineheight,
                w: this.width,
                h: 1*this.lineheight};
            this.$S = $(`<input type=range value=${this.val} min=${data.min} max=${data.max}> step=${data.step}`).appendTo("#canvas");
            this.S = this.$S[0];
            this.S.style.color = this.color;
            this.S.style.position = "absolute";
            let bbrect = $("#canvas")[0].getBoundingClientRect();
            this.S.style.top = (sliderdata.y/100*bbrect.width)+"px";
            this.S.style.left = (sliderdata.x/100*bbrect.height)+"px";
            this.S.style.width = (sliderdata.w/100*bbrect.width)+"px";
            this.$S.on("input",this.change.bind(this));
        }
        let gap = 4*this.lineheight;
        if(data.smallgap){
            gap=3*this.lineheight;
        }
        this.value = paper.text(this.x+this.width/2, this.y + gap,data.initial)
            .attr({"font-size":this.lineheight*2,fill: this.color});
        appendTspan(this.value.node,this.units,"units");

        this.change();
    }
    get() {
        let result = this.val;
        if(this.sliderQ) {result=this.$S.val();}
        if(this.data.displayfn){
            return this.data.displayfn(result);
        } else {
            return result;
        }
    }
    recolor(color) {
        this.color = color;
        this.label.attr({fill:color});
        this.value.attr({fill:color});
        this.arrow.attr({stroke:color});
    }
    setupArrow(path,cb) {
        this.arrow = paper.path(path);
        this.arrow.attr({"arrow-end":"classic",stroke:this.color});
        let scale=this.data.max-this.data.min;
        console.debug(this.data,scale);
        this.callback = (v,that) => {
            console.debug(that.data.title,":",v);
            that.arrow.attr({"stroke-width":1+1.5*Number(v)/scale});
            if(cb){cb(Number(v));}
        }
        this.change();
    }
    change(val) {
        this.val = val??0;
        let value = Number(this.get()).toFixed(this.precision);
        if(this.data.compact) {
            this.label.attr("text",this.data.title + "=" + value + this.units);
            this.value.attr("text","");
        } else {
            this.value.attr("text",value);
            appendTspan(this.value.node,this.units,"units");
        }
        if(this.callback) {
            this.callback(value,this);
        }
    }
};
let $brake;
function init(){
    background = new Background();
    $brake = $("#brakebutton");
    $brake.on("mousedown",()=>objects.acceleration.change(-5));
    $brake.hide();
    $("#table")[0].style.height = (100-dim.baseY)+"%";
    paper = Raphael("canvas","100%","100%");
    paper.setViewBox(0, 0, dim.W, dim.H);
    objects.floor = paper.rect(0,dim.baseY,dim.W,100-dim.baseY)
        .attr({stroke:"black","stroke-width":1,fill: ""});
    dim.block.top = dim.baseY - dim.block.height;
    dim.block.left = dim.block.cX - dim.block.width/2;
    dim.block.right = dim.block.cX + dim.block.width/2;
    objects.box = paper.rect(dim.block.left,
                             dim.block.top,
                             dim.block.width,
                             dim.baseY - dim.block.top)
        .attr({"fill": "white"});
    objects.rope = paper.rect(
        dim.block.right, (dim.baseY+dim.block.top)/2,
        dim.rope.right - dim.block.right,
        dim.rope.height)
        .attr({"stroke-width":0.5,
               "fill":"SaddleBrown"});

    objects.weight = new Slider({
        title:"Weight",
        units:"N",
        cx: dim.block.cX,
        top: dim.block.top,
        min: 1,
        init: 20,
        precision: 0,
        max: maxes.weight});
    objects.weight.setupArrow(
        `M${dim.block.cX},${objects.weight.bottom}L${dim.block.cX},${dim.baseY-5}`,Calculate);
    objects.normal = new Slider({
        title: "Normal",
        units:"N",
        cx: dim.block.cX,
        top: dim.baseY+9,
        sliderQ: false,
        min: 1,
        max: 40,
        smallgap: true,
        precision: 0});
    objects.normal.setupArrow(`M${dim.block.cX},${dim.baseY+10},L${dim.block.cX},${dim.baseY+1}`);
    objects.tension = new Slider({
        title: "Tension",
        units: "N",
        cx: (dim.rope.right + dim.block.right)/2,
        top: dim.block.top - 0.3*dim.block.height,
        min: 0,
        precision: 0,
        max: maxes.tension,
        init: 0,
        color: "darkred"
    });
    objects.tension.setupArrow(
        `M${objects.tension.x},${objects.tension.bottom+3}l20,0`,Calculate
    );

    objects.friction = new Slider({
        title: "Static\nFriction",
        units: "N",
        cx: (dim.block.cX - dim.block.width),
        top: dim.baseY - 0.8*dim.block.height,
        sliderQ: false,
        color: "blue",
    });
    let fricarrow = {
        right: dim.block.left,
        left: objects.friction.left,
    };
    objects.friction.setupArrow(
        `M${dim.block.left},${(dim.baseY+dim.block.top)/2}l${-dim.block.left+objects.friction.left},0`);
    objects.acceleration = new Slider({
        title: "Acceleration",
        units: "g",
        cx: dim.block.cX,
        top: 20,
        sliderQ: false,
        color: "purple",
        smallgap: true,
    });
    objects.acceleration.setupArrow(`M50,28l20,0`,
                                    (v)=>{
                                        if(v){
                                            objects.acceleration.arrow.attr("path",`M${dim.block.cX},${dim.baseY-52}l${Math.min(30,v*10)},0`);} else {objects.acceleration.arrow.attr("path","");}});

    objects.muback = paper.rect(65,dim.baseY+1,30,98-dim.baseY).attr({opacity: 0.8,fill: "white",stroke:""});
    objects.muS = new Slider({
        title: "µS",
        units: "",
        cx: 80,
        top: 75,
        min: 0,
        max: maxes.muS*10,
        init: 8,
        displayfn: (x)=>(0.1*x).toFixed(1),
        callback: Calculate,
        compact: true,
        color: "blue"
    });
    objects.muK = new Slider({
        title: "µK",
        units: "",
        cx: 80,
        top: objects.muS.data.top + 10,
        min: 0,
        max: maxes.muS*10,
        init: 5,
        displayfn: (x)=>(0.1*x).toFixed(1),
        callback: Calculate,
        compact: true,
        color: "red"
    });

    objects.friction.scale = new FrictionScale(objects.friction.left,dim.block.left,dim.baseY+12);
    ready = true;
    Calculate();
    objects.acceleration.value.node.id="acceleration";
}

$(init);
