//FIX: points should be a list of lists, so that I can pick up with a previous voltage
var paper,Mgrid,Mgrid,mgrid;
var W=800;
var H=800;
var NMgrid=16; //make this even!
var Nmgrid=5;
var charges=[];
var meters=10; //how far each major gridline is apart
var ptrx=0,ptry=0,oncanvas=false;
//--------------------------------------------------------------------------------
function NewLine(){
    $("#label").val("");
    points.push(undefined);
}
function ThisPoint(){
    for (var point of points){
	if(point){
	    if(Math.hypot(ptrx-point.cx,ptry-point.cy)<4){
		return point;
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
    paper.circle(cx,cy,r).attr("fill","black");
    paper.text(cx,cy+15,label).attr({"font-size":18})
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
var points=[];
var lines=[];
function Point(cx,cy,V){
    this.cx=cx;
    this.cy=cy;
    this.V=V;
    this.deleted=false;
    this.pline=undefined;
    this.nline=undefined;
    var r=4;
    var obj=paper.circle(cx,cy,r).attr("fill","blue");
    this.remove=function(){
	obj.remove();
	this.deleted=true;
	if(this.pline){this.pline.remove(); this.pline=undefined;}
	if(this.nline){this.nline.remove(); this.nline=undefined;}
    }
    if(points.length>0){
	var lastpoint=points[points.length-1];
    } else {
	var lastpoint=undefined
    }
    console.log(lastpoint)
    points.push(this);
    if(lastpoint!=undefined){
	console.log(`M{this.cx,this.cy}L{lastpoint.cx,lastpoint.cy}`)
	this.pline=paper.path(`M${this.cx},${this.cy}L${lastpoint.cx},${lastpoint.cy}`);
	lastpoint.nline=this.pline;
    }
}
function Undo(){
    //FIX: handle deletions
    var pt=points.pop();
    pt.remove();
}
//================================================================================
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
    charges=[
	new Charge(5,0,0.1e-6,"+0.1µC"),
	new Charge(-5,0,-0.1e-6,"-0.1µC")
    ];
    $("#canvas").on("click",
		    function(e){
			var cx=e.pageX-$("#canvas").position().left;
			var cy=e.pageY-$("#canvas").position().top;
			var pointhere=ThisPoint();
			if(pointhere){//They are clicking on a point
			    var lastpoint=points[points.length-1];
			    if(lastpoint){//if in the middle of building a chain
				lastpoint.nline=paper.path(`M${lastpoint.cx},${lastpoint.cy}L${pointhere.cx},${pointhere.cy}`);
				pointhere.pline=lastpoint.nline; //close curve
				NewLine(); //start a new line
			    } else {
				if(points.length>1 && points[points.length-1]==undefined && points[points.length-2]===pointhere){
				    points.pop(); //this cancels a new line
				}
			    }
			} else {
			    //if label is empty, fill in the current potential
			    var label=$("#label").val();
			    if(label==""){
				label=$("#potential").html();
				$("#label").val(label)
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
		if(tpt){tpt.remove();}
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
	    $("#potential").html(V.toFixed(0));
	} else {
	    $("#potential").html("--");
	}
    });
}
$(init)
