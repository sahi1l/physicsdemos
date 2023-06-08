var Lens=new function(){
    var name,W,H;
    var paper;
    var mirror=1;
    var scale=30;
    this.init=function(_name,_W,_H){
        name=_name; W=_W; H=_H;
        paper=Raphael(name,W,H);
        $("#"+name).css("height",H+"px");
        $("#"+name).css("width",W+"px");
        $("#txt-"+name).css("width",W+"px");
        //----------------------------------------
        function C2S(x,y){
            return {x:device.x - x*scale, y:axis.y-y*scale};
        };
        function S2C(x,y){
            return {x:(device.x-x)/scale,y:(axis.y-y)/scale};
        };
        function raypath(my){
            var mul=1;
            var x0=C2S(obj.p,0).x;
            var y0=C2S(0,obj.h).y;
            var x1=device.x;
            var y1=C2S(0,obj.h).y;
            var x2=C2S(-device.type*img.i,0).x;
            var y2=C2S(0,-img.h).y;
            return Raphael.format(
                "M{0},{1}L{2},{3}L{4},{5}",
                x0,y0,x1,y1,x1+(x2-x1)*mul,y1+(y2-y1)*mul);
        }
        //----------------------------------------
        var device=new function(){
            this.x=W/2;
            var width=10,gap=20;
            this.lbl="Lens";
            paper.setStart();
            var rect=paper.rect(this.x-width/2,gap,width,H-2*gap).attr({fill:"cyan"});
            var label=paper.text(this.x-width/2,gap/2,"Converging Lens").attr({"font-size":24,"cursor":"pointer","background-color":"white"});
            this.all=paper.setFinish();
            this.type=-1; //1 for mirror, -1 for lens
	    this.updateLabel=function(){
		var cd="Converging";
		if(focus.f<0){cd="Diverging";}
		if(this.type==mirror){
		    this.lbl=cd+" Mirror";
		} else {
		    this.lbl=cd+" Lens";
		}
                label.attr({text:this.lbl});
	    }
            this.toggle=function(){
                this.type=-this.type;
		this.updateLabel();
//                if(this.type==mirror){
//                    this.lbl="Mirror";
//                } else {
//                    this.lbl="Lens";
//                }
                focus.set(focus.f);
                img.set();
            }
            this.front=function(){
                rect.toFront();
                label.toFront();
            }
            this.all.click($.proxy(this.toggle,this));
        };
        //----------------------------------------
        var axis=new function(){
            this.y=H/2;
            var line=paper.path(Raphael.format("M0,{0}l{1},0",this.y,W)).attr({"stroke-dasharray":"-"});
        }
        //----------------------------------------
        var grid=new function(){
            var max=S2C(0,0);
            var min=S2C(W,H);
            var i;
            paper.setStart();
            for(i=Math.floor(max.x);i>=min.x;i--){
                paper.path("M"+C2S(i,0).x+",0l0,"+H);
            }
            for(i=Math.floor(max.y);i>=min.y;i--){
                paper.path("M0,"+C2S(0,i).y+"l"+W+",0");
            }
            var all=paper.setFinish();
            all.attr({stroke:"gray","stroke-dasharray":"."});
        };
        device.front();
        //----------------------------------------
        var ray=function(color,y){
            this.color=color;
            this.y=y;
            paper.setStart();
            var oray=paper.path("");
            var image=paper.path("");
            var dashed=paper.path("");
            var all=paper.setFinish();
            all.attr({stroke:color,"stroke-width":6});
            this.set=function(y){
                this.y=y;
                var x0=C2S(obj.p,0).x;
                var y0=C2S(0,obj.h).y;
                var x1=device.x;
                var y1=C2S(0,this.y).y;
                var x2=C2S(-device.type*img.i,0).x;
                var y2=C2S(0,-img.h).y;
                var mul=4;
                oray.attr({path:Raphael.format("M{0},{1}L{2},{3}",
                                               x0,y0,x1,y1)});
                image.attr({path:Raphael.format("M{0},{1}L{2},{3}",
                                                x1,y1,x1+(x2-x1)*mul,y1+(y2-y1)*mul)});
                dashed.attr({path:Raphael.format("M{0},{1}L{2},{3}",
                                                 x1,y1,x1-(x2-x1)*mul,y1-(y2-y1)*mul)});
                if(-img.i>0){
                    image.attr({"stroke-dasharray":"","stroke-width":3});
                    dashed.attr({"stroke-dasharray":"-","stroke-width":2});
                    if(img.h*obj.h>0){dashed.hide();} else {dashed.show();}
                } else {
                    image.attr({"stroke-dasharray":"-","stroke-width":2});
                    dashed.attr({"stroke-dasharray":"","stroke-width":3});
                    image.show();
                    dashed.show();
                }
            }
        }
        var rays=new function(){
            var color;
            var top=new ray("orange",0);
            var cen=new ray("blue",0);
            var bot=new ray("green",0);
            
            this.set=function(){
                top.set(obj.h);
                cen.set(0);
                bot.set(-img.h);
            }
        }
        //----------------------------------------
        var focus=new function(){
            this.f=1;
            var radius=10;
            var near=paper.circle(0,axis.y,radius).attr({fill:"black"});
            var far=paper.circle(0,axis.y,radius).attr({fill:"black"});
            var center=paper.circle(0,axis.y,radius).attr({fill:"purple"});
            this.set=function(f){
                this.f=f;
                near.attr({cx:C2S(f).x});
                if(device.type==mirror){
                    far.hide();
//                    center.show();
                    center.attr({cx:C2S(2*f).x});
                } else {
                    center.hide();
                    far.show();
                    far.attr({cx:C2S(-f).x});
                }
                img.set();
            }
            var ox;
            this.start=function(){
                ox=near.attr("cx");
            }
            this.drag=function(dx,dy){
                var nf=S2C(ox+dx).x;
                nf=Raphael.snapTo(1,nf,0.2);
//                if(nf<0){nf=0;}
                this.set(nf);
		device.updateLabel();
            }
            this.end=function(){
            }
            near.drag(this.drag,this.start,this.end,this,this,this);
        }
        //----------------------------------------
        var numbers;
        //----------------------------------------
        var obj=new function(){
            this.p=1; this.h=1; this.width=20; 
            this.obj=paper.rect(0,0,this.width,0).attr({fill:"red"});
            this.set=function(p,h){
                this.p=p;
                this.h=h;
                this.obj.attr({x:C2S(this.p,0).x-this.width/2});
                if(this.h>=0){
                    this.obj.attr({y:C2S(0,this.h).y,height:this.h*scale});
                } else {
                    this.obj.attr({
                        y:C2S(0,0).y,
                        height:-this.h*scale
                    })
                };
                img.set();
                //Might have to handle negative height differently
            };
            var op,oh;
            this.start=function(){
                op=this.p;
                oh=this.h;
            }
            this.drag=function(dx,dy){
                var np=Raphael.snapTo(1,op-dx/scale,0.2);
                var nh=Raphael.snapTo(1,oh-dy/scale,0.2);
		if(np<1){np=1;}
		console.log(np);
                this.set(np,nh);
            }
            this.end=function(){
            }
            this.obj.drag(this.drag,this.start,this.end,this,this,this);
        };
        //----------------------------------------
        var img=new function(){
            this.i=0; this.h=0; this.width=20;
            this.obj=paper.rect(0,0,this.width,0).attr({fill:"cyan"});
            this.set=function(){
                var f=focus.f;
                var p=obj.p;
                if(f!=p){this.i=f*p/(f-p);} else {this.i=f*p/(0.01);}
                this.h=-this.i/p*obj.h;
                var H=-this.h*device.type;
                H=-this.h;
               this.obj.attr({x:C2S(-device.type*this.i,0).x-this.width/2});
                if(H>=0){
                    this.obj.attr({y:C2S(0,H).y,height:H*scale});
                } else {
                    this.obj.attr({
                        y:C2S(0,0).y,
                        height:-H*scale
                    })
                };
                rays.set();
//                var cd="Converging";
//                if(focus.f<0){cd="Diverging";}
//                $("#txt-"+name).html("<font size=+3>"+cd+" "+device.lbl
//                                     +" ( <i>f</i> = "+focus.f.toFixed(2)+" )"
//                                     +"<style>td {padding-left:10px};</style><table style=\"border:1;\"><tr>"
//                                     +"<td><i>p</i> = "+obj.p.toFixed(2)
//                                     +"<td><i>i</i> = "+(-img.i).toFixed(2)
//                                     +"<tr><td><i>h<sub>p</sub></i> = "+obj.h.toFixed(2)
//                                     +"<td><i>h<sub>i</sub></i> = "+(-img.h).toFixed(2)
//                                     +"<td><i>M</i> = "+(img.i/obj.p).toFixed(2)
//);
            };
        };
        //----------------------------------------
        focus.set(3);
        obj.set(6,2);
        img.set();
    };
}
