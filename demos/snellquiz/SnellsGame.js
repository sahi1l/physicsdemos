//Components:

SnellsGame=new function(){
    "use strict";
    console.log("here we go!")
    var that=this,
        name,W,H,paper; //the BIG 4
    this.paper=paper;
    //local variables that depend on the BIG 4
        var R,x0,y0;
        var iface,rays;
        var textdiv;
    //parameters
    //----------INIT----------
    this.init=function(_n,_W,_H){
        name=_n;W=_W;H=_H;
	console.log("running init",name,W,H)
        paper=Raphael(name,W,H);
        R=Math.max(W,H); //will be used to draw lines
        x0=W/2; y0=H/2;
        //other variables that depend on the BIG 4
        //textbox
        //function that starts the show
        paper.rect(0,0,W,H).attr("fill","#DDF").click(function(){checkAnswer(0);});
	;
	console.log("OK I just drew a rectangle. See it?")
        textdiv=$("#"+name.replace("cvs","txt"));
        $(textdiv).css("font-size",16);
        this.iface=new iface();
	console.log("new rays")
        this.rays=new rays();
	console.log("running one")
        this.one();
    }
    //----------------------------------------
    //FUNCTIONS (with var!)
        this.setText=function(txt){
            var textdiv=$("#"+name.replace("cvs","txt"));
            $(textdiv).html("<i>A game to test your understanding at refraction:</i><br/>"+txt);
        }
    this.one=function(){
	console.log("Running choose")
        that.iface.choose();
	console.log("Running draw")
        that.iface.draw();
	console.log("Running choose")
        that.rays.choose();
	console.log("Running draw")
        that.rays.draw();
//            if(that.rays.Ifaster){
//                that.setText("slowing down");
//            } else {
//                that.setText("speeding up");
//            }
        }
            var linepath=function(angle,halfQ,mul){
            if(mul==undefined){mul=1;}
            var dx=mul*R*Math.cos(angle);
            var dy=mul*R*Math.sin(angle);
            if(halfQ==2){//box
                return "M"+(x0-dx)+","+(y0-dy)+"L"+(x0+dx)+","+(y0+dy)+"L"+(x0+dy)+","+(y0-dx)+"L"+(x0-dx)+","+(y0-dy);}
            else if(!halfQ){
                return "M"+(x0-dx)+","+(y0-dy)+"L"+(x0+dx)+","+(y0+dy);
            } else {
                return "M"+x0+","+y0+"L"+(x0+halfQ*dx)+","+(y0+halfQ*dy);
            }
        }
                var checkAnswer=function(answer){
                    var result="";
                    var correct=that.rays.correct;
                    console.log(answer+","+correct);
                    if(answer==correct){
                        result="Correct!";
                    } else {
                        result="Incorrect.";
                    }
                    if(correct){
                        result+="<br>The ray slows down as it enters the new material.";
                    } else {
                        result+="<br>The ray speeds up as it enters the new material.";
                    }
                    that.setText(result);
                    setTimeout(that.one,4000);
                }
        var iface=function(){
            this.angle=0; //angle in radians, others will access this
            this.line=paper.path("M100,100L200,200").attr({"stroke-width":3,"fill":"#FDD"});
            this.line.click(function(){checkAnswer(1);});
            this.normal=paper.path("").attr("stroke-dasharray",".");
            this.draw=function(){
                this.line.attr("path",linepath(this.angle,2,1));
                this.normal.attr("path",linepath(this.angle+Math.PI/2));
                console.log(this.line.attr("path"));
                //change parameter of this.line
                //possibly draw different materials too? maybe line is really a polygon
            }
            this.choose=function(){
                this.angle=Math.random()*2*Math.PI;
            }
        };
        var rays=function(){
            this.Iangle=1; //angle relative to the interface's normal, in radians
            this.Tangle=0.5; //transmitted angle, ditto
            this.Ifaster=0; //1 if I is faster, 0 if T is faster
            this.correct=0;
            this.incident=paper.path("").attr({"stroke":"red","stroke-width":4,"arrow-start":"classic-wide-long"}); 
            this.transmitted=paper.path("").attr({"stroke":"blue","stroke-width":4,"arrow-end":"classic-wide-long"}); 
            //FIX: to add arrowhead to transmitted, need to calculate intersection with border, or just add an additional line partway.  Maybe it doesn't have to go all the way to the border
            this.choose=function(){
                this.Ifaster=Math.floor(Math.random()*2);
                this.correct=this.Ifaster;
                if(this.Ifaster){
                    //Tangle should be smaller
                    //put it between 10 and 40
                    
                    this.Tangle=(Math.random()*30+10)*Math.PI/180.0;
                    //Iangle should be 10-40 degrees larger
                    this.Iangle=this.Tangle+(Math.random()*20+20)*Math.PI/180.0;
                //If Ifaster, then Tangle will be smaller
                } else {
                    this.Iangle=(Math.random()*30+10)*Math.PI/180.0;
                    this.Tangle=this.Tangle+(Math.random()*20+20)*Math.PI/180.0;
                }                    
                if(Math.random()<0.5){
                    this.Tangle*=-1;this.Iangle*=-1;
                }
                switch(Math.floor(Math.random()*4)) {
                case 0:
                that.setText("Click the material where light is faster.");
                break;
                case 1:
                that.setText("Click the material where light is slower.");
                this.correct=1-this.correct;
                break;
                case 2:
                that.setText("Click the material with the higher index of refraction..");
                this.correct=1-this.correct;
                break;
                case 3:
                that.setText("Click the material with the lower index of refraction.");
                break;
                }
            }
            this.draw=function(){
                this.incident.attr("path",linepath(that.iface.angle+Math.PI/2+this.Iangle,-1));
                this.transmitted.attr("path",linepath(that.iface.angle-Math.PI/2+this.Tangle,-1,0.49));
                //measure 
            }
            
        }
    //----------------------------------------
};
        
$(function(){
    SnellsGame.init("refraction",400,400);
}
 )
