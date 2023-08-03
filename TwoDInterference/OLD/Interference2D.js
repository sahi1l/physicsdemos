let main = {} //replacement for "this"
let name,W,H,paper; //the BIG 4
//local variables that depend on the BIG 4
//parameters
main.spacing=20;
let p=0; 
//----------INIT----------
init=function(_n,_W,_H){
    let name=_n;
    let W = _W;
    let H = _H;
    let paper = Raphael(name,W,H);
    //other variables that depend on the BIG 4
    //textbox
    var textdiv=$("#"+name.replace("cvs","txt"));
    $(textdiv).html("\
<span style=\"background-color:#FC4850;\">&nbsp;&nbsp;&nbsp;&nbsp;</span>\
<span style=\"background-color:#4753FB;\">&nbsp;&nbsp;&nbsp;&nbsp;</span>\
 Constructive Interference &nbsp;&nbsp;&nbsp;&nbsp;\
<span style=\"background-color:#C04C89;\">&nbsp;&nbsp;&nbsp;&nbsp;</span> Destructive Interference\
<div style=\"font-size:150%\">Path Difference: <span id=\"pathdiff\">0</span> &lambda;</div>");

        //function that starts the show
        this.left=new this.Ripple(W/4,H/2);
        this.right=new this.Ripple(3*W/4,H/2);
        this.left.raise();
        this.right.raise();
        this.left.source.toFront();
        this.rulers=new this.Rulers();
        this.left.source.toFront();
        this.right.source.toFront();
	paper.path(Raphael.format("M{0},0l0,{1}",W/2,H)).attr("stroke-dasharray","-").attr("stroke","white");
        this.animate();
        $("#start").click(main.animate);
        $("#stop").click($.proxy(function(){console.log("stop",main.stopanimate);main.stopanimate=1;},main));
    }
    //----------------------------------------
    //FUNCTIONS (with var!)
        var LabelledLine=function(x0,y0){
            var linestyle={stroke:"white","stroke-width":3,"stroke-dasharray":"."};
            this.line=paper.path("M0,0").attr(linestyle);
            var bW=40;
            var bH=20;
            this.backing=paper.rect(-100,-100,bW,bH).attr({fill:"white",stroke:"black"});
            this.label=paper.text(0,0,"").attr({"font-size":18,fill:"black"});
            this.draw=function(x,y,text){
                this.line.attr("path","M"+x0+","+y0+"L"+x+","+y);
                var length=(Math.sqrt((x-x0)*(x-x0)+(y-y0)*(y-y0))/(2*main.spacing)).toFixed(1);
                var tx=(x0+x)*0.5, ty=(y0+y)*0.5;
                this.backing.attr({x:(tx-bW*0.5),y:(ty-bH*0.5)});
                this.label.attr({x:tx,y:ty,"text":length});
                return parseFloat(length);
            }
        }
        this.Rulers=function(){
            this.point={x:0,y:0};
            this.left=new LabelledLine(main.left.x0,main.left.y0);
            this.right=new LabelledLine(main.right.x0,main.right.y0);
            this.overlay=paper.rect(0,0,W,H).attr({opacity:0.05,fill:"black"});
            this.initx=0; this.inity=0;
            this.overlay.drag(function(dx,dy){
                    this.draw(this.initx+dx,this.inity+dy);
                }, function(x,y){
                    var offset=$(".canvas").offset();
                    this.initx=x-offset.left; this.inity=y-offset.top;
                    this.draw(this.initx,this.inity);
},
                function(){},
                this,this,this
                );

            this.draw=function(x,y){
                var diff=Math.abs(this.left.draw(x,y,"")-this.right.draw(x,y,"")).toFixed(1);
                $("#pathdiff").text(diff);
                
            }
        };
        this.Ripple=function(x0,y0){
            var imax=W/main.spacing;
            this.respace=function(){
                imax=W/main.spacing;
                //need to draw a new set of circles down below, or else redefine ripple maybe?
            }
            this.x0=x0; this.y0=y0;
            paper.setStart();
            for(var i=0;i<imax;i++){
                paper.circle(x0,y0,i*main.spacing).attr("stroke-width",main.spacing).attr("stroke",["red","blue"][i%2]).attr("opacity",0.5);
            }
            this.visible=1;
            this.circles=paper.setFinish();
            this.source=paper.circle(x0,y0,main.spacing/2).attr("fill","black");
            this.togglevisibility=function(){
                console.log("click");
                this.visible=1-this.visible;
                if(this.visible){this.circles.show();} else {this.circles.hide();}
            }
            this.source.click($.proxy(this.togglevisibility,this));

            this.raise=function(){
                for(var i=0;i<imax;i+=2){
                    this.circles[i].toFront();
                }
                this.source.toFront();
            };
            this.animate=function(p){
                //p ranges from 0 to 1
                for(var i=0;i<imax;i++){
                    this.circles[i].attr("r",(i+p)>=0?(i+p)*main.spacing:0);
                }
            }
            
        };
        main.stopanimate=0;
        main.stop=function(){
            main.stopanimate=1;
        };
        main.animate=function(){
         p+=0.05;
         if(p>=1){p-=2;}
         main.left.animate(p);
         main.right.animate(p);
         if(!main.stopanimate){
             setTimeout(main.animate,100);
         }
         main.stopanimate=0;
        };
    //----------------------------------------
    };
$(
    function(){
        Interference2D.init("cvs-canvas",400,400);
    }
    );
