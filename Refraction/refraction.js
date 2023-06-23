let cx, cy;
let NA, NB;
let sc;
let H,W;
let incident, refracted, reflected;
let color1 = "red";
let color2 = "blue";

function arc(cx,cy,r,sa,ea){
    let sar = sa/180.0*Math.PI;
    let ear = ea/180.0*Math.PI;
    let sx = cx + r*Math.cos(sar);
    let sy = cy + r*Math.sin(sar);
    let ex = cx + r*Math.cos(ear);
    let ey = cy + r*Math.sin(ear);
    let laf = 0+(Math.abs(ea-sa)>180);
    let sf = 0+(ea>sa);
    return `M${sx},${sy}A${r},${r},0,${laf},${sf},${ex},${ey}`;
}


function Round(val,precision){
    let result = val.toFixed(precision).replace(/0+$/,"").replace(/\.$/,"");
    return result;
}
class Index {
    constructor(paper, x, y, color, n0, $w) {
        this.x = x; this.y = y;
        this.min = 1.0;
        this.max = 2.5;
        this.$w = $w;
        let fsize = 24;
        let width = this.width = fsize*2;
        let height = this.height = fsize;
        this.val = n0;
        paper.setStart();
        this.bg = paper.rect(x-width/2, y-3*height/2, width, 3*height)
            .attr({stroke: "black", fill: "gray", opacity: 0.01});
        
        this.rect=paper.rect(x-width/2,y-height,width,2*height)
            .attr({"fill":"270-#888-#fff-#888"});
        
        this.neq=paper.text(x-width,y,"n=").attr({"font-size":fsize,fill:color});
        
        this.label=paper.text(x,y,this.val)
            .attr({"font-size":fsize,fill:color});
        
        this.hilabel=paper.text(x,y-height-fsize/10,"x")
            .attr({"font-size":fsize,fill:"90-"+color+"-#444-#000",
                   "clip-rect":(x-width/2)+","+(y-height)+","+width+","+(2*height)});
        
        this.lolabel=paper.text(x,y+height,"x")
            .attr({"font-size":fsize,fill:"270-"+color+"-#444-#000",
                   "clip-rect":(x-width/2)+","+(y-height)+","+width+","+(2*height)});
        
        this.bg.toFront();
        this.bg.drag(this.drag,this.start,undefined,this,this,undefined);
        this.all=paper.setFinish();
        this.set(n0);
    }
    start() {
        this.oval = this.val;
    }
    drag(dx,dy) {this.set(this.oval + Math.floor(dy/10)*0.1);}
    set(nval) {
        this.val = Math.max(this.min, Math.min(this.max,nval));
        this.label.attr("text",(this.val).toFixed(1));
        let hi = (this.val+0.1).toFixed(1);
        if (hi>this.max){hi=" ";}
        let lo = (this.val-0.1).toFixed(1);
        if (lo<this.min){lo=" ";}
        this.hilabel.attr("text",hi);
        this.lolabel.attr("text",lo);
        this.$w.html(this.val.toFixed(1));
        if(incident) {
            incident.set();
        }
        DrawOtherRays();
    }
}
class SpeedComparison {
    constructor(paper) {
        let fsize = 20;
        this.wordB = paper.text(0, H/2+fsize,"faster").attr({"text-anchor":"start", "font-size":fsize});
    }
    update(){
        this.wordB.attr("text","staying the same");
        if (NA.val > NB.val) {
            this.wordB.attr("text","speeding up"); //faster");
        } else if (NA.val < NB.val) {
            this.wordB.attr("text","slowing down"); //slower");
        }
    }
}
class Ray {
    constructor(paper,angle,color) {
        this.paper = paper;
        paper.setStart();
        this.arrow = paper.path("")
            .attr({"stroke-width":6,
                   stroke: color,
                   "arrow-end":"classic"})
            .toBack();
        this.handle = paper.circle(0,0,0)
            .attr({fill: color,
                   stroke: ""})
            .toBack()
            .hide();
        this.label = paper.text(100,100,"hi")
            .attr({"font-size":18});
        this.arc = paper.path("").attr({"stroke-dasharray":".",stroke:color});
        this.all = paper.setFinish();
        this.angle = angle;
    }
    set(ang) {
        this.angle = ang??this.angle;
        ang = this.angle;
        this.tir = isNaN(this.angle);
        if (!this.tir) {
            let g=10; //gap between beginning of ray and wall
            this.S = Math.sin(ang);
            this.C = Math.cos(ang);
            this.hyp = Math.min(
                Math.abs(cx-g)/Math.abs(this.S),
                (cy-g)/Math.abs(this.C));
            let P = this.arrowPath();
            this.arrow.attr({path: P});
            this.handle.attr({cx: cx + this.hyp*this.S, cy: cy + this.hyp*this.C});
            this.label.attr(this.labelCoords()).attr({text: this.pretty()});
            this.all.show();
        } else {
            this.all.hide();
        }
    }
    pretty() {
        if(this.tir){
            return "";
        } else {
            let angle = Math.abs(this.angle/Math.PI * 180);
            if (angle>90) {angle = 180-angle;}
            return angle.toFixed(0) + "°";
        }
    }
}
class IncidentRay extends Ray {
    constructor(paper, angle, $w) {
        super(paper, angle,"red");
        this.index = NA;
        this.$w = $w;
        this.all.drag(this.drag,this.start,this.end,this,this,this);
        this.handle.show();
    }
    arrowPath() {
        return [`M${cx+this.hyp*this.S},${cy+this.hyp*this.C}L${cx},${cy}`];
    }
    labelCoords() {
        return {x: cx+this.hyp*this.S/3, y: 2*cy/3 + this.hyp*this.C/3};
    }
    start(x,y) {
        if (!this.offset) {
            this.offset = $("#canvas").offset();
        }
        this.ox = x-this.offset.left; this.oy = y-this.offset.top;
        console.debug(x,y,this.ox,this.oy);
    }
    set(nval) {
        super.set(nval);
        nval = nval??this.angle;
        let lblco = this.labelCoords();
        let r = Math.hypot(lblco.x-cx,lblco.y-cy);
        let ang = this.angle/Math.PI*180;
        if(nval>0) {
            this.arc.attr({path: arc(cx,cy,r,-90,90-ang)});
        } else {
            this.arc.attr({path: arc(cx,cy,r,-90,-270-ang)});
        }

        this.$w.children(".angle").html(this.pretty());
        this.$w.children(".value").html(Math.abs(this.index.val * Math.sin(this.angle)).toFixed(3));
        DrawOtherRays(nval);
    }
    drag(dx,dy) {
        this.handle.hide();
        let Dx = this.ox+dx-cx;
        let Dy = this.oy+dy-cy;
        if(Dy>0) {Dy=0;}
        let angle = Math.atan2(Dx,Dy);
        this.set(angle);
    }
    end(){this.handle.show();}
};

