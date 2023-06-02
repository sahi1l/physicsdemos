/*
STEP 1: A wave on a grid that moves, on a separate canvas by itself.
*/
var waves=new function(){
    "use strict";
    var main=this;
    var paper;
    //============================================================
    //GLOBAL VARIABLES HERE
    //============================================================
    //HELPER FUNCTIONS
    //============================================================
    //OBJECTS
    //define as var OBJECT=function(prams){}; call with new in init
        main.wave=function(color){
            this.lambda=main.W;
            this.curve=paper.path("M0,0").attr("stroke",color);
            this.move=function(ph0){
                while(ph0>0){ph0=ph0-1;}
                while(ph0<-1){ph0=ph0+1;}
                if(ph0==0){
                    this.curve.transform("");
                } else {
                    this.curve.transform("t"+(ph0)*this.lambda+",0");
                }
                return ph0;
            }
            this.amp=function(dph){
                var x0;
                dph=((dph%1)+1)%1
                var A=2*((2*dph-0.5)%1)
                //A needs to be calculated via a formula: phase or whatever
                this.curve.transform("t"+x0+",0s1,"+A); //can't combine with amp
            };
            this.draw=function(n,A){
                var y0=main.H*0.5;
                var pfx="M";
                var dp=0.25;
                this.lambda=main.W/(0.0+n);
                A=A*y0;
                var a=this.lambda/2/Math.PI;
                var b=(Math.PI-2)/(4*Math.PI)*this.lambda;
                var dx=this.lambda/4;
                var path="M0,"+y0;
                var one="q"+a+","+(-A)+","+dx+","+(-A)
                +"q"+b+","+0+","+dx+","+(A)
                +"q"+a+","+(A)+","+dx+","+(A)
                +"q"+b+","+0+","+dx+","+(-A);
                path=path+one.repeat(n+1);
                this.curve.attr("path",path);
            };
        };
    //============================================================
    //INITIALIZATION FUNCTION
        main.init=function(W,H){
            paper=Raphael("canvas",W,H);
            main.W=W; main.H=H;
            paper.rect(0,0,W,H);
            main.sR=new main.wave("red");
            main.sL=new main.wave("blue");
            main.ss=new main.wave("black");
            main.sR.draw(3,0.5);
            main.sL.draw(3,0.5);
            main.ss.draw(3,1);
            //SETUP GUI
        };
        
        main.velocity=2;
        main.t0=0;
        main.x0=15;
        main.stoptrace=0;
        main.trace=function(dt,delay){
            //I'll need a way to cancel this please
            if(!delay){delay=100;}
            main.sR.move(main.t0);
            main.sL.move(-main.t0);
            main.ss.amp(main.t0);
            main.t0+=dt;
            if(!main.stoptrace){
                setTimeout($.proxy(function(){main.trace(dt,delay)},main),delay);
            };
            main.stoptrace=0;
        };
        };           

//Initialize once the page is loaded
$(function(){waves.init(800,100);});


/*
*/
