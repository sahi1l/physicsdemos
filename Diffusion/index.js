//Make a time graph of particles in each bin versus time
//When reset, move the graph over to the right
//What is changeable? height, number of particles
//Add additional particles that take two steps every time: color red, start on opposite side
let name,W,H;
let paper;
let Nx=10; let Ny=10;
let d=5;
let N=100;
let twoQ=0;
let graphQ=1;
let intervalHandle;
let bin=Nx/2;
let wwindow={
    h:100, //height of window
    w:100, //width of window
    padx:5,
    pady:5,
    border:{},
    bars:[],
    walker:[], //list of walkers
    walker2:[] //list of red walkers that move twice
};
class Graph {
    constructor() {
        this.x0=200;
        this.y0=100;
        this.dx=100;
        this.dy=100;
        this.axis=[];
        this.left=[];
        this.right=[];
        this.data=[];
        this.first=1;
        this.Tmax=100.0; //time on the right side, grows over time
        this.axis=paper.path(`M${this.x0},${this.y0+this.dy}l0,${-this.dy}l${this.dx},0`)
            .attr({"stroke-width":4,
                   "arrow-start":"classic",
                   "arrow-end":"classic"});
        
    reset() {
        this.left=paper.path("").attr({stroke:"red","stroke-width":2});
        this.right=paper.path("").attr({stroke:"blue","stroke-width":2});
    }
    xlabels(){
	for(let i=1;i<=10;i++){
	    let lbl=this.Tmax*i/10;
	    if(lbl>1e6) {lbl=(lbl/1e6)+"M";}
	    else if (lbl>1e3) {lbl=(lbl/1e3)+"k";}
	    Graph.lblx[i-1].attr({"text":lbl});
	}
    }
    ylabels(){
	for(let i=1;i<=10;i++){
	    Graph.lbly[i-1].attr("text",i*N/10);
	}
    };
    draw(n){
        if(n!=undefined){this.data.push(n);}
        if(this.data.length%(this.Tmax/10)){return;}
        if(this.data.length>this.Tmax){
	    this.Tmax*=2;
	    this.xlabels();
	}
        let p=this.data[0]/((1.0+2*twoQ)*N);
        let Lpath="M"+this.x0+","+(this.y0+this.dy*p);
        let Rpath="M"+this.x0+","+(this.y0+this.dy*(1-p));
        for(let i=1;i<this.data.length;i++){
            let p=this.data[i]/((1.0+2*twoQ)*N);
            Lpath+="L"+(this.x0+this.dx*i/this.Tmax)+","
                +(this.y0+this.dy*p);
            Rpath+="L"+(this.x0+this.dx*i/this.Tmax)+","
                +(this.y0+this.dy*(1-p));
        }
        this.left.attr({path:Lpath});
        this.right.attr({path:Rpath});
    };
    hide(){
        if(this.left.attr==undefined){return;}
        this.data=[];
        this.Tmax=100;
        this.left.attr({path:""});
        this.right.attr({path:""});
        this.axis.attr({path:""});
    };
};
let graph = new Graph();
var ctrl={
    y:100,
    dy:100,
    obj:{}
}; //control
var startButton;
var Button=function(label,x,y,fn){
    var fnt=W/50;
    var wd=fnt*6; var ht=fnt*2;
        paper.setStart();
        paper.rect(x-wd/2,y-ht/2,wd,ht).attr({fill:"#ccc"});
        paper.text(x,y,label).attr({"font-size":fnt,"text-anchor":"middle"});
        this.all=paper.setFinish();
        this.all.click(fn);
};
var pt=function(x,y,color){
    if(color==undefined){color="blue";}
    this.x=x;
    this.y=y;
    this.obj=paper.circle(0,0,0).attr({fill:color,stroke:""});
    this.place=function(_x,_y,rQ){
        this.x=_x; this.y=_y;
        var X=(0.5+this.x)*d+wwindow.padx;
        var Y=(0.5+this.y)*d+wwindow.pady;
        if(rQ){this.obj.attr({r:Math.ceil((d-1)/2)});}
        this.obj.attr({cx:X,cy:Y});
    };
    this.remove=function(){
        this.obj.remove();
    };
    this.move=function(dir){
            var dx=[1,0,-1,0][dir];
            var dy=[0,1,0,-1][dir];
            var nx=this.x+dx;
            var ny=this.y+dy;
            if(nx<0 || nx>=Nx || ny<0 || ny>=Ny){return 1;}
            //add to bin
            this.place(nx,ny);
    };
};
this.start=function(){
    if(intervalHandle==undefined){
	Graph.xlabels();
	Graph.ylabels();
        
        console.log("start");
        intervalHandle=window.setInterval(Diffusion.step,100);
    }
    
};
this.stop=function(){
    if(intervalHandle!=undefined){
        window.clearInterval(intervalHandle);
        intervalHandle=undefined;
    }
};
this.step=function(){
    var left=0;
    var iterations=Math.ceil(N/20),i;
    for (let w in wwindow.walker) {
        for(i=0;i<iterations;i++){
            wwindow.walker[w].move(Math.floor(Math.random()*4));
        }
        if(graphQ){
            left+=(wwindow.walker[w].x<Nx/2);}
        if(twoQ){
            for(i=0;i<2*iterations;i++){
                wwindow.walker2[w].move(Math.floor(Math.random()*4));
            }
            if(graphQ){left+=2*(wwindow.walker2[w].x<Nx/2);}
            
        }
    }
    if(graphQ){Graph.draw(left);}
        //Draw Bars
};
    this.reset=function(){
        var i,x;
        console.log("reset");
        this.stop();
        this.getprams();
        bin=Nx/2;
        d=(Math.min(wwindow.h/Ny,wwindow.w/Nx))-0.5;
        wwindow.pady=wwindow.h-Ny*d;
        wwindow.borderL.attr({x:wwindow.padx,y:wwindow.pady,
                             width:Nx*d/2,height:Ny*d});
        wwindow.borderR.attr({x:wwindow.padx+Nx*d/2,y:wwindow.pady,
                             width:Nx*d/2,height:Ny*d});
        Graph.hide();
        if(graphQ){
            Graph.x0=100;
            Graph.dy=-200;
            Graph.y0=ctrl.y+ctrl.dy-Graph.dy+10;
            Graph.dx=W-120;
            Graph.init();
        }
        for (let w in wwindow.walker){wwindow.walker[w].remove();}
        for (let w in wwindow.walker2){wwindow.walker2[w].remove();}
        wwindow.walker=[];
        wwindow.walker2=[];
        for(i=0;i<N;i++){
            wwindow.walker.push(new pt(0,0));
            var x=Math.floor(Math.random()*Nx/2);
            var y=Math.floor(Math.random()*Ny);
            wwindow.walker[i].place(x,y,1);
            if(twoQ){
                wwindow.walker2.push(new pt(0,0,"red"));
                var x=Math.floor((Math.random()+1)*Nx/2);
                var y=Math.floor(Math.random()*Ny);
                wwindow.walker2[i].place(x,y,1);
            }
        }
        //bars
        if(wwindow.bars.length){
            wwindow.bars.remove();
        }
        paper.setStart();
        paper.path("M"+((0.5+Nx/2)*d+wwindow.padx-d/2)+","+wwindow.pady+"l0,"+(H/2-wwindow.pady))
                .attr({stroke:"red"});
        wwindow.bars=paper.setFinish();
        wwindow.bars.toBack();
	Graph.xlabels()
	Graph.ylabels()

    };
    this.init=function(_name,_W,_H){
        name=_name;W=_W;H=_H;
        paper=Raphael(name,W,H);
        wwindow.w=W;
        wwindow.h=H/2;
        //Control Bar with buttons
        ctrl.y=wwindow.h; ctrl.dy=W/50*3; //position of blue control bar
        ctrl.obj=paper.rect(0,ctrl.y,W,ctrl.dy).attr({fill:"blue",stroke:""});
        startButton=new Button("Start",50,ctrl.y+ctrl.dy/2,this.start);
        let stopButton=new Button("Stop",150,ctrl.y+ctrl.dy/2,this.stop);
        let resetButton=new Button("Reset",250,ctrl.y+ctrl.dy/2,
                               $.proxy(this.reset,this));
        wwindow.padx=5;
        wwindow.borderL=paper.rect(0,0,0,0).attr({fill:"#f88"});
        wwindow.borderR=paper.rect(0,0,0,0).attr({fill:"#88f"});
        
        this.setprams();
        this.reset();
    }
    this.setprams=function(){
        $("#N").val(N);
        $("#X").val(Nx);
        $("#Y").val(Ny);
        $("#two").prop("checked",twoQ);
        $("#graph").prop("checked",graphQ);
    }
    let range=function(val,min,max){
        if(val<min){return min;}
        if(val>max){return max;}
        return val;
    }
    this.getprams=function(){
        N =range($("#N").val(),1,5000);
        Nx=range($("#X").val(),2,100);
        Ny=range($("#Y").val(),1,100);
        twoQ=$("#two").prop("checked");
        graphQ=$("#graph").prop("checked");
        this.setprams();
    }
}
function getLabel(wid){
    return wid.parent().children("span");
}
function setLabel(wid){
    getLabel(wid).text($(wid).val());
}
function SetUpSliders(){
    console.log(getLabel($("#N")));
    $("#N").slider({
	max:1000,
	min:10,
	step:10,
	value:100});
    $("#X").slider({max:100,min:2,value:5});
    $("#Y").slider({max:100,min:1,value:10});
    setLabel($("#N"));
    setLabel($("#X"));
    setLabel($("#Y"));
    $(".slider").slider({
	create:function(){getLabel($(this)).text($(this).slider("value"));},
	slide:function(event,ui){getLabel($(this)).text(ui.value);
				 $(this).val(ui.value);
				}
    });
	
}
$(function(){
    init("diffusion",600,600);
    SetUpSliders();
});

//A LOT MORE FIXING TO DO
