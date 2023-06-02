var sh=-8; //shift required for mouse
function TimeLine(x,t){
    this.obj=paper.path("").attr({"stroke-width":2,"stroke-dasharray":".","stroke":overlay.color});
    console.log("TL")
    this.draw=function(){
        var v=alice.v;
        var gamma=1/Math.sqrt(1-v**2);
        console.log(v);
        //draw line with slope v through point x,t
        var path=Raphael.format("M{0},{1}L{2},{3}",0,t+v*(x-0),W,t+v*(x-W));
        this.obj.attr("path",path);
    }
    this.remove=function(){
        this.obj.remove();
    }
    this.obj.click(function(){
        that.obj.remove();
    });

    this.draw();
}
function WorldLine(x,t,v){
    this.x=x; this.t=t; this.v=v;
    this.obj=paper.path("").attr({"stroke-width":4,"stroke":overlay.color});
    if(Math.abs(v)==1){this.obj.attr("stroke-dasharray","-")}
    this.draw=function(){
        var code="";
        var x1,x2,y1,y2;
        var x0=this.x; var y0=this.t; var v=-this.v;
        var xmin=0; var ymin=0; var xmax=W; var ymax=H;
        if(this.v==0){
            code="0";
            y1=ymin; y2=ymax; x1=this.x; x2=this.x;
        } else {
            if(xmin-x0<=v*(ymax-y0) && v*(ymax-y0)<=xmax-x0){
                x1=x0+v*(ymax-y0);y1=ymax;
                code="a";
            } else if (v>0) {
                x1=xmax; y1=y0+(xmax-x0)/v;
                code="b";
            } else {
                x1=xmin; y1=y0+(xmin-x0)/v;
                code="c";
            };
            if(x0-xmin > v*(y0-ymin) && x0-xmax < v*(y0-ymin)){
                x2=x0+v*(ymin-y0); y2=ymin;
                code+="a";
            } else if (v>0){
                x2=xmin; y2=y0+(xmin-x0)/v;
                code+="b";
            } else {
                x2=xmax; y2=y0+(xmax-x0)/v;
                code+="c";
            };
        }
        this.obj.attr("path","M"+x1+","+y1+"L"+x2+","+y2);
    }
        var that=this;
        this.obj.click(function(){
            that.obj.remove();
        });

    this.remove=function(){this.obj.remove();}
    this.draw();
}
function Event(x,t,color){
    this.x=x;this.t=t;
    var radius=5;
    this.obj=paper.circle(0,0,radius).attr({fill:color,stroke:""});
    this.draw=function(){
        this.obj.attr({cx:this.x,cy:this.t});
    }
    var that=this;
    this.obj.click(function(){
        that.obj.remove();
    });
    this.remove=function(){this.obj.remove();}
    this.draw();

}
function Overlay(){
    var Dx,Dy,X0,Y0,tmpPath;
    this.color="black";
    this.obj=paper.rect(0,0,W,H).attr({"fill":"white","opacity":0.1});
//    this.obj=paper.rect(x0+dx*xmin,y0+dy*ymin,dx*(xmax-xmin),dy*(ymax-ymin))
    var obj=this.obj;
    obj.node.id="overlay";
    this.dragStart=function(x,y){
        X0=x+sh; Y0=y+sh;
        Dx=0; Dy=0;
        var tmp=alice.gridpoint(X0,Y0);
        X0=tmp.x; Y0=tmp.t;
        tmpPath=paper.path("");
    }
    this.dragMove=function(dx,dy,x,y){
        var tmp=alice.gridpoint(x+sh,y+sh);
        x=tmp.x; y=tmp.t;
        Dx=x-X0; Dy=y-Y0;
        if(Math.abs(Dx)<=Math.abs(Dy)){
            tmpPath.attr({"stroke-dasharray":"",stroke:overlay.color});
            tmpPath.attr("path",Raphael.format("M{0},{1}L{2},{3}",X0,Y0,x,y));
        } else if(Math.abs(Dy)<=alice.v*Math.abs(Dx)){
            var dx=Dx;
            var dy=-alice.v*Dx;
            tmpPath.attr({"stroke-dasharray":"-",stroke:overlay.color,
                path:Raphael.format("M{0},{1}L{2},{3}",X0,Y0,X0+dx,Y0+dy)});

        } else {//lightlike
            var dx=Math.sign(Dx)*Math.max(Math.abs(Dx),Math.abs(Dy));
            var dy=Math.sign(Dy)*Math.max(Math.abs(Dx),Math.abs(Dy));
            tmpPath.attr({"stroke-dasharray":"-",stroke:overlay.color,
                        path:Raphael.format("M{0},{1}L{2},{3}",X0,Y0,X0+dx,Y0+dy)});
        }
    }
    this.dragEnd=function(){
        if(Math.hypot(Dx,Dy)<10){this.clix();}
        else if(Math.abs(Dx)<=Math.abs(Dy)){
            worldlines.push(new WorldLine(X0,Y0,-Dx/Dy));
        } else if(Math.abs(Dy)<=Math.abs(alice.v+0.01)*Math.abs(Dx)){
            timelines.push(new TimeLine(X0,Y0));
        } else {
            var dx=Math.sign(Dx)*Math.max(Math.abs(Dx),Math.abs(Dy));
            var dy=Math.sign(Dy)*Math.max(Math.abs(Dx),Math.abs(Dy));
            worldlines.push(new WorldLine(X0,Y0,-dx/dy));

        }
        tmpPath.remove();
    }
    this.obj.drag(this.dragMove,this.dragStart,this.dragEnd,this,this,this);
    this.clix=function(evt){ //add point
        var x,t;
        if(evt){
        x=evt.x+sh; t=evt.t+sh;
        } else {x=X0; t=Y0;}
        var tmp=alice.gridpoint(x,t);
        x=tmp.x; t=tmp.t;
        events.push(new Event(x,t,this.color)); //8 is the shift due to the arrow
}
}
var Grid=function(color){
    this.v=0; //velocity relative to "rest" frame
    var N=16; //number of divisions
    this.equitemps=undefined; this.equilocs=undefined;
    this.draw=function(v){
        if(v!=undefined){this.v=v;}
        var gamma=1/Math.sqrt(1-this.v*this.v);
        if(this.equilocs){this.equilocs.remove();this.equitemps.remove();this.equilocs=[];this.equitemps=[];}  //FIX?
        paper.setStart();
        for(t=-2*N;t<2*N;t++){ //draw equitemps
            var wid=(t%2==0)+(t%4==0)+(t%8==0)+(t%16==0)+(t%32==0);
            var x0=-W; var t0=t*H/N/gamma;
            var x1=W; var t1=t0+(x1-x0)*this.v;
            var bbox={x:x0,y:t0,x2:x1,y2:t1,width:x1-x0,height:t1-t0};
            if(Raphael.isBBoxIntersect(overlay.obj.getBBox(),bbox)){
                paper.path(Raphael.format("M{0},{1}L{2},{3}",x0+W/2,H-t0,x1+W/2,H-t1))
                .attr("stroke-width",1+0.25*wid);
            }
        }
        this.equitemps=paper.setFinish();
        paper.setStart();
        for(x=-2*N;x<2*N;x++){//draw equilocs
            var wid=(x%2==0)+(x%4==0)+(x%8==0)+(x%16==0)+(x%32==0);

            var t0=0; var x0=x*W/N/gamma;
            var t1=H; var x1=x0+(t1-t0)*this.v;
            paper.path(Raphael.format("M{0},{1}L{2},{3}",x0+W/2,H-t0,x1+W/2,H-t1))
            .attr("stroke-width",1+0.25*wid);
        }
        this.equilocs=paper.setFinish();
        this.equilocs.attr({"stroke-dasharray":". ",stroke:color})
        this.equitemps.attr({"stroke-dasharray":". ",stroke:color})
        this.equilocs.toBack();
        this.equitemps.toBack();

    }
    this.gridpoint=function(X,t){//find grid point close to X,T if any
        var gamma=1/Math.sqrt(1-this.v*this.v);
        var v=this.v;
        var T=H-t;
        nt=N/(H/gamma)*(T-v*(X-W/2));
        nx=N/(W/gamma)*((X-W/2)-v*T);
        var threshold=0.3;
        if(!$("#snap").is(":checked")){threshold=0;}
        if(Math.abs(nt-Math.round(nt))<threshold && Math.abs(nx-Math.round(nx))<threshold){
            return {x:W/2+gamma/(N+0.0)*(Math.round(nx)*W+v*Math.round(nt)*H),
                    t:H-(gamma/(N+0.0)*(Math.round(nt)*H+v*Math.round(nx)*W))};
        } else {
            return {x:X,t:H-T};
        }
    }
    /*
    this.equiloc=function(X,T){//distance from nearest equiloc
        var distance=10000;
        for(x=-2*N;x<2*N;x++){
            var t0=0; var x0=x*W/N*gamma;
            var t1=H; var x1=x0+(t1-t0)*this.v;
            var dist=Math.abs((T-t1)*x0-(X-x1)*t0+X*t1-T*x1)/Math.hypot(T-t1,X-x1)
        }
    }
    */
    this.draw();
}


