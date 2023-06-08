SPINS=new function(){
        "use strict";
        var that=this;
        var paper;
        this.size=200;
        this.init=function(W,H){
            this.paper=Raphael("canvas",W,H);
            paper=this.paper;
            this.W=W; this.H=H;
            var gun=new Gun(100,100);
//            var analyzer=new Analyzer();
//            analyzer.create(300,300);
        };
//============================================================
        function Link(x,y,offx,offy) {
            this.obj=paper.path("").attr({"stroke-width":"5px","stroke":"blue"});
            this.connected=undefined; //object the link is connected to
            this.offset={x:offx,y:offy};
            this.B={x:x+offx,y:y+offy}; //beginning point
            this.E={x:x+offx+50,y:y+offy}; //end point
            this.draw=function(){
                var S=Raphael.format("M{0},{1}L{2},{3}",this.B.x,this.B.y,this.E.x,this.E.y);
                this.obj.attr("path",S);
            }
            this.setbegin=function(x,y){
                this.B={x:x+this.offset.x,y:y+this.offset.y};
                if(!this.connected){
                    this.E.x=this.B.x+50;
                    this.E.y=this.B.y;
                }
                this.draw();
            }
            this.setend=function(x,y){
                this.connected=1; //actually needs to be an object, and call a method which gives me E
                this.E.x=x;
                this.E.y=y;
                this.draw();
            };    
            this.draw();
            this.Dstart=function(x,y){this.ox=x;this.oy=y;}
            this.Dmove=function(dx,dy,x,y){
                this.setend(this.ox+dx,this.oy+dy);
                var element=paper.getElementByPoint(x,y);
                if(element){this.obj.attr("stroke","red");console.log(element);} else {this.obj.attr("stroke","blue");}
            };
            
            this.Dend=function(x,y){
                //check if connected to a real object, otherwise disconnect
            };
            this.obj.drag(this.Dmove,this.Dstart,this.Dend,this,this,this);
        };
//============================================================
        function Gun(x,y) {
            var width=that.size, height=that.size;
            this.object=paper.image("Images/Gun.png",0,0,width,height).attr("tag",0);
            //store an array of ids and associated objects, use them to snap links into place.
            console.log(this.object.id);
            this.link=new Link(x,y,width/2-10,0);
//            this.link=paper.path("").attr({"stroke-width":"5px","stroke":"blue"});
//            this.drawlink=function(){
//                if(!this.linkout){
//                    this.linkE={x:this.linkB.x+60,y:this.linkB.y};
//                };
//                var S=Raphael.format("M{0},{1}L{2},{3}",this.linkB.x,this.linkB.y,this.linkE.x,this.linkE.y);
//                this.link.attr("path",S);
//            };
//            this.linkout=0;
//            this.create=function(x,y){this.setpos(x,y);};
            this.setpos=function(x,y){
                this.x=x; this.y=y;
                var ox=x-width/2, oy=y-height/2;
                this.object.attr({x:ox,y:oy});
//                this.linkB={x:ox+width-10,y:oy+height/2};
                this.link.setbegin(x,y);
                this.link.draw();
//                this.drawlink();
            };
            this.setpos(x,y);
            /*
             */
            this.Dstart=function(x,y){this.ox=this.x;this.oy=this.y;};
            this.Dmove=function(dx,dy){this.setpos(this.ox+dx,this.oy+dy);}
            this.Dend=function(){;}
            this.object.drag(this.Dmove,this.Dstart,this.Dend,this,this,this);
            

        };
//============================================================
        function Analyzer(){
            var width=that.size, height=that.size;
            this.object=paper.image("Images/Analyzer.png",0,0,width,height);
            this.link1=paper.path("").attr({"stroke-width":"5px","stroke":"blue"});
            this.link2=paper.path("").attr({"stroke-width":"5px","stroke":"blue"});
            this.linkout1=0; this.linkout2=0;
            this.drawlink=function(){
                if(!this.linkout){
                    this.linkE={x:this.linkB.x+60,y:this.linkB.y};
                };
                var S=Raphael.format("M{0},{1}L{2},{3}",this.linkB.x,this.linkB.y,this.linkE.x,this.linkE.y);
                this.link.attr("path",S);
            };
            this.create=function(x,y){this.setpos(x,y);};
            this.setpos=function(x,y){
                this.x=x; this.y=y;
                var ox=x-width/2, oy=y-height/2;
                this.object.attr({x:ox,y:oy});
                this.linkB={x:ox+width-10,y:oy+height/2};
                this.drawlink();
            };
            this.Dstart=function(x,y){this.ox=this.x;this.oy=this.y;};
            this.Dmove=function(dx,dy){this.setpos(this.ox+dx,this.oy+dy);}
            this.Dend=function(){;}
            this.object.drag(this.Dmove,this.Dstart,this.Dend,this,this,this);
        };

//============================================================
//============================================================
    };

$(function(){
        SPINS.init(1500,1000);
    });

