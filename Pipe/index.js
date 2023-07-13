/*global $, jQuery,Raphael*/
import { Help } from "../lib/default.js";
let stream; let win; let ui;
let paper;
let dot;
//============================================================
function constrain(val,min,max){
    if(val<min){return min;}
    if(val>max){return max;}
    return val;
}
function splinify(points,curviness){
    let result=Raphael.format("M{0},{1}", points[0].x, points[0].y);
    for(let i=1;i<points.length;i++){
        let p=points[i-1], c=points[i];
        let D=(c.x-p.x)*curviness;
        result+=Raphael.format("C{0},{1},{2},{3},{4},{3}",p.x+D,p.y,c.x-D,c.y,c.x);
    }
    return result;
}
//============================================================
function Stream(points){ 
    this.points=points;
    this.x0=25; this.dx=200;
    //------------------------------------------------------------
    //LINES
    let Nlines=3; //number of lines on either side of center
    this.lines=[];
    for(let i=-Nlines;i<=Nlines;i++){
        this.lines[i]=paper.path("").attr({stroke:"blue","stroke-width":0.5});
    }
    this.lines[Nlines].attr({stroke:"black","stroke-width":1});
    this.lines[-Nlines].attr({stroke:"black","stroke-width":1});
    //------------------------------------------------------------
    //HANDLES
    this.min=5; this.max=100;
    let handlemin=this.min, handlemax=this.max;
    this.handles=[];
    for(let i=0;i<this.points.length;i++){
        const halfwidth=20;
        this.handles[i]=
            paper.image("handle.png",this.x0+i*this.dx-halfwidth,50,halfwidth*2,50);
            
        this.handles[i].n=i;
        this.handles[i].oy=0;
        this.handles[i].drag(
            function(dx,dy){
                let y=stream.points[this.n].y;
                this.attr({y:constrain(this.oy+dy,y+handlemin,y+handlemax)});
                stream.points[this.n].dy=constrain(this.ody+dy,handlemin,handlemax);
                stream.draw(1);
            },
            function(x,y){
                ui.hidehelp();
                this.ody=stream.points[this.n].dy;
                this.oy=stream.points[this.n].y+stream.points[this.n].dy;
            }, 
            undefined,this.handles[i],this.handles[i]);
    }

    //------------------------------------------------------------
    //------------------------------------------------------------
    function pt(x,y){return {x:x,y:y};}
    this.draw=function(nohandles){
        for(let L=-Nlines; L<=Nlines; L++){
            let yshift=L/(Nlines+0.0);
            let x=this.x0;
            let result=[];
            for(let i=0;i<points.length;i++,x+=this.dx){
                result.push( {x:x, y:points[i].y+points[i].dy * yshift} );
            }
            
            this.lines[L].attr("path",splinify(result,0.6));
        }
        if(!nohandles){
            for(let i=0;i<points.length;i++){
                this.handles[i].attr({y:points[i].y+points[i].dy});
            }
        }
    };
    //------------------------------------------------------------
    this.width=function(p){//p is percentage along the line
        let len=this.lines[0].getTotalLength();
        let s=this.lines[0].getPointAtLength(len*p);
        let xidx=Math.floor((s.x-this.x0)/this.dx);
        if(xidx>=points.length-1){return 0;}
        let xL=xidx*this.dx+this.x0;
        let xR=(xidx+1)*this.dx+this.x0;
        let dyL=points[xidx].dy;
        let dyR=points[xidx+1].dy;
        let P=(s.x-xL)/this.dx;
        return (1-P)*dyL+(P)*dyR;
    };
    //------------------------------------------------------------
    this.solutionwidth=function(p){//p is percentage along the line
        let len=this.lines[0].getTotalLength();
        let s=this.lines[0].getPointAtLength(len*p);
        let xidx=Math.floor((s.x-this.x0)/this.dx);
        if(xidx>=stream.solution.length-1){return 0;}
        let xL=xidx*this.dx+this.x0;
        let xR=(xidx+1)*this.dx+this.x0;
        let dyL=stream.solution[xidx];
        let dyR=stream.solution[xidx+1];
        let P=(s.x-xL)/this.dx;
        return (1-P)*dyL+(P)*dyR;
    };

    //------------------------------------------------------------
    this.Dot = function(phi){
        this.phi=phi;
        this.obj=paper.circle(0,0,4).attr({"fill":"blue","stroke":"","opacity":0.5});
        this.idx=Math.floor(Math.random()*(2*Nlines-1))-(Nlines-1);
        this.step=function(ph){
            if(ph!=undefined){this.phi=ph;}
            let s=stream.lines[this.idx].getPointAtLength(stream.lines[this.idx].getTotalLength()*this.phi);
            this.obj.attr({cx:s.x,cy:s.y});
            this.phi+=0.2/stream.width(this.phi);
            if(this.phi>1){this.obj.remove();}
        };
    };
    this.time=0;
    //------------------------------------------------------------
    this.solution=[];
    this.chooseSolution=function(){
        for(let i=25;i<=100;i+=25){
            this.solution.push(i);
        }
        this.solution.push(Math.floor(Math.random()*4+1)*25);
        for(let i=this.solution.length-1; i>0; i--){
            let j=Math.floor(Math.random()*(i+1));
            let temp=this.solution[i];
            this.solution[i]=this.solution[j];
            this.solution[j]=temp;
        }
//        for(let i=0; i<this.points.length; i++){
//            this.solution.push(Math.floor(Math.random()*4+1)*25);
//            this.solution.push(Math.floor(Math.random()*(this.max-this.min)+this.min));
//        }
    };
    this.chooseSolution();
    function Pacer(){
        this.phi=0;
        this.obj=paper.rect(0,75,10,150).attr({"fill":"red",stroke:"",opacity:0.1}).toBack();
        this.step=function(ph){
            if(ui.buttonmode){this.obj.show();} else {this.obj.hide();}
            if(ph!=undefined){this.phi=ph;}
            let s=stream.lines[0].getPointAtLength(stream.lines[0].getTotalLength()*this.phi);
            this.obj.attr({x:s.x});
            this.phi+=0.2/stream.solutionwidth(this.phi);
            if(this.phi>1){this.obj.remove();}
        };
    };
    let pacer=[new Pacer()];

    //------------------------------------------------------------
    this.step=function(){
        this.time++;
        if((this.time+1)%2==0){
            dot.unshift(new this.Dot(0));
        }
        if((this.time+1)%10==0){
            pacer.unshift(new Pacer());
        }
        for(let i=0;i<dot.length;i++){
            dot[i].step();
        }
        for(let i=0;i<pacer.length;i++){
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
    };
};
//============================================================
function WinQ(){
    if(!ui.buttonmode){return false;}
    let flag=true;
    for(let i=0;i<stream.points.length;i++){
        if(Math.abs(stream.points[i].dy-stream.solution[i])>15){flag=false;break;}
    }
    if(flag){win.show();} else {win.hide();}
    return flag;
};
//============================================================
function UI(){
    let helpobj=paper.text(stream.x0+2*stream.dx,250,"Drag a handle\nup and down\nto change the\npipe's width.").attr({"font-size":18});
    let helpQ=true;
    this.hidehelp=function(){
        if(helpQ){
            helpQ=false;
            helpobj.animate({opacity:0},1000,function(){helpobj.remove();});
        }
    };
    paper.setStart();
    let bwidth=140;
    paper.rect(stream.x0+20,260,bwidth,40).attr("cursor","pointer");
    paper.text(stream.x0+20+bwidth/2,280,"Play Game").attr({cursor:"pointer","font-size":24,"text-anchor":"middle"});
    let buttonobj=paper.setFinish();
    this.buttonmode=false;
    this.toggleButton=function(){
        ui.buttonmode=!ui.buttonmode;
        if(!ui.buttonmode){
            buttonobj[1].attr("text","Play Game");
        } else {
            buttonobj[1].attr("text","Play Around");
        }
        console.log(ui.buttonmode);
    };
    buttonobj.click(this.toggleButton);
};
//============================================================
function init(){
    paper=Raphael("canvas","100%","100%");
    paper.setViewBox(0,0,850,300);
    let x;
    stream=new Stream([{y:150,dy:10},{y:150,dy:10},{y:150,dy:20},{y:150,dy:10},{y:150,dy:10}]);
    dot=[new stream.Dot(0)];
    stream.draw();
    setInterval($.proxy(stream.step,stream),100);
    win=paper.text(0,30,"Correct!").attr({"text-anchor":"start","font-size":48,fill:"purple",stroke:"pink"}).hide();
    ui=new UI();
    new Help($("#help"),"toggle");
}
$(init);


//IDEA: Have a graph of the goal velocity underneath. They have to adjust the pipe diameters to match that velocity.  The graphs could be qualitative?
//IDEA: Identify the regions of higher pressure.  (Or have a graph of pressure instead?)  


//FIX: Minimum and maximum expansion of handles