function clear(){
    for (let o of worldlines){o.remove();}
    for (let o of events){o.remove();}
    for (let o of timelines){o.remove();}
    worldlines=[];
    events=[];
    timelines=[];
}


var paper,W=500,H=500;
var worldlines=[]; var events=[]; var timelines=[];
var alice,bob;
function init(){
    paper=Raphael("canvas",W,H);
    $("#canvas").height(H);
    $("#canvas").width(W);
    overlay=new Overlay();
    alice=new Grid("grey");
//    bob=new Grid("blue");
    overlay.obj.toFront();


    $( "#alice" ).slider({animate: "fast",min:-0.5,max:0.5,step:0.01, orientation:"horizontal",
    create:function() {
        $("#aliceval").text(0)},
       slide:function(event,ui){
        alice.draw(ui.value);
        $("#aliceval").text(ui.value)
    }});

/*    $( "#bob" ).slider({animate: "fast",min:-0.5,max:0.5,step:0.01,orientation:"horizontal",
    create:function() {
        $("#bobval").html( "0<i>c</i>")},
       slide:function(event,ui){
        bob.draw(ui.value);
        $("#bobval").html(ui.value+"<i>c</i>")
    }});
*/
    $(".swatch>div").click(function(w){
        $(".swatch>div").removeClass("selected");
        $(w.target).addClass("selected");
        overlay.color=$(w.target).attr("id");
        console.log(overlay.color);
    });
    $("#black").addClass("selected");
    $("#clear").click(clear);
}

$(init);
