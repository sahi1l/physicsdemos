let W = 200;
let H = 200;
let mirX = W/2;
let paper;
let mirror;
let fsize = 18;
let dvcx; //this is the midpoint of the window and the x position of the device

function arcseg (cx, cy, radius, start_r, finish_r) {
  start_r = Raphael.rad(start_r);
  finish_r = Raphael.rad(finish_r);

  let start_x = cx + Math.cos( start_r ) * radius,
  start_y = cy + Math.sin( start_r ) * radius,
  finish_x = cx + Math.cos( finish_r ) * radius,
  finish_y = cy + Math.sin( finish_r ) * radius,
  path;

  path = [
    [ "M", start_x, start_y ],
    [ "A", radius, radius, finish_r - start_r,
      (finish_r - start_r > Raphael.rad( 180 )) ? 1 : 0, 
      (finish_r > start_r) ? 1 : 0,        
      finish_x, finish_y ]              
  ];
  return { path: path };
};
function Line (x0,y0,x1,y1) {
    let X = x1;
    let Y = y1;
    let xmin=-W; let xmax=W; let ymin=-H; let ymax=H;
    let tmin;
    let t;
    if (x0 != x1) {
        t = (xmin-x0)/(x1-x0);
        if(t>0) {
            tmin = t;
            X = xmin;
            Y = y0 + t*(y1-y0);
        } else {
            t = (xmax-x0)/(x1-x0);
            tmin = t;
            X = xmax;
            Y = y0 + tmin*(y1-y0);
        }
    }
    if (y0 != y1) {
        t = (ymin-y0) / (y1-y0);
        if (t>0) {
            if (t<tmin) {
                Y = ymin;
                X = x0 + t*(x1-x0);
            }
        } else {
            t = (ymax-y0) / (y1-y0);
            if (t<tmin) {
                Y = ymax;
                X = x0 + t*(x1-x0);
            }
        }
    }
    return `${X},${Y}`;
}
let highlightable = []; //a list of all highlightable objects
function unhighlight() {
    for (let element of highlightable) {
        if (element.highlighted) {
            element.highlight(false);
        }
    }
}

class Ray {
    constructor(color, sw, attr,which,cousins){
        let that = this;
        this.color = color;
        this.highlighted = false;
        this.sw = sw;
        this.attr = {};
        this.cousins = [];
        Object.assign(this.attr,attr);
        this.ray = paper.path("").attr({"stroke-width":this.sw,stroke: this.color,...this.attr});
        this.highlight = this.highlight.bind(this);
        highlightable.push(this);
        setHover(this.ray, which, this);
    }
    set(x0,y0,x1,y1,x2,y2){
        if (x2 != undefined) {
            let L = Line(x1,y1,x2,y2);
            [x1,y1] = L.split(",");
        }
        this.ray.attr({path:`M${x0},${y0},${x1},${y1}`});
    }
    highlight(onQ,secondary=false) {
        console.debug(this.ray,onQ);
        let finalattr = {'stroke-width':((onQ && !secondary)? this.sw*2: this.sw), stroke: (onQ? (secondary? 'orange': 'red'): this.color)};
        if (onQ) {
            if (secondary) {
                this.ray.attr(finalattr);
            } else {
                unhighlight();
                this.ray.attr(finalattr);
            }
        } else {
            this.ray.attr(finalattr);
        }
        this.highlighted = onQ;
        if (!secondary) {
            for (let cousin of this.cousins??[]) {
                cousin.highlight(onQ,true);
            }
        }
    }
}
function getNamedColor(csstag) {
    let ncolor = `var(--${csstag}-color)`;
    let $duh = $("<div id='duh'>").css({"width":100,"height":100,
                                        color: ncolor,
                                        "background-color":ncolor
                              }).appendTo("body");
    let color = window.getComputedStyle($duh[0]).color;
    $duh.remove();
    return color;
}
console.debug(getNamedColor("bg"));
let normcolor = getNamedColor("text");
let objcolor = getNamedColor("main");
let reflcolor = getNamedColor("right");
let imgcolor = getNamedColor("accent");

class RaySet {
    constructor(y,parent) {
        this.y = y;
        this.parent = parent;
        let normwidth = 50;
        this.normal = new Ray(normcolor,2,{"stroke-dasharray":"-"},"normal");
        this.normal.set(-normwidth,y,normwidth,y);
        this.ray = new Ray(reflcolor,3,{"arrow-end":"classic"}, "reflection");
        this.trace = new Ray(imgcolor,3,{"stroke-dasharray":"--"},"trace");
        this.incident = new Ray(objcolor,4,{"arrow-end":"classic"}, "incident");
        this.incident.cousins = [this.ray,this.trace];
        this.ray.cousins = [this.incident, this.trace];
        this.trace.cousins = [this.incident, this.ray];
        this.normal.cousins = [this.incident, this.ray];
    }
    
