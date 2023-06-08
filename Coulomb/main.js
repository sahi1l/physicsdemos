var paper;
var charges=[];
var target; //this points to the object which is the target
var init=function (name,wd,ht){
    paper=Raphael(name,wd.ht);
    work=paper.rect(100,100,200,200).attr({stroke:"black"});
    templatecharge(1);
    templatecharge(-1);
    target=new Target();
}
//----------------------------------------
function Target() {
    this.charge; //This is the charge that acts as the target
    this.arrows=[]; //list of all the arrows

    this.sum=0;
    //sum
    this.circle=paper.circle(0,0,20).attr({stroke:"yellow","stroke-width":3});
    this.circle.hide();
    this.set=function(chg){
	this.charge=chg;
	this.circle.attr({cx:chg.x,cy:chg.y});
	this.circle.show();
    }
    this.clear=function(){
	for (x in this.arrows){
	    this.arrows[x].remove();
	}
	this.arrows=[];
	if(this.sum!=0){this.sum.remove()};
    };
    this.draw=function(){
	if(typeof this.charge!="object"){return;}
	var sx=0;
	var sy=0;
	this.clear();
	for (x in charges){
	    if(charges[x]!=this.charge){
		var Dx=this.charge.x-charges[x].x;
		var Dy=this.charge.y-charges[x].y;
		var dist=Math.sqrt(Dx*Dx+Dy*Dy);
		var denom=dist*dist*dist;
		console.log(Dx/denom);
		var vx=400000*charges[x].sign*this.charge.sign*Dx/denom;
		var vy=400000*charges[x].sign*this.charge.sign*Dy/denom;
		var n=new arrow(this.charge.x,this.charge.y,vx,vy);
		n.object.attr({stroke:"purple","stroke-width":2});
		sx+=vx;
		sy+=vy;
		this.arrows.push(n);
	    }
	}
	target.sum=new arrow(this.charge.x,this.charge.y,sx,sy);
	target.sum.object.attr({stroke:"black","stroke-width":3});
	if(typeof this.charge == "object"){this.charge.object.toFront();}
    }
    
}
//----------------------------------------
function arrow(x,y,dx,dy){
    this.x=x;
    this.y=y;
    this.dx=dx;
    this.dy=dy;
    this.L=Math.sqrt(dx*dx+dy*dy);
    var L=this.L;
    var headL=L*0.1;
    var headW=L*0.05;
    this.angle=Math.atan2(dy,dx)*180/Math.PI;
    var angle=this.angle;
    this.object=paper.path("M"+x+","+y
			   +"l"+L+",0"
			   +"l"+(-headL)+","+(-headW)
			   +"l0,"+(2*headW)
			   +"l"+headL+","+(-headW)).attr({fill:"black"});
    this.object.transform("R"+angle+","+x+","+y);
    this.remove=function(){this.object.remove();}
}
function charge(sign,x,y) {
    var imgfile;
    this.sign=sign;
    this.x=x;
    this.y=y;
    if(sign>0){imgfile="positive.png";} else {imgfile="negative.png";}
    this.object=paper.image(imgfile,x-20,y-20,40,40);
    this.object.parent=this;
    this.move=function(x,y){
	this.x=x;
	this.y=y;
	if(this==target.charge){target.set(this);}
	this.object.attr({x:x-20,y:y-20});
	//update forces
    };
    this.start=function(){
	this.ox=this.parent.x;
	this.oy=this.parent.y;
	this.newQ=0;
	this.movedQ=0;
	target.clear();
	if (!(Raphael.isPointInsideBBox(work.getBBox(),this.ox,this.oy))) {
	    this.newQ=1;
	    //create a new copy of the original
	    templatecharge(this.parent.sign);
	    //make it the target?
	}
    }
    this.drag=function(dx,dy){
	if(dx*dx+dy*dy>1){this.movedQ=1;}
	target.draw();
	this.parent.move(this.ox+dx,this.oy+dy);
    }
    this.end=function(){
	if (!(Raphael.isPointInsideBBox(work.getBBox(),this.parent.x,this.parent.y))) {
	    var idx=charges.indexOf(this.parent);
	    console.log(idx);
	    charges.splice(idx,1);
	    this.remove();
	    //Need to choose a different target!
	    target.clear();
	} else {
	    if (this.newQ) {
		charges.push(this.parent);
	    }
	    if(this.newQ || !this.movedQ){target.set(this.parent);}
	    target.draw();
	}
    }
    this.object.drag(this.drag,this.start,this.end);
//    console.log("x="+this.x);
//    console.log(this.object.parent.x);
};
//----------------------------------------
function templatecharge(sign){
    if(sign>0){
	positive=new charge(+1,work.attr("x")-25,work.attr("y")+work.attr("height")*0.5);
	positive.object.toBack();
    } else {
	negative=new charge(-1,work.attr("x")+work.attr("width")+25,work.attr("y")+work.attr("height")*0.5);
	negative.object.toBack();
    }

}
