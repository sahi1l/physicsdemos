let W=600, H=400;
let paper;
let mirror=1;
let scale=30;
let objwidth = 20; //width of the object
let device,axis,focus,obj,img,rays;
let deviceX = W/2;
let axisY = H/2;
let help;
let colors = {
    "object": "red",
    "image": "cyan",
    "focus": "black",
    "device": "gray",
    "topray": "orange",
    "cenray": "blue",
    "botray": "green"
};

function C2S(x,y){
    return {x:deviceX - x*scale, y:axisY-y*scale};
};
function S2C(x,y){
    return {x:(deviceX-x)/scale,y:(axisY-y)/scale};
};
function linepath(x0,y0,x1,y1,relative=false) {
    if (relative) {
        return `M${x0},${y0}l${x1},${y1}`;
    } else {
        return `M${x0},${y0}L${x1},${y1}`;
    }
}
function raypath(my){
    let mul=1;
    let x0=C2S(obj.p,0).x;
    let y0=C2S(0,obj.h).y;
    let x1=device.x;
    let y1=C2S(0,obj.h).y;
    let x2=C2S(-device.type*img.i,0).x;
    let y2=C2S(0,-img.h).y;
    return Raphael.format(
        "M{0},{1}L{2},{3}L{4},{5}",
        x0, y0,
        x1, y1,
        x1+(x2-x1)*mul, y1+(y2-y1)*mul
    );
}
//================================================================================
class Device {
    constructor() {
        let width=10;
        let gap=20;
        this.x = deviceX;
        this.type=-1; //1 for mirror, -1 for lens
        paper.setStart();
        let fontstyle = {"font-size":24,cursor:"pointer"};
        this.rect=paper.rect(this.x-width/2,gap,width,H-2*gap).attr({fill:colors.device});
        this.lblCD = paper.text(this.x-3, gap/2, "Converging").attr({"text-anchor":"end",...fontstyle,fill:colors.focus});
        this.lblLM = paper.text(this.x+3, gap/2, "Lens").attr({"text-anchor":"start",...fontstyle,fill:colors.device});
//        this.label=paper.text(this.x-width/2,gap/2,"Converging Lens")
        this.all=paper.setFinish();
        this.toggleCD = this.toggleCD.bind(this);
        this.toggleLM = this.toggleLM.bind(this);
        this.lblCD.click(this.toggleCD);
        this.lblLM.click(this.toggleLM);
        help.addText(1.5,5,"Click to change,\nor move focal point\nto the other side.",colors.focus,"end");
        help.addVArrow(1,4,5.8,colors.focus,1);
        help.addText(-1.5,5,"Click to toggle\nbetween lens and mirror.",colors.device,"start");
        help.addVArrow(-1,4,5.8,colors.device,1);
        let duh = paper.path("");
    }
    typeName() {
        return (this.type<0)?"Lens":"Mirror";
    }
    updateLabel() {
        this.lblLM.attr({text: this.typeName()});
        this.lblCD.attr({text: (focus.f<0)?"Diverging":"Converging"});
    }
    toggleLM() {
        help.hide();
        this.type *= -1;
        this.updateLabel();
        focus.set(focus.f); //FIX: this.focus.set should have default behavior
        img.set();
    }
    toggleCD() {
        help.hide();
        focus.set(-focus.f);
        this.updateLabel();
        img.set();
    }
    front() {this.all.toFront();}
}
//================================================================================
class Ray {
    constructor(color,y) {
        this.color = color;
        this.y = y;
        {
            paper.setStart();
            this.oray=paper.path("");
            this.image=paper.path("");
            this.dashed=paper.path("");
            this.all=paper.setFinish();
        }
        this.all.attr({stroke: color, "stroke-width":6});
    }
    set(y) {
        this.y = y;
        let xO=C2S(obj.p,0).x; //the top of the object
        let yO=C2S(0,obj.h).y;
        let xD=device.x; //where the ray hits the device
        let yD=C2S(0,this.y).y;
        let xI=C2S(-device.type*img.i,0).x; //the top of the image
        let yI=C2S(0,-img.h).y;
        let mul=4; //FIX: move to top? what is this?
        let xE = (xI-xD)*mul; //extend the ray past the border
        let yE = (yI-yD)*mul;
        
        this.oray.attr({path:linepath(xO,yO,xD,yD)});
        this.image.attr ({path:linepath(xD,yD , xD+xE, yD+yE)});
        this.dashed.attr({path:linepath(xD,yD , xD-xE , yD-yE)});
        let solid = {"stroke-dasharray":"","stroke-width":3};
        let dash = {"stroke-dasharray":"-","stroke-width":2};
        if(-img.i > 0){ //IDEA: a method that returns whether the image is real or virtual
            this.image.attr(solid);
            this.dashed.attr(dash);
            if(img.h*obj.h>0){this.dashed.hide();}
            else {this.dashed.show();}
        } else {
            this.image.attr(dash);
            this.dashed.attr(solid);
            this.image.show();
            this.dashed.show();
        }
    }
};
//================================================================================
class Rays {
    constructor() {
        this.top = new Ray(colors.topray,0);
        this.cen = new Ray(colors.cenray,0);
        this.bot = new Ray(colors.botray,0);
    }
    set(){
        this.top.set(obj.h);
        this.cen.set(0);
        this.bot.set(-img.h);
    }
}
//================================================================================
class Focus {
    constructor() {
        this.f = 3;
        let radius = 10;
        this.near=paper.circle(0,axis.y,radius).attr({fill:colors.focus});
        this.far=paper.circle(0,axis.y,radius).attr({stroke:colors.focus,fill:"white"});
        this.center=paper.circle(0,axis.y,radius).attr({fill:"purple"}); //unused?
        this.drag = this.drag.bind(this);
        this.start = this.start.bind(this);
        this.near.drag(this.drag,this.start,null);
        help.addHArrow(-1, this.f-1,this.f+1,colors.focus);
        help.addText(this.f,-1.5,"Change focal length",colors.focus,"middle");
    }
    
