var paper,Mgrid,Mgrid,mgrid;
var W=800;
var H=800;
var NMgrid=16; //make this even!
var Nmgrid=5;

var configs=[
    [[15,20,30,40,70],{x:0,y:0,q:0.1}],
    [[25,30,35,40,50,70],{x:3,y:0,q:0.1},{x:-3,y:0,q:0.1}],
    [[-25,-10,-6,0,6,10,25],{x:3,y:0,q:0.1},{x:-3,y:0,q:-0.1}],
    [[50,75,100,130,150],{x:2,y:2,q:0.1},{x:-2,y:2,q:0.1},{x:0,y:-3,q:0.2}]
]
var charges=[];
var meters=10; //how far each major gridline is apart
var ptrx=0,ptry=0,oncanvas=false;
var epline={"stroke":"blue","stroke-width":2};
//--------------------------------------------------------------------------------
function ChooseCharge(which){
    //which starts at 1
    $(".configs").removeClass("selectedconfig");
    $($(".configs")[which-1]).addClass("selectedconfig");
    var config=configs[which-1].slice()
    var suggestions=config.shift();
    Clear();
    charges=[];
    for(let charge of config){
	charges.push(new Charge(charge.x,charge.y,charge.q*1e-6,parseInt(10*charge.q)+"µC"))
    }
    if(suggestions){
	$("#suggestions").html(suggestions.join("V, ")+"V")
    } else {$("#suggestions").html("")}
}
function Delete(point){
    console.log("Delete");
    point.remove();
    //FIX: Remove from points
    var set=points[points.length-1];
    //if this leaves the last set empty, remove the label
    var deleteQ=true;
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
    $("#label").val("")
    $("#drawing").addClass("invisible");
}
function PlaceLabel(set){
    var maxL=0;
    var maxP=undefined;
    for(var point of set){
	var line=point.nline;
	if(line!=undefined){
	    var path=line.attr("path");
	    var length=Raphael.getTotalLength(path)
	    if(length>maxL){
		maxP=path;
		maxL=length;
	    }
	}
    }
    if(maxP){
	var p1=Raphael.getPointAtLength(maxP,0);
	var p2=Raphael.getPointAtLength(maxP,maxL);
	var x=(p1.x+p2.x)/2;
	var y=(p1.y+p2.y)/2;
    } else {
	x=-100;y=-100;
    }
    set[0].label.attr({"x":x,"y":y}).toFront();
}
function ThisPoint(){
    for (var set of points){
	for (var point of set) {
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
    var that=this;
    var r=8;
    var cx=W/2+x*W/NMgrid;
    var cy=H/2-y*H/NMgrid;
    var color="black";
    if(value>0){color="blue";}
    if(value<0){color="red";}
    var obj=paper.circle(cx,cy,r).attr("fill",color);
    var lbl=paper.text(cx,cy+20,label).attr({"font-size":18})
    this.remove=function(){
	obj.remove();
	lbl.remove();
    }
    this.V=function(x0,y0){
	var rx=x0-x;
	var ry=y0-y;
	return 9e9*that.q/(meters*Math.hypot(rx,ry));
    }
/*    this.Ex=function(x0,y0){
	var rx=x0-x;
	var ry=y0-y;
	var R=Math.hypot(rx,ry);
	return rx*9e9*that.q/R**3;
    }
    this.Ey=function(x0,y0){
	var rx=x0-x;
	var ry=y0-y;
	var R=Math.hypot(rx,ry);
	return ry*9e9*that.q/R**3;
    }*/

}
var points=[[]];
var lines=[];
function Point(cx,cy,V){
    this.cx=cx;
    this.cy=cy;
    this.V=V;
    this.deleted=false;
    this.pline=undefined;
    this.nline=undefined;
    this.label=undefined;
    var r=4;
    var obj=paper.circle(cx,cy,r).attr("fill","blue");
    this.remove=function(){
	obj.remove();
	this.deleted=true;
	if(this.pline){this.pline.remove(); this.pline=undefined;}
	if(this.nline){this.nline.remove(); this.nline=undefined;}
    }
    lastpoint=undefined;
    var set=points[points.length-1];
    if (set.length>0){
	var lastpoint=set[set.length-1];
	this.label=lastpoint.label;
    } else {
	this.label=paper.text(-100,-100,V).attr("font-size",24); //format the label here
    }
    set.push(this);
    if(lastpoint!=undefined){
	this.pline=paper.path(`M${this.cx},${this.cy}L${lastpoint.cx},${lastpoint.cy}`);
	this.pline.attr(epline)
	lastpoint.nline=this.pline;
    }
    PlaceLabel(set);
}
function Undo(){
    //FIX: handle deletions
    var set=points[points.length-1];
    if(set.length>1){
	var pt=points.pop();
	pt.remove();
    } else {
	points.pop();
	NewLine();
    }
}
//================================================================================
function Clear(){
    //Go through all points and remove them and their lines and their labels
    for (var set of points){
	for (var point of set) {
	    point.remove();
	    if(point.label){
		point.label.remove();
	    }
	}
    }
    ClearEqP();
    points=[[]];
    for (var charge of charges){
	charge.remove();
    }
    charges=[];
}
function init(){
    //FIX: set W and H 
    $("#canvas").width(W).height(H);
    paper=Raphael("canvas",W,H);
    paper.setStart();
    for (let x=0; x<=W; x+=W/NMgrid){
	paper.path(`M${x},0l0,${H}`);
	for(let m=1;m<Nmgrid;m+=1){
	    var X=x+m*(W/NMgrid/Nmgrid);
	    paper.path(`M${X},0l0,${H}`).attr("stroke-dasharray",".");
	}
    }
    for (let y=0; y<=H; y+=H/NMgrid){
	paper.path(`M0,${y}l${W},0`);
	for(let m=1;m<Nmgrid;m+=1){
	    var Y=y+m*(H/NMgrid/Nmgrid);
	    paper.path(`M0,${Y}l${W},0`).attr("stroke-dasharray",".");
	}
    }
    var hW=W/2; var hH=H/2;
    //Center lines
    paper.path(`M0,${H/2}l${W},0`).attr("stroke-width",2);
    paper.path(`M${W/2},0l0,${W}`).attr("stroke-width",2);
    grid=paper.setFinish().attr("stroke","#999");
    $("#canvas").on("click",
		    function(e){
			var cx=e.pageX-$("#canvas").position().left;
			var cy=e.pageY-$("#canvas").position().top;
			var pointhere=ThisPoint();
			if(pointhere){//They are clicking on a point
			    var set=points[points.length-1];
			    var lastpoint=set[set.length-1];
			    if(lastpoint){//if in the middle of building a chain
				lastpoint.nline=paper.path(`M${lastpoint.cx},${lastpoint.cy}L${pointhere.cx},${pointhere.cy}`).attr(epline);
				pointhere.pline=lastpoint.nline; //close curve
				NewLine(); //start a new line
			    } 
			} else {
			    //if label is empty, fill in the current potential
			    var label=$("#label").val();
			    if(label==""){
				label=$("#potential").html();
				SetEqP(label);
			    }
			    new Point(cx,cy,label);
			}
		    }
		   );

    $(document).on('keyup',function(e){
	var code=e.keyCode;
	var key=e.key;
	if(key=='z'){
//	    Undo();
	}
	if(key=='n'){
	    NewLine();
	}
	if(key=='x'){
	    if(oncanvas){
		var tpt=ThisPoint();
		if(tpt){Delete(tpt);}
	    }
	    //find the point under the cursor
	    //remove it
	}
    });
    $(document).mousemove(function(e){
	ptrx=e.pageX-$("#canvas").position().left;
	ptry=e.pageY-$("#canvas").position().top;
	oncanvas=(ptrx>0 && ptry>0 && ptrx<W && ptry<H);
    })
    $("#newline").on("click",NewLine);
    $("#canvas").mousemove(function(e){
	var cx=e.pageX-$("#canvas").position().left;
	var cy=e.pageY-$("#canvas").position().top;
	//cx is position in the canvas, now need to convert to actual coordinates
	var x=(cx-W/2)/W*NMgrid;
	var y=(H/2-cy)/H*NMgrid;
	var V=0;
	var printQ=true;
	for(charge of charges){
	    V+=charge.V(x,y);
	    if(Math.hypot(charge.x-x,charge.y-y)<0.2){
		printQ=false;
	    }
	}
	if(printQ){
	    var val=parseFloat(V.toPrecision(2));
	    if(Math.abs(V)<0.1){val=0}
	    
	    $("#potential").html(val);
	} else {
	    $("#potential").html("--");
	}
    });
    ChooseCharge(1)

}
$(init)
