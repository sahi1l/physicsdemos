/*TODO:
  Click on work, it draws a vector there showing the electric field
  OR possibly draws an entire line there (forward and backward)
*/

var paper;
var field;
var work;
var positive,negative;
var cbLine, cbVec;
var sLine, slVec;
init=function(name,w,h){
    paper=Raphael(name,w,h);
    $(".canvas").css("height",h+"px");
    $(".canvas").css("width",w+"px");
    var Xgap=50,Tgap=10,Bgap=90;
    work=paper.rect(Xgap,Tgap,w-2*Xgap,h-Tgap-Bgap);
    field=new Field(w-Xgap,h-Bgap);
    field.xmin=Xgap; field.ymin=Tgap;
    templatecharge(1);
    templatecharge(-1);
    cbLine=new Checkbox(Xgap,h-Bgap+18,18,"Show field lines",$.proxy(field.toggleLine,field));
    cbVec=new Checkbox(Xgap+150,h-Bgap+18,18,"Show field vectors",$.proxy(field.toggleVec,field));
    slLine=new Slider(Xgap,560,100,"# of field lines",4,18,function(x){field.linesper=x;field.draw();})
    slLine.setValue(6);
    slVec=new Slider(Xgap+150,560,100,"# of vectors",100,10,function(x){field.Vper=x;field.Vunit=2500*x;field.draw();})
    slVec.setValue(40);

};
Slider=function(x,y,size,text,min,max,fn){
    this.min=min;
    this.max=max;
    this.fn=fn;
    this.x=x; //doesn't change!
    this.dx=size;
    this.pos=x; //position along the slide
    var thickness=8;
    var offset=5;
    var thumbheight=10;
    this.base=paper.rect(x-offset,y,size+2*offset,thickness).attr({fill:"#ddd"});
    this.thumb=paper.rect(x,y-thumbheight/2,thickness,thumbheight+thickness).attr({fill:"gray"});
    this.text=paper.text(x+0.5*size,y+thumbheight*2,text).attr("font",thumbheight*1.5+"px Times");
    this.base.click($.proxy(function(event){this.setPosition(event.pageX,1);},this));
    this.value=function(P){
	var pct=(P-this.x)/this.dx;
	return pct*(this.max-this.min)+this.min;
    }
    this.setValue=function(val,update){
	var pos=(val-this.min)/(this.max-this.min)*this.dx+this.x;
	this.thumb.attr({x:pos});
	if(update){this.fn(val);}
	this.pos=pos;
	return {pos:pos,val:val};
    }
    this.setPosition=function(pos,update){
	var val=(pos-this.x)/this.dx*(this.max-this.min)+this.min;
	val=Math.floor(Math.max(Math.min(val,Math.max(this.min,this.max)),Math.min(this.max,this.min)));
	return this.setValue(val,update);
	
    }
    this.start=function(){
	this.opos=this.pos;
	this.dragpos=this.pos;
    }
    this.drag=function(dx,dy){
	var P=this.setPosition(this.opos+dx,0);
//	var X=this.pos+dx;
//	var V=this.value(X);
//	if(V<this.min){V=this.min;}
//	else if (V>this.max){V=this.max;}
//	else {V=Math.floor(V);}
//	var P=(V-this.min)/(this.max-this.min)*this.dx+this.x;
	if(this.dragpos!=P.pos){
	    this.fn(P.val);
	    this.dragpos=P.pos;
	}
//	this.thumb.attr({x:P});
    }
    this.end=function(dx,dy){
	this.setPosition(this.dragpos,1);
//	var X=this.dragpos;
//	var V=this.value(X);
//	if(V<this.min){V=this.min;}
//	else if (V>this.max){V=this.max;}
//	else {V=Math.floor(V);}
//	var P=(V-this.min)/(this.max-this.min)*this.dx+this.x;
//	this.pos=P;
//	this.thumb.attr({x:P});
//	this.fn(V);
    }
    this.thumb.drag($.proxy(this.drag,this),$.proxy(this.start,this),$.proxy(this.end,this));
}
Checkbox=function(x,y,size,text,fn){
    this.box=paper.rect(x,y-size/2,size,size).attr({fill:"white"});
    this.fn=fn;
    this.activeQ=1;
    this.mark=paper.path(
	"M" + x + "," + y
	    + "l" + (size/4) + "," + (size/2)
	    + "s0,-8," + (3*size/4) + "," + (-size*1.1)
    ).attr({stroke:"green",
	    "stroke-width":size*0.3,
	    "stroke-linecap":"round",
	    "stroke-linejoin":"round"
	   });
    this.text=paper.text(x+size*1.1,y,text).attr({"text-anchor":"start","font":size+"px Times"});
    this.toggle=function(){
	this.activeQ=!this.activeQ;
	if(this.activeQ){this.mark.show();} else {this.mark.hide();}
	fn(this.activeQ);
    }
    this.text.click($.proxy(this.toggle,this));
    this.box.click($.proxy(this.toggle,this));
    this.mark.click($.proxy(this.toggle,this));
    
}
Charge=function(x,y,q,R,parent){
    this.x=x; this.y=y; this.q=q; this.r=R;
    this.parent=parent;
    var src;
    if(this.q>0){src="positive.png";} else {src="negative.png";}
    this.obj=paper.image(src,this.x-this.r,this.y-this.r,this.r*2,this.r*2);
    this.obj.parent=this;
    this.move=function(x,y){
	this.x=x;
	this.y=y;
	this.obj.attr({x:x-this.r,y:y-this.r});
//	this.parent.draw();
    }
    
    this.start=function(){
	this.ox=this.parent.x;
	this.oy=this.parent.y;
	this.newQ=0;
	this.movedQ=0;
	var field=this.parent.parent;
	if(this.ox<field.xmin || this.ox>field.xmax || this.oy<field.ymin || this.oy>field.ymax){
	    this.newQ=1;
	    //create a new copy of the original
	    templatecharge(this.parent.q);
	}
    }
    this.drag=function(dx,dy){
	if(dx*dx+dy*dy>1){
	    this.movedQ=1;
	    var x=this.ox+dx;
	    var y=this.oy+dy;
	    var charges=this.parent.parent.charges;
	    for (c in charges) {
		if(this.parent===charges[c]){continue;}
		if(Math.abs(charges[c].x-x)<5){x=charges[c].x;console.log("x:"+c);}
		if(Math.abs(charges[c].y-y)<5){y=charges[c].y;console.log("y:"+c);}
	    }
	    this.parent.move(x,y);
	}
	    /*
	      if(!(this.x<field.xmin || this.x>field.xmax || this.y<field.ymin || this.y>field.ymax)){
	      if(this.movedQ){this.parent.parent.draw();}
	      }*/

    }
    this.end=function(){
	var field=this.parent.parent;
	if(this.parent.x<field.xmin 
	   || this.parent.x>field.xmax 
	   || this.parent.y<field.ymin 
	   || this.parent.y>field.ymax){
	    if(!this.newQ){
		var idx=field.charges.indexOf(this.parent);
		field.charges.splice(idx,1);
	    }
	    this.remove(); 
	    field.draw();
	} else {
	    if(this.newQ){
		field.charges.push(this.parent);
	    }
	    field.draw();
	}
    }
    this.obj.drag(this.drag,this.start,this.end);
    this.delete=function(){this.obj.remove();}
};
	    