    set(f){
        this.f=f;
        this.near.attr({cx:C2S(f).x});
        if(device.type==mirror){
            this.far.hide();
            this.center.attr({cx:C2S(2*f).x});
        } else {
            this.center.hide();
            this.far.show();
            this.far.attr({cx:C2S(-f).x});
        }
                img.set();
    }
    start() {
        help.hide();
        this.ox = this.near.attr("cx");
    }
    drag(dx,dy){
        let nf=S2C(this.ox+dx).x;
        nf = Raphael.snapTo(1,nf,0.2);
        this.set(nf);
	device.updateLabel();
    }
}
//======================================================================
class Obj {
    constructor() {
        this.p = 6;
        this.h = 2;
        this.width = 20;
        this.obj = paper.rect(0,0,objwidth,0).attr({fill:colors.object});
        this.start = this.start.bind(this);
        this.drag = this.drag.bind(this);
        this.obj.drag(this.drag, this.start, null);
        
        help.addText(this.p,this.h+1, "Change position",colors.object,"middle");
        help.addHArrow(this.h+0.6,this.p-1.5,this.p+1.5,colors.object);
        help.addText(this.p+1.2,this.h/2+0.1, "Change size",colors.object,"middle",-90);
        help.addVArrow(this.p+0.8,0,this.h,colors.object);
    }
    set(p,h) {
        this.p = p;
        this.h = h;
        this.obj.attr({x:C2S(this.p,0).x - objwidth/2});
        if (this.h>=0) {
            this.obj.attr({y:C2S(0,this.h).y, height:this.h*scale});
        } else {
            this.obj.attr({
                y:C2S(0,0).y,
                height: -this.h*scale});
        }
        img.set();
    }
    start() {
        this.op = this.p;
        this.oh = this.h;
    }
    drag(dx,dy) {
        let np = Raphael.snapTo(1, this.op-dx/scale, 0.2);
        let nh = Raphael.snapTo(1, this.oh-dy/scale, 0.2);
        if (np<1) {np=1;}
        this.set(np,nh);
    }
}
//================================================================================
class Image {
    constructor() {
        this.i = 0;
        this.h = 0;
        let width = objwidth;
        this.obj = paper.rect(0,0,objwidth,0).attr({fill:colors.image});
    }
    set() {
        let f = focus.f;
        let p = obj.p;
        if (f!=p) {this.i = f*p/(f-p);}
        else {this.i = f*p/0.01;} //infinity, basically
        this.h = -this.i/p * obj.h;
        let H = -this.h; 
        let W = Math.abs(this.i/p * objwidth);
        this.obj.attr({x: C2S(-device.type * this.i, 0).x - W/2, width:W}); //FIX: scale objwidth too
        if (H>=0) {
            this.obj.attr({y:C2S(0,H).y, height: H*scale});
        } else {
            this.obj.attr({y:C2S(0,0).y, height: -H*scale});
        }
        rays.set();
    }
}
//================================================================================
class Help {
    constructor(paper) {
        this.font = {"font-size":14,"font-family":"Times-Italic"};
        this.arrow = {2:{"arrow-start":"classic","arrow-end":"classic","stroke-width":3},
                      1:{"arrow-end":"classic","stroke-width":3}};
        this.paper = paper;
        this.collection = paper.set();
        this.hidden = false;
    }
    add(obj){
        this.collection.push(obj);
    }
    animate(obj,path) {
        let at = 900+100*Math.random();
        let ad = 10;
        let anim = Raphael.animation(
            {path:path(ad)},at,"<>",
            () => {obj.animate(
                {path:path(-ad)},at,"<>",
                ()=>{obj.animate(
                    {path:path(0)},at,"<>",
                    anim);}
            );}
        );
        obj.animate(anim);

    }
    addHArrow(y,x0,x1,color,heads=2){
        let C0 = C2S(x0,y);
        let C1 = C2S(x1,y);
        let coords = [...Object.values(C0),...Object.values(C1)];
        let path = function(dx) {
            let co = [...coords];
            //            co[0] += dx; co[2] += dx;
            if(dx=="zero") {co[0] = co[2] = (co[0]+co[2])/2;}
            return linepath(...co);
        };
        let arrow = this.paper.path(path("zero")).attr({...this.arrow[heads],stroke:color});
        arrow.animate({path:path(0)},1500,"<>");
//        this.animate(arrow,path);
        this.add(arrow);
    }
        
