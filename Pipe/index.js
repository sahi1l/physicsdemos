var paper;
//============================================================
function constrain(val,min,max){
    if(val<min){return min;}
    if(val>max){return max;}
    return val;
}
function splinify(points,curviness){
    var result=Raphael.format("M{0},{1}", points[0].x, points[0].y);
    for(i=1;i<points.length;i++){
        var p=points[i-1], c=points[i];
        var D=(c.x-p.x)*curviness;
        result+=Raphael.format("C{0},{1},{2},{3},{4},{3}",p.x+D,p.y,c.x-D,c.y,c.x);
    }
    return result;
}
//============================================================
Stream=function(points){
    this.points=points;
    this.x0=25; this.dx=200;

    //------------------------------------------------------------
    //LINES
    var Nlines=3; //number of lines on either side of center
    this.lines=[];
    for(var i=-Nlines;i<=Nlines;i++){
        this.lines[i]=paper.path("").attr({stroke:"blue","stroke-width":0.5});
    }
    this.lines[Nlines].attr({stroke:"black","stroke-width":1});
    this.lines[-Nlines].attr({stroke:"black","stroke-width":1});
    //------------------------------------------------------------
    //HANDLES
    this.min=5; this.max=100;
    var handlemin=this.min, handlemax=this.max;
    this.handles=[];
    for(var i=0;i<this.points.length;i++){
        var halfwidth=20;
        this.handles[i]=
            paper.image("handle.png",this.x0+i*this.dx-halfwidth,50,halfwidth*2,50);
            
        this.handles[i].n=i;
        this.handles[i].oy=0;
        this.handles[i].drag(
            function(dx,dy){
                var y=S.points[this.n].y;
                this.attr({y:constrain(this.oy+dy,y+handlemin,y+handlemax)});
                S.points[this.n].dy=constrain(this.ody+dy,handlemin,handlemax);
                S.draw(1);
            },
            function(x,y){
                ui.hidehelp();
                this.ody=S.points[this.n].dy;
                this.oy=S.points[this.n].y+S.points[this.n].dy;
            }, 
            undefined,this.handles[i],this.handles[i]);
    }

    //------------------------------------------------------------
    //------------------------------------------------------------
    pt=function(x,y){return {x:x,y:y};}
    this.draw=function(nohandles){
        for(var L=-Nlines; L<=Nlines; L++){
            var yshift=L/(Nlines+0.0);
            var x=this.x0;
            var result=[];
            for(i=0;i<points.length;i++,x+=this.dx){
                result.push( {x:x, y:points[i].y+points[i].dy * yshift} );
            }
            
            this.lines[L].attr("path",splinify(result,0.6));
        }
        if(!nohandles){
            for(var i=0;i<points.length;i++){
                this.handles[i].attr({y:points[i].y+points[i].dy});
            }
        }
    }
    //------------------------------------------------------------
    this.width=function(p){//p is percentage along the line
        var len=this.lines[0].getTotalLength();
        var s=this.lines[0].getPointAtLength(len*p);
        var xidx=Math.floor((s.x-this.x0)/this.dx);
        if(xidx>=points.length-1){return 0;}
        var xL=xidx*this.dx+this.x0;
        var xR=(xidx+1)*this.dx+this.x0;
        var dyL=points[xidx].dy;
        var dyR=points[xidx+1].dy;
        var P=(s.x-xL)/this.dx;
        return (1-P)*dyL+(P)*dyR;
    }
    //------------------------------------------------------------
    this.solutionwidth=function(p){//p is percentage along the line
        var len=this.lines[0].getTotalLength();
        var s=this.lines[0].getPointAtLength(len*p);
        var xidx=Math.floor((s.x-this.x0)/this.dx);
        if(xidx>=S.solution.length-1){return 0;}
        var xL=xidx*this.dx+this.x0;
        var xR=(xidx+1)*this.dx+this.x0;
        var dyL=S.solution[xidx];
        var dyR=S.solution[xidx+1];
        var P=(s.x-xL)/this.dx;
        return (1-P)*dyL+(P)*dyR;
    }

    //------------------------------------------------------------
    var Dot=function(phi){
        this.phi=phi;
        this.obj=paper.circle(0,0,4).attr({"fill":"blue","stroke":"","opacity":0.5});
        this.idx=Math.floor(Math.random()*(2*Nlines-1))-(Nlines-1);
        this.step=function(ph){
            if(ph!=undefined){this.phi=ph;}
            var s=S.lines[this.idx].getPointAtLength(S.lines[this.idx].getTotalLength()*this.phi);
            this.obj.attr({cx:s.x,cy:s.y});
            this.phi+=0.2/S.width(this.phi);
            if(this.phi>1){this.obj.remove();}
        }
    }
    dot=[new Dot(0)];
    this.time=0;
    //------------------------------------------------------------
    this.solution=[];
    this.chooseSolution=function(){
        for(var i=25;i<=100;i+=25){
            this.solution.push(i);
        }
        this.solution.push(Math.floor(Math.random()*4+1)*25);
        for(var i=this.solution.length-1; i>0; i--){
            var j=Math.floor(Math.random()*(i+1));
            var temp=this.solution[i];
            this.solution[i]=this.solution[j];
            this.solution[j]=temp;
        }
//        for(var i=0; i<this.points.length; i++){
//            this.solution.push(Math.floor(Math.random()*4+1)*25);
//            this.solution.push(Math.floor(Math.random()*(this.max-this.min)+this.min));
//        }
    };
    this.chooseSolution();
    var Pacer=function(){
        this.phi=0;
        this.obj=paper.rect(0,75,10,150).attr({"fill":"red",stroke:"",opacity:0.1}).toBack();
        this.step=function(ph){
            if(ui.buttonmode){this.obj.show();} else {this.obj.hide();}
            if(ph!=undefined){this.phi=ph;}
            var s=S.lines[0].getPointAtLength(S.lines[0].getTotalLength()*this.phi);
            this.obj.attr({x:s.x});
            this.phi+=0.2/S.solutionwidth(this.phi);
            if(this.phi>1){this.obj.remove();}
        }
    };
    pacer=[new Pacer()];

    //------------------------------------------------------------
    this.step=function(){
        this.time++;
        if((this.time+1)%2==0){
            dot.unshift(new Dot(0));
        }
        if((this.time+1)%10==0){
            pacer.unshift(new Pacer());
        }
        for(var i=0;i<dot.length;i++){
            dot[i].step();
        }
        for(var i=0;i<pacer.length;i++){
            pacer[i].step();
        }
        if(dot[dot.length-1].phi>1){
            dot[dot.length-1].obj.remove();
            dot.pop();
        }
        if(pacer[pacer.length-1].phi>1){
            pacer[pacer.length-1].obj.remove();
            pacer.pop();
        }
        WinQ();
    }
};
//============================================================
WinQ=function(){
    if(!ui.buttonmode){return false;}
    var flag=true;
    for(var i=0;i<S.points.length;i++){
        if(Math.abs(S.points[i].dy-S.solution[i])>15){flag=false;break;}
    }
    if(flag){win.show();} else {win.hide();}
    return flag;
};
//============================================================
var UI=function(){
    var helpobj=paper.text(S.x0+2*S.dx,250,"Drag a handle\nup and down\nto change the\npipe's width.").attr({"font-size":18});
    var helpQ=true;
    this.hidehelp=function(){
        if(helpQ){
            helpQ=false;
            helpobj.animate({opacity:0},1000,function(){helpobj.remove();});
        }
    }
    paper.setStart();
    var bwidth=140;
    paper.rect(S.x0+20,260,bwidth,40).attr("cursor","pointer");
    paper.text(S.x0+20+bwidth/2,280,"Go for it!").attr({cursor:"pointer","font-size":24,"text-anchor":"middle"});
    var buttonobj=paper.setFinish();
    this.buttonmode=false;
    this.toggleButton=function(){
        ui.buttonmode=!ui.buttonmode;
        if(!ui.buttonmode){
            buttonobj[1].attr("text","Go for it!");
        } else {
            buttonobj[1].attr("text","Play around");
        }
        console.log(ui.buttonmode);
    }
    buttonobj.click(this.toggleButton);
}
//============================================================
    var S; var win; var ui;
init=function(){
    paper=Raphael("canvas",850,300);
    var x;
    S=new Stream([{y:150,dy:10},{y:150,dy:10},{y:150,dy:20},{y:150,dy:10},{y:150,dy:10}]);
    S.draw();
    setInterval($.proxy(S.step,S),100);
    win=paper.text(0,30,"Correct!").attr({"text-anchor":"start","font-size":48,fill:"purple",stroke:"pink"}).hide();
    ui=new UI();
}
$(init);


//IDEA: Have a graph of the goal velocity underneath. They have to adjust the pipe diameters to match that velocity.  The graphs could be qualitative?
//IDEA: Identify the regions of higher pressure.  (Or have a graph of pressure instead?)  


//FIX: Minimum and maximum expansion of handles