Arrow=function(x,y,dx,dy,s,l){
    //s is the multiple of dx/dy for the arrow size
    //l is the multiple of dx/dy for the arrow line
    this.color="black";
    this.Head=paper.path("M0,0");
    this.Line=paper.path("M0,0");
    this.show=function() {this.Head.show(); this.Line.show();}
    this.hide=function() {this.Head.hide(); this.Line.hide();}
    this.set=function(x,y,dx,dy,s,l){
	var sx=x; var sy=y;
	var x=sx+dx*l; 
	var y=sy+dy*l;
	//paths
	this.head= 
	      "M" + x          + "," + y
	    + "m" + s*(-dx)    + "," + s*(-dy)
	    + "l" + s*dy       + "," + s*(-dx)
	    + "l" + s*(dx-dy)  + "," + s*(dx+dy)
	    + "l" + s*(-dx-dy) + "," + s*(dx-dy)
	    + "l" + s*dy       + "," + s*(-dx);
	this.line="M" + x + "," + y + "L" + sx + "," + sy;
	//objects
    }
    this.set(x,y,dx,dy,s,l);
    this.draw=function() {
	this.Head.attr({path:this.head,stroke:this.color,fill:this.color});
	this.Line.attr({path:this.line,stroke:this.color});
	this.Head.toBack();
	this.Line.toBack();
    };
    this.remove=function(){
	this.Head.remove();
	this.Line.remove();
    }
};
Line=function(x0,y0) {
    this.coordinates=[x0,y0];
    this.line=paper.path("M0,0"); //line object
    this.head=new Arrow(0,0,0,0,0,0); //arrowhead object
    this.show=function(){this.head.show();this.line.show();}
    this.hide=function(){this.head.hide();this.line.hide();}
    this.remove=function(){this.head.remove(); this.line.remove();}
    this.add= function(x,y,dir) {
	if(dir>0) {this.coordinates=this.coordinates.concat([x,y]);} 
	else {this.coordinates=[x,y].concat(this.coordinates);}
    };
    this.draw=function(R,s) {
	var L=this.coordinates.length;
	var path="M" + this.coordinates[0] + "," + this.coordinates[1];
	for (i=2; i<L; i+=2) {
	    path+="L" + this.coordinates[i] + "," + this.coordinates[i+1];
	}
	this.line.attr({path:path,stroke:"gray","stroke-width":5});
	this.line.toBack();
	var dx=this.coordinates[L-2]-this.coordinates[L-4];
	var dy=this.coordinates[L-1]-this.coordinates[L-3];
	this.head.set(this.coordinates[L-2]-R*dx,this.coordinates[L-1]-R*dy,dx,dy,s,0);
	this.head.color="gray";
	this.head.draw();
    };
}    