    addVArrow(x,y0,y1,color,heads=2){
        let C0 = C2S(x,y0);
        let C1 = C2S(x,y1);
        let coords = [...Object.values(C0),...Object.values(C1)];
        let path = function(dy) {
            let co = [...coords];
            //          co[1] += dy; co[3] += dy;
            if(dy=="zero") {co[1] = co[3] = (co[1]+co[3])/2;}
            return linepath(...co);
        };
        
        let arrow = this.paper.path(path("zero")).attr({...this.arrow[heads],stroke:color});
        arrow.animate({path:path(0)},1500,"<>");
//        this.animate(arrow,path);
        
        this.add(arrow);
    }
    
    addText(x,y,text,color="black",align="start",rotate=0) {
        let CO = C2S(x,y);
        let txt = this.paper.text(CO.x,CO.y,text).attr({...this.font,"text-anchor":align,fill:color});
        txt.node.style.fontStyle = 'italic';
        if (rotate) {
            txt.rotate(rotate,CO.x,CO.y);
        }
        this.collection.push(txt);
        return txt;
    }
    hide(){
        if (!this.hidden){
            this.hidden=true;
            this.collection.animate({opacity:0},2000);
            setTimeout((c=this.collection)=>c.remove(),2000);
        }
    }
}


//================================================================================

function grid(){
    let max=S2C(0,0);
    let min=S2C(W,H);
    let i;
    console.debug(min,max,min.y,max.y);
    console.debug(C2S(0,Math.floor(min.y)).y,
                  C2S(0,Math.floor(max.y)).y);
    paper.setStart();
    for(i=Math.floor(max.x);i>=min.x;i--){
        paper.path(linepath(
            C2S(i,0).x, C2S(0,Math.ceil(min.y)).y,
            C2S(i,0).x, C2S(0,Math.floor(max.y)).y,
            false));
    }
    for(i=Math.floor(max.y);i>=min.y;i--){
        paper.path(linepath(
            C2S(Math.ceil (min.x),0).x, C2S(0,i).y,
            C2S(Math.floor(max.x),0).x, C2S(0,i).y));

    }
    let all=paper.setFinish();
    all.attr({stroke:"gray","stroke-dasharray":"."});
};

function init() {
    paper = Raphael("lens",W,H);
    help = new Help(paper);
    device = new Device();
    axis = {y: H/2}; paper.path(`M0,${axis.y}l${W},0`).attr({"stroke-dasharray":"-","stroke-width":2});
    grid();
    rays = new Rays();
    focus = new Focus();
    obj = new Obj();
    img = new Image();
    focus.set(3);
    obj.set(6,2);
    img.set();
}
$(init);
