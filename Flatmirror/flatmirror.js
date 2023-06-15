//don't allow vertical motion for object; i get it wrong
var FlatMirror=new function(){
    var name,W,H;
    var paper;
    var device,dvcx;
    let objx,objy,objr;
    var f="flat";//focal length, "flat" for flat mirror
    var type="m"; //m or l
    //----------------------------------------    
    Line=function(x0,y0,x1,y1){
        //Draws a ray that starts at x0,y0 and passes through x1,y1 and then continues to border
        //returns the end point
        var X=x1;
        var Y=y1;
        var xmin=0,xmax=W,ymin=0,ymax=H;
        var tmin,t;
        if(x0!=x1){
            t=(xmin-x0)/(x1-x0);
            if(t>0){
                tmin=t;
                X=xmin;
                Y=y0+t*(y1-y0);
            } else {
                t=(xmax-x0)/(x1-x0);
                tmin=t;
                X=xmax;
                Y=y0+tmin*(y1-y0);
            }
        }
        if(y0!=y1){
            t=(ymin-y0)/(y1-y0);
            if(t>0){
                if(t<tmin){
                    Y=ymin;
                    X=x0+t*(x1-x0);
                }
            } else {
                t=(ymax-y0)/(y1-y0);
                if(t<tmin){
                    Y=ymax;
                    X=x0+t*(x1-x0);
                }
            }
        }
        return X+","+Y;
    };
    Ray=function(y,parent,color){
        //Defined in terms of a point on the mirror
        //Changes whenever object moves
        if(color==undefined) {color="purple";}
        var incident=paper.path("")
            .attr({stroke:"black","stroke-width":4,"arrow-end":"classic"});
        var ray=paper.path("")
            .attr({stroke:"blue","stroke-width":3,"arrow-end":"classic"});
        var trace=paper.path("")
            .attr({stroke:"cyan","stroke-width":3,
                   "stroke-dasharray":"-"});
	var normal=paper.path(Raphael.format("M{0},{1}l{2},0",dvcx-100,y,200)).attr("stroke-dasharray",".");
        this.set=function(){
            var imgx=parent.imgx;
            var imgy=parent.imgy;
            incident.attr({
                path:Raphael.format(
                    "M{0},{1}L{2},{3}",
                    parent.x,parent.y,
                    dvcx,y
                )});
            ray.attr({
                path:Raphael.format(
                    "M{0},{1}L{2}",
                    dvcx,y,
                    Line(imgx,imgy,dvcx,y)
                    )});
            trace.attr({
                path:Raphael.format(
                    "M{0},{1}L{2}",
                    dvcx,y,
                    Line(dvcx,y,imgx,imgy)
                )});
            incident.toBack();
            ray.toBack();
            trace.toBack();
        }
    }
    Principal=function(x,y){
        this.x=x;this.y=y;
        this.img=paper.circle(x,y,objr).attr({fill:"cyan"});
        this.obj=paper.circle(x,y,objr).attr({fill:"black"});
        this.rays=[];
        var ox,oy;
        this.imgx=0;
        this.imgy=0;
        this.image=function(){
            var p=dvcx-this.x; var i;
            if(f=="flat"){
                i=-p;
            } else {
                if (p==f){p=f+0.01;}
                i=p*f/(p-f);
            }
//            var i=-(p*50)/(p-50.0);
            //Mirrors versus lenses:
            //Need to flip the dashedness of ray and trace
            //Need to flip the sign
            //Use lens equation for i
            //Something weird is happening: dash flips direction
            this.imgx=dvcx-i;
            this.imgy=this.y;
            this.img.attr({cx:this.imgx,cy:this.imgy});
        }
        this.set=function(x,y){
            this.x=x;
            this.y=y;
            this.obj.attr({cx:x,cy:y});
            this.image();
            for (r in this.rays){this.rays[r].set();}
        }
        this.start=function(){
            ox=this.x; oy=this.y;
        }
        this.drag=function(dx,dy){
            this.set(ox+dx,oy+dy);
        }
        this.end=function(){}
        this.obj.drag(this.drag,this.start,this.end,this,this,this);
    }
    //----------------------------------------
    this.init=function(_name,_W,_H){
        name=_name;W=_W;H=_H;
        paper=Raphael(name,"100%","100%");
        W=400; H=400;
        paper.setViewBox(0,0,W,H);
        dvcx=W/2;
        objx = W/4;
        objy = H/2;
        objr = 10;
        device = paper.path(Raphael.format("M{0},0L{0},{1}",dvcx,H))
            .attr({"stroke-width":3});
        obj = new Principal(objx,objy);
        obj.rays.push(new Ray(100,obj));
        obj.rays.push(new Ray(200,obj));
        obj.rays.push(new Ray(300,obj));
        obj.set(objx,objy);
    };
}
