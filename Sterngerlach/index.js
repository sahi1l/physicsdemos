SPINS=new function(){
    "use strict";
    var main=this;
    var paper;
    main.initrate=100; //initial rate from the gun
    main.size=100;
    main.guns=[]; //list of guns, so I can fire them
    main.objects={}; //maps Raphael ids to the appropriate objects
    main.joins=[]; //so I can update them when "watch" is pressed
    main.detectors=[]; //list of all detectors as objects, so I can rescale them
    main.dt=50;
    main.watch=0; //1 if watching
    var instructions="This is a simulation of the Stern-Gerlach experiment.\n\
The oven creates a stream of silver atoms, which are spin-1/2 particles.\n\
The analyzers measure each atom along a certain axis, producing one of two results probabilistically.\n\
The detectors record each atom that enters.\n\
The joiner will coherently combine two streams from a single analyzer.";
    main.init=function(W,H){
        paper=Raphael("canvas",W,H);
        main.paper=paper; //DEBUG
        main.W=W; main.H=H;
        main.toolbar=paper.rect(0,0,W,TB.height).attr("fill","grey");
        var size=TB.height-20;
        var textstyle={cursor:"default"};
        paper.text(0,TB.height+85,instructions).attr({"fill":"grey","font-size":18,"text-anchor":"start"});
        paper.text(8*size,60,"Analyzers").attr(textstyle);
        this.axes=new Axes(W-200,150);
        $("#acknowledgement").css("top",TB.height+10);

        TB.space(0.5);
        TB.addButton({dx:-1.5, y:0.33, text:"Reset All", fun:main.ClearDetectors, tooltip:"Reset all the detectors to zero."});
        TB.addButton({dx:0, y:1, text:"Start All", fun: main.StartAllGuns, text2:"Stop All", fun2:main.Stop, tooltip:"Start/stop the flow of silver atoms from all ovens."})
        TB.addIcon({image:"Gun", type:Gun, label:"Oven", tooltip:"This generates silver atoms.\nDrag this onto the canvas."});
        TB.addIcon({image:"GunMystery", type:Gun, label:"Mystery Oven", prams: '--', tooltip:"This generates silver atoms\nin a prepared, mystery state."});
        $.each(["Z","X","Y","θ"],function(idx,val){
            var direction=["the Z","the X","the Y","an arbitrary"][idx];
            TB.addIcon({dx: -0.4, image:"Analyzer"+val, type:Analyzer, prams:val, tooltip:"Stern-Gerlach apparatus along "+direction+" axis.\nDrag this onto the canvas."});
        });
        var i=5;
        TB.space(0.5);
        TB.addIcon({height:0.25, image:"Detector", type:Detector, label:"Detector", tooltip:"This counts atoms."});
        TB.addIcon({height:0.5, image:"JoinerIcon", type:Joiner, label: "Joiner", tooltip:"Recombines two beams from the same analyzer coherently."});
        //TB.addIcon({image:"MagnetIcon", type:Magnet});
        TB.space(2);
        new HSlider(paper, TB.x*TB.size,TB.size*0.4,
                    {from:1, to: 20, length:2*size, label:"Rate",
                     update:function(){main.dt=parseInt(this.val);if(main.running){main.StartAllGuns();}}});
        TB.space(-2);
        var bh=20; var by=0.9;
        TB.addButton({dx:-0.95, y:by, width:0.5, height:bh, text:"1",fun:function(){main.FireNShots(1);}});
        TB.addButton({dx:-0.9, y:by,width:0.5,height:bh, text:"10",fun:function(){main.FireNShots(10);}});
        TB.addButton({dx:-0.8,y:by,width:0.6,height:bh, text:"100",fun:function(){main.FireNShots(100);}});
        paper.text((TB.x-0.5)*TB.size,0.9*TB.height,"Release N photons from each oven");
        TB.addButton({dx:-0.6,y:by,width:0.7,height:bh, text:"1000",fun:function(){main.FireNShots(1000);}});
        TB.addButton({dx:0,y:by,width:0.9,height:bh, text:"10000",fun:function(){main.FireNShots(10000);}});
                TB.space(0.5);
        TB.addButton({dx:0, y:0.5, text:"  Watch", fun:function(){setWatch(1)}, text2:"✓ Watch", fun2:function(){setWatch(0)},
                      tooltip: "When checked, you can watch which channel each photon passes through."});
        main.debug=paper.text(400,10,"").attr("font-size","24");
    };
    var setWatch=function(i){
        main.watch=i;
	updateAll();
    };
    var updateAll=function(){
	console.log("update all");
        $.each(main.joins,function(idx,val){val.update();});
    }
    //========================================
    //Handles setIntervals
    var Interval=new function(){
        this.ids=[];
        this.fns=[]; 
        this.set=function(fn,delay){
            var id=(setInterval(fn,delay));
            this.ids.push(id);
            this.fns.push(fn);
            return id;
        };
        this.change=function(id,delay){
            var i=this.ids.indexOf(id);
            var fn=this.fns[i];
            this.clear(id);
            this.set(fn,delay);
        }
        this.clear=function(id){
            if(id){
                clearInterval(id);
                var i=this.ids.indexOf(id);
                this.ids.splice(i,1);
                this.fns.splice(i,1);
            } else {
                $.each(this.ids,function(x,id){
                    clearInterval(id);
                });
                this.ids=[];
                this.fns=[];
            };
        };  
    };
    main.Interval=Interval;
//================================================================================
    //GUI FUNCTIONS
//================================================================================    

    function DeleteQ(y){
        var onQ;
        if(y==undefined){onQ=0;}
        else {onQ=(y<TB.height);}
        main.toolbar.attr("fill",onQ?"red":"grey");
        return onQ;
    };

    function ColorBar(onQ){
        main.toolbar.attr("fill",["grey","red"][onQ]);
    };

//--------------------------------------------------------------------------------
    function nullfn(){;}
    function Button(x,y,width, height, text,fun,text2,fun2){
        this.toggle=-2;if(fun2!=undefined){this.toggle=0;}
        this.fun=fun; this.fun2=fun2;
        paper.setStart();
        this.rect=paper.rect(x-width/2,y-height/2,width,height,width/10).attr({fill:"white"});
        this.text=paper.text(x,y,text).attr({"font-size":14});
        this.obj=paper.setFinish();
        this.obj.attr({cursor:"pointer"});
        this.down=function(){
            this.rect.attr("fill","cyan");
            this.text.attr("fill","white");
        }
        this.up=function(){
            this.rect.attr("fill","white");
            this.text.attr("fill","black");
        }
        this.click=function(){
            this.toggle=1-this.toggle;
            if(this.toggle){
                fun();
                this.text.attr("text",text2);
            } else {
                fun2();
                this.text.attr("text",text);
            }
        }
        this.obj.mousedown(this.down,this);
        this.obj.mouseup(this.up,this);
        this.obj.click(this.click,this);
        this.obj.mouseout(this.up,this);
    }
//--------------------------------------------------------------------------------
    var HSlider=function(paper,x,y,pr){
        //x: center horizontal position, required
        //y: vertical position, required
        //width: width on the screen, default 100?
        //from, to: range of values, default 0, 100
        //step: size of step, default 1
        //label: default ""
        var pad=10;
        //default values
        this.length=100; this.from=0; this.to=100; this.step=1; this.label="";
        
        $.extend(this,pr);
        if(this.values==undefined){
            this.values=[];
            for(var i=this.from;i<=this.to+this.step/3;i+=this.step){
                this.values.push(i);
            }
        }; //xset uses values
        var xmin=x-this.length/2; var xmax=x+this.length/2;
        this.val="";
        this.thumbx=x; //current location of the thumb
        //a label on the left side of the slider
        this.label=paper.text(xmin-pad*2,y,this.label);
        this.label.attr({"font-size":18,"text-anchor":"end",
                         "title":"Changes the rate of silver atoms out of all ovens.\nLarger numbers mean faster streams."});
        //the line that the thumb moves along
        this.trough=paper.path(
            Raphael.fullfill("M{X1},{Y}L{X2},{Y}",{X1:xmin-pad,X2:xmax+pad,Y:y})
        );
        this.trough.attr({"stroke-linecap":"round","stroke-width":3,"stroke":"white"});
        //thumb is what you drag back and forth
        this.thumb=paper.rect(x-pad/4,y-pad,pad/2,pad*2).attr({fill:"black"});
        //label below the thumb
        this.thlabel=paper.text(x,y-pad*2+10,"")
            .attr({"font-size":18,"text-anchor":"start"});
        //overlays everything, so you can click on the slider easily
        this.sensor=paper.rect(xmin-pad,y-pad,this.length+2*pad,2*pad);
        this.sensor.attr({fill:"white",opacity:0,cursor:"ew-resize"});
        this.xset=function(x){
            var N=(this.values.length-1);
            var n=Math.round((x-xmin)/(xmax-xmin)*N);
            if(n>N){n=N;}if(n<0){n=0;}
            this.thumbx=n*(xmax-xmin)/N+xmin;
            this.thumb.attr({x:this.thumbx-pad/4});
            var lbl=this.values[n]+" Hz";
            this.val=lbl;
            this.thlabel.attr({x:this.thumbx-pad/4+10,text:lbl});
            if(this.update){
                this.update(lbl);
            }
        };
        this.xset(x);
        this.start=function(){
            this.ox=this.thumbx;
            this.thumb.attr("fill","red");
        };
        this.drag=function(dx,dy){
            this.xset(this.ox+dx);
        };
        this.end=function(){
            this.thumb.attr("fill","black");
        }
        this.sensor.drag(this.drag,this.start,this.end,this,this,this);
    };

//--------------------------------------------------------------------------------
    function Axes(x,y) {
        paper.setStart();
        var begin="M"+x+","+y;
        var arrow={"arrow-end":"classic","stroke-width":3};
        var text={"font-size":24,"font-family":"Times-Italic","font-style":"italic"};
        paper.path(begin+"l50,0").attr(arrow);
        paper.path(begin+"l0,-50").attr(arrow);
        paper.path(begin+"l-15,30").attr(arrow);
        paper.text(x+60,y,"y").attr(text);
        paper.text(x,y-60,"z").attr(text);
        paper.text(x-20,y+15,"x").attr(text);
        
        this.obj=paper.setFinish();
    }
//--------------------------------------------------------------------------------
    function Q(val,dft){
        if(typeof(val)==="undefined" || val==""){return dft;} else {return val;}
    };
    var TB=new function() {
        this.height=70; //to replace TBheight
        this.size=this.height-20; 
        this.x=0.5; //position for the first icon
        this.space=function(dx){this.x+=dx;}
        var textstyle={cursor:"default"};
        this.addButton=function(pr){
            //dx,y,text,fun,text2,fun2,width
            var width=this.size*Q(pr.width,1.5);
            var height= Q(pr.height,width*0.42);
            var btn=new Button(this.size*this.x, this.size*pr.y, width,height, pr.text, pr.fun, pr.text2, pr.fun2);
            btn.obj.attr("title",Q(pr.tooltip,""));
            this.x+=1.5+pr.dx;
        }
        this.addIcon=function(pr){
            
//            dx,height,image,type,label,tooltip,prams){
            //dx: offset from the default this.x, as fraction
            //height: percentage of this.size
            var dx=Q(pr.dx,0);
            var height=Q(pr.height,0.9);
            var image=pr.image;
            var type=pr.type;
            var label=Q(pr.label,"");
            var tooltip=Q(pr.tooltip,"");
            var prams=pr.prams
            var icon=new Icon(type, image,
                              this.x*this.size, this.size*(1-height)*0.5,
                              this.size, height*this.size,
                              prams);            
            icon.obj.attr("title",tooltip);
            paper.text((this.x+0.5)*this.size,0.5*(this.height+this.size),label).attr(textstyle);
            this.x+=1.5+dx;
        };
    };
    function Icon(type,image,ox,oy,w,h,pram){

//        X,height,mul,image,type,pram){
        
//        var size=mul;
//        height*=mul;
//        var ox=X*mul;
//        var oy=(size-height)*0.5;
        //        this.obj=paper.image("Images/"+image+".png",ox,oy,size,height).toFront();
        this.obj=paper.image("Images/"+image+".png",ox,oy,w,h).toFront();
        this.obj.attr("cursor","move");
        this.Dstart=function(x,y){
            this.obj.toFront();
        }
        this.Dmove=function(dx,dy){
            this.obj.attr({x:ox+dx,y:oy+dy});
            var y=oy+dy;
            if(y<TB.height){
                this.obj.transform("s1");
            } else {
                this.obj.transform("s2");
            }
        }
        this.Dend=function(dx,dy){
            var x=this.obj.attr("x");
            var y=this.obj.attr("y");
            if(y>TB.height){
                new type(this.obj.attr("x"),this.obj.attr("y"),pram);
            }
            this.obj.attr({x:ox,y:oy});
            this.obj.transform("s1");
        }
        this.obj.drag(this.Dmove,this.Dstart,this.Dend,this,this,this);
    };
    
//================================================================================
    //COMPONENTS
//================================================================================
//@Link
    function Link(x,y,offx,offy,mine) {
        this.type="Link";
        //FIRE------------------------------------------------------------
        this.Fire=function(){
            if(this.target){
                this.target.Fire();
            }
        };
        this.update=function(){if(this.target){this.target.update();}}
        //PHYSICS
        this.state=undefined; //undefined means mixed, otherwise a theta/phi object
        
        //UI 
        this.obj=paper.path("").attr({"stroke-width":"8px","stroke":"black","stroke-linecap":"round"});
        this.obj.attr("title","Drag this onto another element to connect it.\nIt will turn orange when connected.");
        this.mine=mine; //the object this link is always attached to
        this.target=undefined; //object the link is connected to
        this.offset={x:offx,y:offy};
        this.B={x:x+offx,y:y+offy}; //beginning point
        this.E={x:x+offx+50,y:y+offy}; //end point
        this.draw=function(){
            var S=Raphael.format("M{0},{1}L{2},{3}",this.B.x,this.B.y,this.E.x,this.E.y);
            this.obj.attr("path",S);
        }
        this.remove=function(){
            if(this.target){this.target.disconnect(this);}
            this.obj.remove();
            delete this;
        }
        this.setpos=function(x,y){
            this.B={x:x+this.offset.x,y:y+this.offset.y};
            if(!this.target){
                this.E={x:this.B.x+50,y:this.B.y};
            }
            this.draw();
        }
        this.setend=function(x,y){
            if(x){
                this.E={x:x,y:y};
            } else {
                this.E={x:this.B.x+50,y:this.B.y}; //50 should be a variable
            }
            this.draw();
        };
        this.disconnect=function(event){
            this.setend();
            this.obj.attr("stroke","black");
            if(this.target){this.target.update();}
            this.target=undefined;
	    updateAll();
        }

//DRAG (Yes, it's easier to do this separately I think; the variables don't match otherwise)
        this.Dstart=function(x,y){this.ox=x;this.oy=y;}//this.obj.toFront();}
        this.Dmove=function(dx,dy,x,y){
            this.setend(this.ox+dx,this.oy+dy);
            var element=paper.getElementByPoint(this.ox+dx,this.oy+dy);
            if(element && element.id in main.objects){
                this.obj.attr("stroke","orange");} else {this.obj.attr("stroke","black");}
        };
        this.Dend=function(){
            var x=this.E.x;
            var y=this.E.y;
            var element=paper.getElementByPoint(x,y);
            //if the element is connectable
            if(element && element.id in main.objects && main.objects[element.id]!=mine){
                //disconnect this link from its previous target
                if(this.target){this.target.disconnect(this);}
                //connect it to the new object
                this.target=main.objects[element.id];
                //tell the target that I'm connecting to it
                var realend=this.target.connect(this,y);
                if(realend){this.setend(realend.x,realend.y);
                            this.target.update();
                           } else {this.disconnect();}
            } else {
                if(this.target){this.target.disconnect(this);}
                this.disconnect();
            }
            this.obj.toBack();
            if(this.target){this.obj.attr("stroke","orange");}
	    updateAll();
        };
        this.obj.drag(this.Dmove,this.Dstart,this.Dend,this,this,this);
        
        return this.draw();
    };
//============================================================
//@Gun
function Gun(x,y,code) {
        this.type="Gun";
        //GUI
        var width=main.size, height=main.size;
    paper.setStart();
    this.img=paper.image("Images/GunOff.png",0,0,width,height);
    this.flash=paper.rect(0,0,0.385*width,0.64*height).attr({"stroke":"","fill":"orange",opacity:0});
    this.text=paper.text(0,0,"").attr({"font-size":0.2*main.size,"text-anchor":"center"});
    this.object=paper.setFinish();
    this.object.attr({
        title:"Click to start or stop\nthe flow of atoms\nfrom this oven.",
        cursor: "move"
    });
    
    main.guns.push(this);
    this.outlink=new Link(x,y,width/2-10,0,this);
    this.outlink.state=undefined;

        this.setpos=function(x,y){
            this.x=x; this.y=y;
            var ox=x-width/2, oy=y-height/2;
            this.img.attr({x:ox,y:oy});
            this.flash.attr({x:ox+0.09*width,y:oy+0.175*height});
            this.text.attr({x:ox+0.27*width,y:y});
            this.outlink.setpos(x,y);
            this.outlink.draw();
        };
        this.delete=function(){
            main.guns.splice(main.guns.indexOf(this),1);
            this.outlink.remove();
            $.each(this.object,function(idx,val){
                delete main.objects[val.id];
                val.remove();
            });
//            delete main.objects[this.object.id];
//            this.object.remove();
            delete this;
        }
        var drag=new Drag(this);

        //FIRE----------------------------------------
    this.Fire=function(){
        this.flash.attr("opacity",1);
           // this.object.attr("src","Images/GunOn.png");
            this.outlink.Fire();
        setTimeout($.proxy(function(){
            this.flash.attr("opacity",0)
        //    this.object.attr("src","Images/GunOff.png");
        },this),50);
        }
        this.click=function(){this.Fire();};

        //----------------------------------------
        //INIT
    //HANDLE SECRET CODE
    this.setpos(x,y);
    
    if(code=="--"){
        code=prompt("Enter your two-letter secret code","XX");
    }
    if(code && code.length==2){
        code=code.toUpperCase();
        this.text.attr("text",code);
        var A=code.charCodeAt(0)-65;
        var B=code.charCodeAt(1)-65;
        if(A>=0 && B>=0 && A<26 && B<26){
            var X=A*26+B;
            //151*26%648=38
            var Y=(38*A+151*B+107)%648;
            this.outlink.state={th:(Y%18*5/90.0), ph:Math.floor(Y/18)*5/90.0};
        }
    };
    
};
//============================================================
//@Analyzer
    function Analyzer(x,y,mode){
        this.type="Analyzer";
        main.joins.push(this);
        this.state;
        this.duh="X";
        this.P0=0.5; //probability of going out the top
        //FIRE------------------------------------------------------------
        this.Fire=function(){
            var which=1;
            if(Math.random()<this.P0){
                this.outlinks[0].Fire();
                if(main.watch){
                    this.plus.attr("fill","darkorange");
                    setTimeout($.proxy(function(){this.plus.attr("fill","black")},this),100);
                };
            } else {
                this.outlinks[1].Fire();
                if(main.watch){
                    this.minus.attr("fill","darkorange");
                    setTimeout($.proxy(function(){this.minus.attr("fill","black")},this),100);
                };

            }
        };
        //PHYSICS
        var states={Z:{th:0,ph:0},X:{th:0.5,ph:0},Y:{th:0.5,ph:0.5},θ:{th:0,ph:0}};
        
        
        //-----
        this.probability=function(){
            if(!this.inlink){this.P0=0.5; return 0.5;}
            var instate=this.inlink.state;
            this.duh=instate; //DEBUG
            var state=this.state;
            if(instate && this.inlink.state){
                var PI=Math.PI;
                this.P0=0.5*(1 + Math.cos(PI*instate.th)*Math.cos(PI*this.state.th)
                        + Math.sin(PI*instate.th) *Math.sin(PI*this.state.th)*Math.cos(PI*(instate.ph-this.state.ph)));
            } else {this.P0=0.5; }
            return this.P0;
        }
        this.update=function(){
            if(this.mode=="θ"){
                this.state={th:this.rotation+0.5,ph:0};
            } else {
                this.state=states[this.mode];
            }
            this.probability();
            this.outlinks[0].state={th:this.state.th,   ph:this.state.ph};
            this.outlinks[1].state={th:1-this.state.th, ph:1+this.state.ph};
            this.outlinks[0].update();
            this.outlinks[1].update();
        }
//-----
        //UI FUNCTIONS
        this.tooltip=function(text){
            this.object.attr({"title":text,cursor:"move"});
        }
//-----
        
        this.setrot=function(){
            var center={x:this.label.attr("x"),y:this.label.attr("y")}
            var radius=width/4;
            var x=center.x+radius*Math.cos(this.rotation*Math.PI);
            var y=center.y+radius*Math.sin(this.rotation*Math.PI);
            this.slider.attr({cx:x,cy:y});
            this.slidero.attr({cx:2*center.x-x,cy:2*center.y-y});
            if(this.mode=="θ"){
                this.label.attr({text:Math.floor((45+180+this.rotation*90)%90*2)+"°","font-size":width/5});
            }
            //update math
            this.update();
        }
//-----
        this.setpos=function(x,y){
            this.x=x; this.y=y;
            this.img.attr({x:x-width/2,y:y-height/2});
            this.label.attr({x:x-0.15*width,y:y});
            this.plus.attr({x:x+0.35*width,y:y-height*0.25});
            this.minus.attr({x:x+0.35*width,y:y+height*0.25});
            for(var link=0;link<=1;link++){
                this.outlinks[link].setpos(x,y);
                this.outlinks[link].draw();
            };
            if(this.inlink){
                this.inlink.setend(x-width/2,y);
            }
            this.setrot();
        };
        this.connect=function(source){
            //disconnect whatever link was here before
            if(this.inlink){this.inlink.disconnect();}
            this.inlink=source;
            return {x:this.x-width/2+10,y:this.y};
        };
        this.disconnect=function(){
            if(this.inlink){
                this.inlink.disconnect();
            }
            this.inlink=undefined;
        };
        this.changemode=function(mode){
            if(!mode){return;}
            this.mode=mode;
            this.label.attr({"text":mode,"font-size":width/3});
            var lbls=labels[this.mode];
            this.plus.attr({text:lbls[0]});
            this.minus.attr({text:lbls[1]});
            this.tooltip("This Stern-Gerlach analyzer\nMeasures atoms along the "+mode+" axis.");
            sliders.attr("cursor","default");
            
            if(mode=="Y"){sliders.hide();}
            else {sliders.show();}
            if(mode=="X"){this.rotation=0;}
            else if (mode=="Z") {this.rotation=-0.5;}
            else if (mode=="θ"){
                
                sliders.attr("cursor","pointer");
                this.tooltip("This Stern-Gerlach analyzer measures atoms along an arbitrary axis.\nDrag the blue dots to change the angle around the Y-axis.");
            }
            this.setrot();
            this.update();
        }
        this.click=function(){
            var keys=Keys(labels);
            var pos=keys.indexOf(this.mode);
            pos=(pos+1)%(keys.length);
            this.changemode(keys[pos]);
        }
        this.delete=function(){
            //1. Remove all links
            this.disconnect();
            $.each(this.outlinks,function(idx,link){
                link.remove();
            });
            //2. Remove all objects
            $.each(this.object,function(idx,val){
                delete main.objects[val.id];
                val.remove();
            });
            sliders.remove();
            this.object.clear();
            //3. Remove from the database
            main.joins.splice(main.joins.indexOf(this),1);
            delete this;
        }
        
        //UI VARIABLES
        this.rotation=-0.5; //0-2
        var width=main.size, height=main.size;
        var labels={"Z":["↑","↓"],"X":["⨀","⊗"],"Y":["→","←"],"θ":["•","○"]};
        
        //UI GUI
        paper.setStart();
        this.slider=paper.circle(0,0,5).attr({fill:"blue",stroke:"blue"});
        this.slidero=paper.circle(0,0,5).attr({stroke:"blue",fill:"white","stroke-width":1});
        var sliders=paper.setFinish();
        paper.setStart();
        this.img=paper.image("Images/Analyzer.png",0,0,width,height);
        this.label=paper.text(0,0,this.mode).attr({"font-size":width/3,"cursor":"default","font-family":"Times New Roman"});
        this.plus=paper.text(0,0,"↑").attr({"font-size":width/4,cursor:"default"});
        this.minus=paper.text(0,0,"↓").attr({"font-size":width/4,cursor:"default"});
        this.object=paper.setFinish();
        AddObjects(this.object,this);
        sliders.toFront();
        
        //UI DRAG
        //============================================================
        var drag=new Drag(this);
        
        this.Sstart=function(){}
        this.Smove=function(dx,dy,x,y){
            if(this.mode!="θ"){return;}
            var center={x:this.label.attr("x"),y:this.label.attr("y")}
            var angle=Math.atan2(y-center.y,x-center.x)/Math.PI;
            this.rotation=angle;
            this.setrot();
        }
        this.Send=function(){}
        sliders.drag(this.Smove,this.Sstart,this.Send,this,this,this);

        //UI RUN
        this.outlinks=[new Link(x,y,width/2,-0.25*height,this),new Link(x,y,width/2,0.25*height,this)];
        if(mode==undefined){this.changemode("Z");} else {this.changemode(mode);}
        var state=states[this.mode];
        this.setrot();
        return this.setpos(x,y);
    };
//============================================================
//@Detector
//"
function Detector(x,y){
        this.type="Detector";
        //FIRE------------------------------------------------------------
        this.update=function(){;}//maybe reset?
        this.Fire=function(){
            this.setvalue(this.value+1);
        }
        //UI
        var width=main.size, height=main.size*0.1;
        main.detectors.push(this);
//----------------------------------------
        paper.setStart();
        this.frame=paper.rect(x,y,width,height).attr({"stroke-width":5,fill:"white"});
        this.progress=paper.rect(x,y+1,0,height-2).attr("fill","orange");
        this.label=paper.text(x,y-10,"0").attr({"font-size":height,cursor:"default"});
        this.object=paper.setFinish();
        this.object.attr({title:"This counts atoms.\n You need to start an oven for it to do anything.",cursor:"move"});
        AddObjects(this.object,this);
//----------------------------------------
        this.value=0;
        
        this.connect=function(source){
            if(this.inlink){this.inlink.disconnect();}
            this.inlink=source;
            return {x:this.x,y:this.y+height*0.5};
        };
        this.disconnect=function(){
            if(this.inlink){this.inlink.disconnect();}
            this.inlink=undefined; this.setvalue(0);
        }
        this.setpos=function(x,y){
            this.x=x; this.y=y;
            this.frame.attr({x:x,y:y});
            this.label.attr({x:x,y:y+2*height});
            this.progress.attr({x:x,y:y+1});
            if(this.inlink){
                this.inlink.setend(x,y+height/2);
            }
        };
        this.setvalue=function(val){
            if(val==undefined){val=this.value;} else {this.value=val;}
            this.label.attr("text",val);
            var flag=0;
            while(val>main.maxval*0.9){
                main.maxval*=2;
                flag=1;
            }
            this.progress.attr("width",width*val/(main.maxval+0.0));
            if(flag){main.RescaleDetectors();}
        }
        this.delete=function(){
            main.detectors.splice(main.detectors.indexOf(this),1);
            this.disconnect();
            $.each(this.object,function(idx,val){
                delete main.objects[val.id];
                val.remove();
            });
            this.object.clear();
            delete this;
        };
//----------------------------------------
        var drag=new Drag(this);
        
//----------------------------------------
        return this.setpos(x,y);
    };
//============================================================
//@Joiner
    function Joiner(x,y){
        this.type="Joiner";
        
        /*
          Only allow two inlinks if they have the same "mine".
        */
        //FIRE------------------------------------------------------------
        this.update=function(){
            if(this.inlink[0] && this.inlink[1] && !main.watch){
		console.log("both");
		console.log(this.inlink[0])
		try {
                    this.outlink.state=this.inlink[0].mine.inlink.state;
		} catch {
		}
            } else if (this.inlink[0]){
		console.log("one");
                this.outlink.state=this.inlink[0].state;
            } else if (this.inlink[1]){
		console.log("one");
                this.outlink.state=this.inlink[1].state;
            } else {
                this.outlink.state=undefined;
            }
        }
        this.Fire=function(){
            this.outlink.Fire();
        };
        //UI
        var width=main.size*0.5, height=main.size*0.5;
        paper.setStart();
        this.img=paper.image("Images/Joiner.png",0,0,width,height);
        this.object=paper.setFinish();
        AddObjects(this.object,this);
        this.object.attr({"stroke-width":5,title:"Can join the two streams from a single analyzer,\ncausing interference.",cursor:"move"});
        this.outlink=new Link(x,y,width/2,0,this);
        this.inlink=[undefined,undefined]; //list of two inlinks
        this.inpoint=function(which){
            var sign=1; 
            if(which==0){sign=-1;}
            return {x:this.x-width/2+10,
                    y:this.y+sign*0.3*height};
        };
        this.setpos=function(x,y){
            this.x=x; this.y=y;
            this.img.attr({x:x-width/2,y:y-height/2});
            this.outlink.setpos(x,y);
            this.outlink.draw();
            if(this.inlink[0]){
                this.inlink[0].setend(this.inpoint(0).x,this.inpoint(0).y);
            };
            if(this.inlink[1]){
                this.inlink[1].setend(this.inpoint(1).x,this.inpoint(1).y);
            };
        };
        this.connect=function(source,y){
            if(source.mine.type=="Gun"){return undefined;}
            var which=1; if(this.y>y){which=0;}
            if(this.inlink[1-which] && this.inlink[1-which].mine!==source.mine){return undefined;}
            if(this.inlink[which]){this.inlink[which].disconnect();}
            this.inlink[which]=source;
            return this.inpoint(which);
        };
        this.disconnect=function(source){
            if(this.inlink[0]===source){
                this.inlink[0].disconnect();
                this.inlink[0]=undefined;
            } else if (this.inlink[1]===source){
                this.inlink[1].disconnect();
                this.inlink[1]=undefined;
            } else {console.log("Error");}
        }
        this.delete=function(){
            if(this.inlink[0]){this.inlink[0].disconnect();}
            if(this.inlink[1]){this.inlink[1].disconnect();}
            this.outlink.remove();
            this.object.remove();
            delete this;
        };
        
        //Drag
        var drag=new Drag(this);
       //Init
        this.setpos(x,y);
    };
//============================================================
//END COMPONENTS==============================================
    this.maxval=100;
    this.RescaleDetectors=function(){
        $.each(main.detectors,function(idx,val){val.setvalue();});
    };
    this.ClearDetectors=function(){
        $.each(main.detectors,function(idx,val){val.setvalue(0);});
        main.maxval=100;
    };
    //------------------------------------------------------------
    main.StartAllGuns=function(){
        main.Stop();
        main.running=1;
        Interval.set($.proxy(main.FireGuns,main),1000.0/main.dt);
    };
    main.FireNShots=function(n){
        while(n>0){
            main.FireGuns();
            n--;
        }
    }
    main.FireGuns=function(){
        $.each(main.guns,function(idx,val){val.Fire();});
    };
    main.Stop=function(){Interval.clear();main.running=undefined;};
//============================================================
    function AddObjects(L,thother){
        for(var obj=0;obj<L.length;obj++){
            var id=L[obj].id;
            main.objects[id]=thother;
        }
    };
    function Keys(obj){
        return $.map(obj, function(element,index) {return index});
    };
//============================================================
    function Drag(obj,start,move,end){
        //Assumes that obj contains the following definitions:
        //obj.x and obj.y are the object's current position
        //obj.setpos(x,y) moves the object to that point
        //obj.delete() deletes the object
        //obj.click() is a click event [OPTIONAL]
        var ox,oy;
        this.nx=0; this.ny=0;
        this.movedQ=0;
        this.Dstart=function(){
            ox=obj.x; oy=obj.y; this.nx=ox; this.ny=oy; this.movedQ=0;
            if(start){$.proxy(start,obj)(this);}
        };
        this.Dmove=function(dx,dy){
            if(dx*dx+dy*dy>1){this.movedQ=1;}
            this.nx=ox+dx; this.ny=oy+dy;
            this.DeleteQ(this.ny);
            if(obj.setpos){obj.setpos(this.nx,this.ny);}
            if(move){$.proxy(move,obj)(dx,dy,this);}
        };
        this.Dend=function(){
            if(this.DeleteQ(this.ny)){
                this.DeleteQ();
                obj.delete();
            } else {
                if(end){$.proxy(end,obj)(this)};
                if(!this.movedQ && obj.click){
                    obj.click();
                }
            };
        };
        this.DeleteQ=function(y){
            var onQ;
            if(y==undefined){onQ=0;} else {onQ=(y<TB.height);}
            main.toolbar.attr("fill",onQ?"red":"grey");
            return onQ;
        };
        obj.object.drag(this.Dmove,this.Dstart,this.Dend,this,this,this);
    };



};


//============================================================
$(function(){
    SPINS.init(1500,1000);
});