    set() {
        let imgx = -this.parent.x;
        let imgy = this.parent.y;
        this.incident.set(this.parent.x, this.parent.y, 0, this.y);
        this.ray.set(0, this.y, imgx, imgy, 0, this.y);
        this.trace.set(0, this.y, 0, this.y, imgx, imgy);
    }
};
let texts = {
    "mirror": "This is a flat or 'plane' mirror.",
    "object": "An object in front of the mirror.  Try dragging it around.",
    "image": "The image of the object seen in the mirror.",
    "incident": "The <B>incident</B> ray:<BR> a ray of light from the object that strikes the mirror.",
    "reflection": "The <B>reflected</B> ray:<BR> the incident ray after it is reflected from the mirror.",
    "trace": "The eye traces the blue rays back through the mirror, <BR>where they appear to come from the image.",
    "normal": "The <B>normal</B> of the mirror, which is perpendicular to it.<BR>The incident and reflected rays make the same angle with the normal."
};
function showText(which,e){
    if (which) {
        $("#tooltip").html(texts[which]);
    } else {
        $("#tooltip").html("");
    };
}
let setHover = (element,which, el2)=> {
    element.mouseover((e,x,y,w=which,el=el2)=>{
        console.debug(element,which,el);
        showText(w,e);
        unhighlight();
        if(el) {el.highlight(true);}
    });
    element.mouseout((e)=>{unhighlight();showText();});
}
class Circle {
    constructor(x,y,color,which){
        this.x = x;
        this.y = y;
        this.r = 10;
        this.highlighted = false;
        this.color = color;
        this.labeldx = 20*((which=="object")?-1:1);
        this.obj = paper.circle(x,y,this.r).attr({fill:color});
        this.label = paper.text(x,y-10,which)
            .attr({fill:color, "font-size":fsize,stroke:objcolor});
        this.highlight = this.highlight.bind(this);
        setHover(this.obj, which, this);
        highlightable.push(this);
        this.cousins = [];
    }
    highlight(onQ) {
        if(onQ) {unhighlight();}
        this.highlighted = onQ;
        this.obj.attr({"stroke-width": (onQ ? 4: 2), stroke: (onQ ? "red": this.color )});
        for (let cousin of this.cousins) {
            cousin.highlight(onQ,true);
        }
    }
    move(x,y) {
        this.obj.attr({cx: x,cy: y});
        this.label.attr({x: x+this.labeldx, y: y-20});
    }
}
class Principal {
    constructor(x,y) {
        let r = 10;
        this.r = r;
        this.x = x;
        this.y = y;
        this.obj = new Circle(x,y,objcolor,"object");
        this.img = new Circle(-x,y,imgcolor,"image");
        this.rays = [];
        this.imgx = 0; this.imgy = 0;
        this.obj.obj.drag(this.drag,this.start,undefined,this,this,this);
        this.set(x,y);
    }
    addRay(x) {
        let rs = new RaySet(x,this);
        this.rays.push(rs);
        this.obj.cousins.push(rs.incident);
        this.set(this.x,this.y);
    }
    image() {
        let p = this.x;
        let i = -p;
        this.imgx = i;
        this.imgy = this.y;
        this.move.attr(imgx, imgy);
    }
    set(x,y) {
        this.x = x??this.x; this.y = y??this.y;
        if (this.x < -W+this.r) {this.x = -W+this.r;}
        if (this.x>0) {this.x = 0;}
        this.obj.move(this.x, this.y);
        this.img.move(-this.x, this.y);
        for (let R of this.rays){R.set();}
    }
    start() {
        this.ox = this.x;
        this.oy = this.y;
    }
    drag(dx,dy) {
        this.set(this.ox + dx , this.oy + dy);
    }

}
function highlightObj(obj,stroke,width,cousinz){
    return (onQ,O=obj,C=stroke,W=width,cousins=cousinz) => {
        console.debug(cousins);
        if(onQ) {unhighlight();}
        obj.attr({stroke: onQ?"red":C,
                  "stroke-width": onQ?W*2:W});
        for (let cousin of cousins??[]) {
            cousin.highlight(onQ,true);
            if(onQ) {highlighted.push(cousin.highlight);}
        }
    };
}
function init(){
    paper = Raphael("flatmirror", "100%","100%");
    paper.setViewBox(-W,-H,2*W,2*H); //last two are width and height
    //draw mirror
//    mirror = paper.rect(-5,-H,10,2*H).attr("fill",objcolor);
    mirror = paper.path(`M0,${H} L0,-${H-20}`)
        .attr({"stroke-width":8, stroke:"grey"});
    paper.text(0,-H+10,"Mirror").attr({"font-size":fsize});
    setHover(mirror,"mirror");
    let obj = new Principal(-50, 0);
    obj.addRay(-50);
    obj.addRay(0);
    obj.addRay(50);
    obj.obj.obj.toFront();
    obj.img.obj.toFront();
    mirror.toFront();
};
$(init);
