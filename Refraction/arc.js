let paper;
let curve;
let S;
let E;
let cx = 200;
let cy = 200;
function arc(cx,cy,r,sa,ea){
    let sar = sa/180.0*Math.PI;
    let ear = ea/180.0*Math.PI;
    let sx = cx + r*Math.cos(sar);
    let sy = cy + r*Math.sin(sar);
    let ex = cx + r*Math.cos(ear);
    let ey = cy + r*Math.sin(ear);
//    S.attr({cx:sx,cy:sy});
//    E.attr({cx:ex,cy:ey});
//    console.debug(sx,sy,ex,ey);
    let laf = 0+(Math.abs(ea-sa)>180);
    let sf = 0+(ea>sa);
    return `M${sx},${sy}A${r},${r},0,${laf},${sf},${ex},${ey}`;
}

function draw(...args){
    curve.attr({path: arc(...args)});
}
function init() {
    paper = Raphael("canvas",400,400);
    curve = paper.path("");
    paper.circle(cx,cy,5).attr("fill","black");
    S = paper.circle(0,0,2).attr({fill:"green",stroke:"green"});
    E = paper.circle(0,0,2).attr({fill:"red",stroke:"red"});
}
$(init);
