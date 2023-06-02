var paper;
var kid=[]; //an array
var timeout=100;
var grect;
var gap=100;
var SrcW,SrcE,SrcN,SrcS;
var button=new Array;
var init=function (name,wd,ht,per){//per is the size
    paper=Raphael(name,wd.ht);
    var nx=Math.floor((wd-2*gap)/per);
    var ny=Math.floor((ht-2*gap)/per);
    for(i=0;i<nx;i++){
	for(j=0;j<ny;j++){
	    kid[i*ny+j]=new Kid(gap+per/2+per*i,gap+per/2+per*j);
	    kid[i*ny+j].localbound(per,per);
	}
    }
    grect=paper.rect(gap,gap,nx*per,ny*per);grect.toBack();
    animate();
    SrcW=new Source(-1,0);
    SrcE=new Source(1,0);
    SrcN=new Source(0,-1);
    SrcS=new Source(0,1);
    button[0]=new Button(5,5,"Conductor","gray",global);
    button[1]=new Button(5,50,"Insulator","orange",local);
    button[1].switch(1);
    button[0].switch(0);
}
function Button(x,y,txt,color,fn){
    this.x=x;
    this.y=y;
    this.do=fn;
    this.width=90; this.height=40;
    this.object=paper.rect(this.x,this.y,this.width,this.height).attr({stroke:"",fill:color});
    this.txt=paper.text(this.x+this.width/2,this.y+this.height/2,txt).attr({fill:"white","font-size":18});
    this.object.parent=this;
    this.txt.parent=this;
    this.switch=function(q){
	if(q){
	    this.object.attr({stroke:"black","stroke-width":5});
	    this.txt.attr({fill:"black"});
	} else {
	    this.object.attr({stroke:""});
	    this.txt.attr({fill:"white"});
	}
    }
    this.click=function(obj){
	for (b in button){//console.log(b);console.log(button[b]);
	    button[b].switch(0);
			 }
	obj.switch(1);
	obj.do();
    }
    this.object.click(function(){this.parent.click(this.parent);});
    this.txt.click(function(){this.parent.click(this.parent);});
}
    
function Source(sx,sy){
    this.sx=sx;
    this.sy=sy;
    this.active=0; //0 in, 1 out
    this.positive=paper.rect(0,0,1,1).attr({fill:"blue"});
    this.positive.parent=this;
    this.posL=paper.text(1,1,"+").attr({fill:"white","font-size":36});
    this.resize=function(w){//q=0 for withdrawn, 1 for extended
	var X=grect.attr("width");
	var Y=grect.attr("height");
	var nx=(this.sx+1)*(0.5*(X-w)*this.sx+gap),
	ny=(this.sy+1)*(0.5*(Y-w)*this.sy+gap),
	nw=this.sx*this.sx*(w-X)+X,
	nh=this.sy*this.sy*(w-Y)+Y;
	this.positive.animate({
		x: nx,
		y: ny,
		width: nw,
	    height: nh
		    },100);
	this.posL.animate({x:nx+nw/2,y:ny+nh/2},100);

	
    }
    this.move=function(q){//1 for active, 0 for withdrawn
	this.resize(gap*0.8*q+gap*0.2*(1-q));
	vel(8*this.sx*q,8*this.sy*q);
	this.active=q;
    }
//    this.toggle=function(obj){RetractAll();obj.move(1-obj.active);}
//    this.positive.click(this.toggle(this.parent));
        this.positive.click(
	    function(){var duh=1-this.parent.active;RetractAll();this.parent.move(duh);}
	)
    this.move(0);
}
function RetractAll(){
    if(typeof SrcW=="object"){
	SrcW.move(0);
	SrcE.move(0);
	SrcN.move(0);
	SrcS.move(0);
    }
}
function Kid(x,y) {
    var height=20;
    var width=20;
    this.height=height; this.width=width;
    this.x0=x;this.y0=y; //fixed
    this.x=x;this.y=y; //will update as it moves
    this.object=paper.image("NegativeKid.png",x-width/2,y-height/2,width,height);
    this.globalbound=function(obj){
	this.lbound.hide();
	this.bounds=obj;
    	this.reset();
    }//pass it the global bound rectangle
    this.positive=paper.image("Positive.png",x-width/2,y-height/2,width,height);
    this.positive.toBack();
    this.localbound=function(dx,dy){
	if(!(typeof this.lbound=="object")){
	    this.lbound=paper.ellipse(this.x0,this.y0,dx/2,dy/2);
	}
	this.lbound.attr({x:this.x0-dx/2,y:this.y0-dy/2,width:dx,height:dy});
	this.bounds=this.lbound;
	this.bounds.show();
	this.bounds.toBack();
	this.reset();
    }
    this.inbounds=function(){
	if(typeof this.bounds=="object"){
	    var x,y;
	    if(arguments.length>=2){x=arguments[0];y=arguments[1];} else {x=this.x;y=this.y;}
	    return Raphael.isPointInsideBBox(this.bounds.getBBox(false),x,y);
	} else return true;
    }
    this.move=function(x,y){
	if(this.inbounds(x,y)){
	    this.x=x;
	    this.y=y;	    
	    this.object.attr({x:x-width/2,y:y-height/2});
	}	
    }
    this.dmove=function(dx,dy){
	var x=this.x+dx; var y=this.y+dy; 
	if(this.inbounds(x,y)){
	    var w=this.width; 
	    var h=this.height;
	    this.x=x;
	    this.y=y;
	    this.object.animate({x:x-w/2,y:y-h/2},timeout,"<>");
	}
    }
    this.reset=function(){this.move(this.x0,this.y0);}
    this.Dstep=10; //size of each random step
    this.ahandle; //handle for the animation timeout
    this.vx=0;this.vy=0;//bias for the random walk
    this.animate=function(){
	if(this.Dstep==0){return;}
	var dx=(2*Math.random()-1)*this.Dstep+this.vx;
	var dy=(2*Math.random()-1)*this.Dstep+this.vy;
	this.dmove(dx,dy);
    }
}
var ahandle;
function animate(){
    for (k in kid){kid[k].animate();}
    ahandle=setTimeout("animate()",timeout);
}
function local(dx,dy){
    for (k in kid){kid[k].localbound(dx,dy);}
}
function global(dx,dy){
    for (k in kid){kid[k].globalbound(grect);}
}
function vel(vx,vy){
    for (k in kid){
	kid[k].vx=vx;
	kid[k].vy=vy;
    }
}
