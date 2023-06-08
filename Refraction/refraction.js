var Refraction=new function(){
    var name,W,H;
    var paper;
    //Object definitions
    var Index=function(x,y,color,n0){
        var min=1.0; var max=2.5;
        var fsize=24;
        var width=fsize*2; var height=fsize;
        this.val=n0;
        paper.setStart();
        this.bg=paper.rect(x-width/2,y-3*height/2,width,3*height)
                    .attr({stroke:"black",fill:"gray",opacity:0.01});
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
        this.all=paper.setFinish();
        this.edge=function(){return x+width;}
        this.start=function(){console.log("nclick");this.oval=this.val;}
        this.drag=function(dx,dy){
            this.set(this.oval+Math.floor(dy/10)*0.1);
        }
        this.end=function(){}
        this.bg.drag(this.drag,this.start,this.end,this,this,this);
        this.set=function(nval){
            this.val=Math.max(min,Math.min(max,nval));
            this.label.attr("text",(this.val).toFixed(1));
            var hi=(this.val+0.1).toFixed(1); if(hi>max){hi=" ";}
            this.hilabel.attr("text",hi);
            var lo=(this.val-0.1).toFixed(1); if(lo<min){lo=" ";}
            this.lolabel.attr("text",lo);
            DrawOtherRays();
          
            
        }
        this.set(n0);
    }
    var IncidentRay=function(angle){
        paper.setStart();
        var arrow=paper.path("").attr({"stroke-width":6,"stroke":"red","arrow-end":"classic"});
        arrow.toBack();
        var handle=paper.circle(0,0,10).attr({"fill":"red",stroke:""});
        handle.toBack();
        var label=paper.text(100,100,"hi").attr({"font-size":18});
        var all=paper.setFinish();
        this.angle=angle;
        this.pretty=""; //pretty form of angle
        this.set=function(ang){
            this.angle=ang;
            var g=10; //gap between beginning of ray and wall
            var S=Math.sin(ang);
            var C=Math.cos(ang);
            var hyp=Math.min(Math.abs(cx-g)/Math.abs(S),(cy-g)/Math.abs(C));
            var P=Raphael.format("M{0},{1}L{2},{3}",cx+hyp*S,cy+hyp*C,cx,cy);
            handle.attr({cx:cx+hyp*S,cy:cy+hyp*C});
            this.pretty=(180-Math.abs(ang/Math.PI*180)).toFixed(0)+"°";
            label.attr({x:cx+hyp*S/3,y:2*cy/3+hyp*C/3,
                        text:this.pretty});
            arrow.attr({path:P});
            DrawOtherRays(ang);
        }
        var ox,oy;
        this.start=function(x,y){
            var offset=$("#"+name).offset();
            ox=x-offset.left;
            oy=y-offset.top;
        }
        this.drag=function(dx,dy){
            handle.hide();
            var Dx=ox+dx-cx; var Dy=oy+dy-cy;
            if(Dy>0){Dy=0;}
            var angle=Math.atan2(Dx,Dy);
            this.set(angle);
        }
        this.end=function(){handle.show();}
        all.drag(this.drag,this.start,this.end,this,this,this);
    }
    var RefractedRay=function(){
        paper.setStart();
        var arrow=paper.path("").attr({"stroke-width":6,"stroke":"blue","arrow-end":"classic"});
        arrow.toBack();
        var label=paper.text(100,100,"hi").attr({"font-size":18});
        var all=paper.setFinish();
        this.pretty="";
        this.angle=0;
        this.set=function(ang){
            var g=10; //gap between beginning of ray and wall
            all.show();
            var S=Math.sin(ang);
            var C=Math.cos(ang);
            var hyp=Math.min(Math.abs(cx-g)/Math.abs(S),Math.abs((cy-g)/C));
            var P=Raphael.format("M{0},{1}L{2},{3}",cx,cy,cx-hyp*S,cy+hyp*C);
            arrow.attr({path:P});
            this.angle=-ang;
            this.pretty=(Math.abs(ang/Math.PI*180)).toFixed(0)+"°";
            label.attr({x:cx-hyp*S/3,y:(H+2*cy+hyp*C)/3,
                        text:this.pretty});

        }
        this.hide=function(){all.hide();this.pretty="tir";}
    }
    var ReflectedRay=function(){
        paper.setStart();
        var arrow=paper.path("").attr({"stroke-width":3,"stroke":"red","stroke-dasharray":"-"});
        arrow.toBack();
//        var label=paper.text(100,100,"hi").attr({"font-size":18});
        this.all=paper.setFinish();
//        this.pretty="";
        this.set=function(ang,tir){
            var g=10; //gap between beginning of ray and wall
            if(tir){
                arrow.attr({"stroke-width":6});
            } else {
                arrow.attr({"stroke-width":3});
            }
            var S=Math.sin(ang);
            var C=Math.cos(ang);
            var hyp=Math.min(Math.abs(cx-g)/Math.abs(S),Math.abs((cy-g)/C));
            var P=Raphael.format("M{0},{1}L{2},{3}",cx,cy,cx+hyp*S,cy+hyp*C);
            arrow.attr({path:P});
        }
    }
    var nA,nB;
    var cx,cy;
    var incident,refracted,reflected;
    DrawOtherRays=function(ang){
        if(incident==undefined){return;}
        ang=incident.angle;
        var na=nA.val; var nb=nB.val;
        var Sa=Math.abs(Math.sin(ang));
        var Sb=na/nb*Sa;
        reflected.set(-ang,(Math.abs(Sb)>1));
        if(Math.abs(Sb)>1){refracted.hide();} 
        else {refracted.set(Math.asin(Sb)*Math.sign(ang));}
        if(refracted.pretty=="tir"){
            $("#txt-"+name).html("<TABLE><TR>"
                                 +"<TD>"+nA.val.toFixed(1)+" sin "+incident.pretty+"<BR>"+(nA.val*Math.abs(Math.sin(incident.angle))).toFixed(3)
+"<TD style=\"font-size:96\">\}"
+"<TD>Total Internal Reflection"
+"</TABLE>");
        } else {
            $("#txt-"+name).html("<TABLE><TR>"
+"<TD>"+nA.val.toFixed(1)+" sin "+incident.pretty+"<BR>"+Math.abs(nA.val*Math.sin(incident.angle)).toFixed(3)
+"<TD>=<BR>="
+"<TD>"+nB.val.toFixed(1)+" sin "+refracted.pretty+"<BR>"+Math.abs(nB.val*Math.sin(refracted.angle)).toFixed(3)
+"</TABLE>");
        }
    }
    this.init=function(_name,_W,_H){
        name=_name;W=_W;H=_H;
        paper=Raphael(name,W,H);
        $("#"+name).css("height",H+"px");
        $("#"+name).css("width",W+"px");
        $("#txt-"+name).css("width",W+"px");
        $("#txt-"+name).css("font-size",24);
        $("#txt-"+name).css("align","center");
        cx=W/2; cy=H/2;
        paper.setStart();
        var matA=paper.rect(0,0,W,H/2).attr({fill:"red",opacity:0.1});
        var mat2=paper.rect(0,H/2,W,H/2).attr({fill:"blue",opacity:0.1});
        var boundary=paper.path(Raphael.format("M0,{0}L{1},{0}",H/2,W)).attr("stroke-width",5);
        var normal=paper.path(Raphael.format("M{0},0L{0},{1}",W/2,H)).attr("stroke-dasharray","-");
        var stuff=paper.setFinish();
        nA=new Index(80,30,"red",1.0);
        nB=new Index(80,H-30,"blue",1.5);
        refracted=new RefractedRay(0);
        reflected=new ReflectedRay(0);
        incident=new IncidentRay(0); 
        incident.set(Math.PI);
        reflected.all.toBack();
        stuff.toBack();
    }
        
}
