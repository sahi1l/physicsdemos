import { Help } from "../lib/default.js";
/*global $, jQuery,Raphael*/
let paper,Mgrid,mgrid;
let W=600;
let H=600;
let NMgrid=16; //make this even!
let Nmgrid=5;
let points=[[]];
let lines=[];

let configs=[
    [[15,20,30,40,70],{x:0,y:0,q:0.1}],
    [[25,30,35,40,50,70],{x:3,y:0,q:0.1},{x:-3,y:0,q:0.1}],
    [[-25,-10,-6,0,6,10,25],{x:3,y:0,q:0.1},{x:-3,y:0,q:-0.1}],
    [[50,75,100,130,150],{x:2,y:2,q:0.1},{x:-2,y:2,q:0.1},{x:0,y:-3,q:0.2}]
];
let charges=[];
let meters=10; //how far each major gridline is apart
let ptrx=0,ptry=0,oncanvas=false;
let epline={"stroke":"blue","stroke-width":2};
let voltmeter;
//--------------------------------------------------------------------------------
function ChooseCharge(which){
    //which starts at 1
    $(".configs").removeClass("selectedconfig");
    $($(".configs")[which-1]).addClass("selectedconfig");
    let config=configs[which-1].slice();
    let suggestions=config.shift();
    Clear();
    charges=[];
    for(let charge of config){
	charges.push(new Charge(charge.x,charge.y,charge.q*1e-6,parseInt(10*charge.q)+"µC"));
    }
    if(suggestions){
	$("#suggestions").html(suggestions.join("V, ")+"V");
    } else {$("#suggestions").html("");};
}
function Delete(point){
    console.log("Delete");
    point.remove();
    //FIX: Remove from points
    let set=points[points.length-1];
    //if this leaves the last set empty, remove the label
    let deleteQ=true;
    for (let pt of set) {
	if(!pt.deleted){deleteQ=false;break;}
    }
    if(deleteQ){
	if(set.length>0){
	    set[0].label.remove();
	}
	NewLine();
    }
}
function NewLine(){
    ClearEqP();
    points.push([]);
}
function SetEqP(value){
    $("#label").val(value);
    $("#drawing").removeClass("invisible");
}
function ClearEqP(){
    $("#label").val("");
    $("#drawing").addClass("invisible");
}
function PlaceLabel(set){
    let maxL=0;
    let maxP=undefined;
    for(let point of set){
	let line=point.nline;
	if(line!=undefined){
	    let path=line.attr("path");
	    let length=Raphael.getTotalLength(path);
	    if(length>maxL){
		maxP=path;
		maxL=length;
	    }
	}
    }
    let x,y;
    if(maxP){
	let p1=Raphael.getPointAtLength(maxP,0);
	let p2=Raphael.getPointAtLength(maxP,maxL);
	x=(p1.x+p2.x)/2;
	y=(p1.y+p2.y)/2;
    } else {
	x=-100;y=-100;
    }
    set[0].label.attr({"x":x,"y":y}).toFront();
}
function ThisPoint(){
    for (let set of points){
	for (let point of set) {
	    if(point && !point.deleted){
		if(Math.hypot(ptrx-point.cx,ptry-point.cy)<4){
		    return point;
		}
	    }
	}
    }
    return undefined;
}
function Charge(x,y,value,label){
    this.x=x;
    this.y=y;
    this.q=value;
    this.label=label;
    let that=this;
    let r=8;
    let cx=W/2+x*W/NMgrid;
    let cy=H/2-y*H/NMgrid;
    let color="black";
    if(value>0){color="blue";}
    if(value<0){color="red";}
    let obj=paper.circle(cx,cy,r).attr("fill",color);
    let lbl=paper.text(cx,cy+20,label).attr({"font-size":18});
    this.remove=function(){
	obj.remove();
	lbl.remove();
    };
    this.V=function(x0,y0){
	let rx=x0-x;
	let ry=y0-y;
	return 9e9*that.q/(meters*Math.hypot(rx,ry));
    };
}
function Point(cx,cy,V){
    this.cx=cx;
    this.cy=cy;
    this.V=V;
    this.deleted=false;
    this.pline=undefined;
    this.nline=undefined;
    this.label=undefined;
    let r=4;
    let obj=paper.circle(cx,cy,r).attr("fill","blue");
    this.remove=function(){
	obj.remove();
	this.deleted=true;
	if(this.pline){this.pline.remove(); this.pline=undefined;}
	if(this.nline){this.nline.remove(); this.nline=undefined;}
    };
    let lastpoint=undefined;
    let set=points[points.length-1];
    if (set.length>0){
	lastpoint=set[set.length-1];
	this.label=lastpoint.label;
    } else {
	this.label=paper.text(-100,-100,V).attr("font-size",24); //format the label here
    }
    set.push(this);
    if(lastpoint!=undefined){
        console.debug("drawline");
	this.pline=paper.path(`M${this.cx},${this.cy}L${lastpoint.cx},${lastpoint.cy}`);
	this.pline.attr(epline);
	lastpoint.nline=this.pline;
    }
    PlaceLabel(set);
}
function Undo(){
    //FIX: handle deletions
    let set=points[points.length-1];
    if(set.length>1){
	let pt=points.pop();
	pt.remove();
    } else {
	points.pop();
	NewLine();
    }
}
//================================================================================
function Clear(){
    //Go through all points and remove them and their lines and their labels
    for (let set of points){
	for (let point of set) {
	    point.remove();
	    if(point.label){
		point.label.remove();
	    }
	}
    }
    ClearEqP();
    points=[[]];
    for (let charge of charges){
	charge.remove();
    }
    charges=[];
}
function mouseConversion(mx,my) {
    let canvas= document.getElementById("canvas");
    let px = (mx - canvas.offsetLeft)/canvas.getBoundingClientRect().width;
    let py = (my - canvas.offsetTop)/canvas.getBoundingClientRect().height;
    return [px*W, py*H];
}
function init(){
    //FIX: set W and H 
    paper=Raphael("canvas","100%","100%");
    paper.setViewBox(0,0,W,H);
    paper.setStart();
    for (let x=0; x<=W; x+=W/NMgrid){
	paper.path(`M${x},0l0,${H}`);
	for(let m=1;m<Nmgrid;m+=1){
	    let X=x+m*(W/NMgrid/Nmgrid);
	    paper.path(`M${X},0l0,${H}`).attr("stroke-dasharray",".");
	}
    }
    for (let y=0; y<=H; y+=H/NMgrid){
	paper.path(`M0,${y}l${W},0`);
	for(let m=1;m<Nmgrid;m+=1){
	    let Y=y+m*(H/NMgrid/Nmgrid);
	    paper.path(`M0,${Y}l${W},0`).attr("stroke-dasharray",".");
	}
    }
    let hW=W/2; let hH=H/2;
    //Center lines
    paper.path(`M0,${H/2}l${W},0`).attr("stroke-width",2);
    paper.path(`M${W/2},0l0,${W}`).attr("stroke-width",2);
    let grid=paper.setFinish().attr("stroke","#999");
    $("#canvas").on("click",
		    function(e){
                        let [cx,cy] = mouseConversion(e.pageX,e.pageY);
			let pointhere=ThisPoint();
			if(pointhere){//They are clicking on a point
			    let set=points[points.length-1];
			    let lastpoint=set[set.length-1];
			    if(lastpoint){//if in the middle of building a chain
				lastpoint.nline=paper.path(`M${lastpoint.cx},${lastpoint.cy}L${pointhere.cx},${pointhere.cy}`).attr(epline);
				pointhere.pline=lastpoint.nline; //close curve
				NewLine(); //start a new line
			    } 
			} else {
			    //if label is empty, fill in the current potential
			    let label=$("#label").val();
			    if(label==""){
				label=$("#potential").html();
				SetEqP(label);
			    }
			    new Point(cx,cy,label);
			}
		    }
		   );

    $(document).on('keyup',function(e){
	let code=e.keyCode;
	let key=e.key;
	if(key=='z'){
//	    Undo();
	}
	if(key=='n'){
	    NewLine();
	}
	if(key=='x'){
	    if(oncanvas){
		let tpt=ThisPoint();
		if(tpt){Delete(tpt);}
	    }
	    //find the point under the cursor
	    //remove it
	}
    });
    $(document).mousemove(function(e){
        let [ptrx,ptry] = mouseConversion(e.pageX,e.pageY);
	oncanvas=(ptrx>0 && ptry>0 && ptrx<W && ptry<H);
        if(oncanvas) {voltmeter.show();} else {voltmeter.hide();}
    });
    $("#newline").on("click",NewLine);
    $("#canvas").mousemove(function(e){
        let [cx,cy] = mouseConversion(e.pageX,e.pageY);
	//cx is position in the canvas, now need to convert to actual coordinates
	let x=(cx-W/2)/W*NMgrid;
	let y=(H/2-cy)/H*NMgrid;
	let V=0;
	let printQ=true;
	for(let charge of charges){
	    V+=charge.V(x,y);
	    if(Math.hypot(charge.x-x,charge.y-y)<0.2){
		printQ=false;
	    }
	}
	if(printQ){
	    let val=parseFloat(V.toFixed(0));
	    if(Math.abs(V)<0.1){val=0;}
            let [vmX,vmY] = mouseConversion(e.pageX+20, e.pageY+20);
            voltmeter.attr({x:vmX,y:vmY,text:val}).show();
	    
	    $("#potential").html(val);
            let tomatch = $("#label").val();
            $("#potential").toggleClass("match",val==tomatch);
	} else {
            $("#potential").removeClass("match");
            voltmeter.hide();
	    $("#potential").html("--");
	}
    });
    let $configs = $("button.configs");
    $($configs[0]).on("click",()=>ChooseCharge(1));
    $($configs[1]).on("click",()=>ChooseCharge(2));
    $($configs[2]).on("click",()=>ChooseCharge(3));
    $($configs[3]).on("click",()=>ChooseCharge(4));
    

    
    ChooseCharge(1);
    voltmeter = paper.text(0,0,0).attr({stroke:"red","font-size":18});
    voltmeter.hide();
    new Help($("#help"),"toggle");

}
$(init);