class RefractedRay extends Ray {
    constructor(paper,angle,$w) {
        super(paper,angle,"blue");
        this.$w = $w;
        this.index = NB;
        this.tir = false;
    }
    arrowPath() {
        let path = `M${cx},${cy}L${cx-this.hyp*this.S},${cy+this.hyp*this.C}`;
        return path;
    }
    set(nval) {
        if (isNaN(nval)) {
            this.all.hide();
            $(".notir").hide();
            $(".tir").show();
        } else {
            super.set(nval);
            $(".notir").show();
            $(".tir").hide();
            let lblco = this.labelCoords();
            let r = Math.hypot(lblco.x-cx,lblco.y-cy);
            let ang = this.angle/Math.PI*180;
            if(nval>0){
                this.arc.attr({path: arc(cx,cy,r,90,90+ang)});
            } else {
                this.arc.attr({path: arc(cx,cy,r,90,90+ang)});
            }
            this.$w.find(".value").html(Math.abs(this.index.val * Math.sin(this.angle)).toFixed(3));
        }
        this.$w.find(".angle").html(this.pretty());
    }
    labelCoords(){
        return {x: cx-this.hyp*this.S/3, y: (H + 2*cy + this.hyp*this.C)/3};
    }
}
class ReflectedRay extends Ray {
    constructor(paper,angle){
        super(paper,angle,"red");
        this.arrow.attr("stroke-dasharray","-");
        this.tir = false;
    }
    arrowPath() {
        this.arrow.attr({"stroke-width": this.tir?6:3});
        return `M${cx},${cy}L${cx+this.hyp*this.S},${cy+this.hyp*this.C}`;
    }
    labelCoords() {
        return {x:-100, y:-100};
    }
}
function DrawOtherRays() {
    if (incident == undefined) {return;}
    let ang = incident.angle;
    let na = NA.val;
    let nb = NB.val;
    let Sa = Math.abs(Math.sin(ang));
    let Sb = na/nb*Sa;
    refracted.tir = (Math.abs(Sb)>1);
    reflected.set(-ang);
    refracted.set(Math.asin(Sb)*Math.sign(ang));
    sc.update();
}
function init() {
    let name = "canvas";
    let $w = $(`#${name}`);
    W = $w.width();
    H = $w.height();
    let paper = Raphael(name, W, H);
    paper.offset = $(paper.canvas).parent().offset;
    cx = W/2;
    cy = H/2;
    paper.setStart();
    paper.rect(0,0,W,H/2).attr({fill:color1, opacity:0.1});
    paper.rect(0,H/2,W,H/2).attr({fill:color2, opacity:0.1});
    paper.path(`M0,${H/2}l${W},0`).attr("stroke-width",5);
    paper.path(`M${W/2},0l0,${H}`).attr("stroke-dasharray","-");
    let stuff = paper.setFinish();
    NA = new Index(paper, 80, 30, color1, 1.0, $(".equation#incident .index"));
    NB = new Index(paper, 80, H-30, color2, 1.5, $(".equation#refracted .index"));
    sc = new SpeedComparison(paper);
    incident = new IncidentRay(paper,0,$(".equation#incident"));
    reflected = new ReflectedRay(paper,0);
    refracted = new RefractedRay(paper,0,$(".equation#refracted"));
    incident.set(Math.PI);
    reflected.all.toBack();
    stuff.toBack();
    $(".tir").hide();
}
$(init);