Field=function(W,H) {
    this.xmin=0; this.ymin=0; //I might want to restrict it to a box
    this.xmax=W; this.ymax=H;
    this.charges=[]; //all the charges, each an object Charge
    this.lines=[]; //all the field line objects
    this.vectors=[];
    this.showLines=true;
    this.showVecs=true;
    this.linesper=8; //number of field lines per unit charge
    this.R=10; //charge radius
    this.step=1; //size of step in drawing the field line
    this.Vper=40; //draw vectors every # steps; 0 for no vectors
    this.Vunit=1e5; //length of a unit vector
    this.arrowsize=5;
    //-----
    this.add=function(x,y,q) {
	var c=this.charges.length;
	this.charges[c]=new Charge(x,y,q,this.R,this);
	this.draw();
    }
    //-----
    this.FieldDir = function(x,y) {
	var Ex=0, Ey=0;
	for (c in this.charges) {
	    C=this.charges[c];
	    var Rx=x-C.x, Ry=y-C.y;
	    var R=Math.sqrt(Rx*Rx+Ry*Ry);
	    if(R==0){return "no";}
	    var EM=C.q/Math.pow(R,3);
	    Ex+=EM*Rx; Ey+=EM*Ry;
	}
	var E=Math.sqrt(Ex*Ex+Ey*Ey);
	if(E==0) {return "no";}
	return {x:Ex/E, y:Ey/E, mag:E};
    };
    //-----
    this.draw = function() {
	for (l in this.lines) {this.lines[l].remove();}
	for (v in this.vectors) {this.vectors[v].remove();}
	this.lines=[]; this.vectors=[];
	for (c in this.charges) {
	    var C=this.charges[c];
	    var dir=1; if (C.q<0) {dir=-1;}
	    var num=this.linesper*Math.abs(C.q);
	    for (n=0; n<num; n++) {
		var angle=2.0*Math.PI*n/num;
		var nx=C.x+C.r*Math.cos(angle);
		var ny=C.y+C.r*Math.sin(angle);
		if(this.DrawLine(nx,ny,dir)<0) {return -1;}
	    };
	};
	this.toggleLine(this.showLines);
	this.toggleVec(this.showVecs);
    };
    //-----
    this.DrawLine = function(x0,y0,dir){
	var x=x0, y=y0;
	var flag=0;
	var dx=0, dy=0;
	var cnt=0;
	var step=this.step;
	var L=new Line(x0,y0);
//	var coords="M" + x + "," + y;
	var V=[]; //list of arrows
	while (!flag) {
	    cnt++;
	    var odx=dx, ody=dy;
	    var tmp=this.FieldDir(x,y);
	    if (typeof tmp=="string"){flag=-1; break;}
	    dx=tmp.x; dy=tmp.y;
	    var DX=dir*step*dx, DY=dir*step*dy;
	    if(this.Vper>0 && cnt % this.Vper==0) {
		var mult=Math.max(5,Math.min(tmp.mag*this.Vunit,30));
		var arrow=new Arrow(x,y,dir*DX,dir*DY,this.arrowsize,mult);
		V=V.concat(arrow);
	    }
	    x=x+DX;
	    y=y+DY;
	    if(dx*odx+dy*ody<0) {flag=-1; break;}
	    if( x<this.xmin || 
		x>this.xmax ||
		y<this.ymin ||
		y>this.ymax) {flag=1; break;}
	    L.add(x,y,dir);
//	    coords+="L" + x + "," +y;
	}
	if(dir>0 && flag<0) {return;}
	for (v in V) {
	    V[v].draw();
	    this.vectors=this.vectors.concat(V[v]);
	}
	L.draw(this.R,this.arrowsize*2);
	this.lines=this.lines.concat([L]);
//	var obj=paper.path(coords);
//	obj.toBack();
//	obj.attr({stroke:"gray"});
//	var Aobj;
//	if (dir>0) {
//	    Aobj=new Arrow(x-this.R*dx,y-this.R*dy,dx,dy,this.arrowsize,0);
//	} else {
//	    var tmp=this.FieldDir(x0,y0);
//	    Aobj=new Arrow(x0,y0,tmp.x,tmp.y,this.arrowsize,0);
//	}
//	Aobj.draw();
//	this.lines=this.lines.concat([obj,Aobj]);
    }
    //-----
    this.toggleLine = function(q) {
	this.showLines=q;
	for (l in this.lines) {
	    if(q) {this.lines[l].show();} 
	    else {this.lines[l].hide();}
	}
    };
    this.toggleVec = function(q) {
	this.showVecs=q;
	for (l in this.vectors) {
	    if(q) {this.vectors[l].show();} 
	    else {this.vectors[l].hide();}
	}
    };
};    
function templatecharge(sign){
    if(sign>0){
	positive=new Charge(work.attr("x")-25,work.attr("y")+work.attr("height")*0.5,1,field.R,field);
	positive.obj.toBack();
    } else {
	negative=new Charge(work.attr("x")+work.attr("width")+25,work.attr("y")+work.attr("height")*0.5,-1,field.R,field);
	negative.obj.toBack();
    }

}
