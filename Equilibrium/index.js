import {Help} from "../lib/default.js";
let score={correct:0, total:0, count:0, error:0, max:5};
let showinstructions=true;
let paper;
let position;
let rwidth=6;
let hzpad=10;
let Ntics=50;
let hscale=2;
let major=5;
let a1,a2;
let a0;
let solution;
function arrowS(x0,L){
    if(L>0){
        return Raphael.fullfill("M{x0},{y0} l{aw},{ah} l-{aw},0 l-{aw},0 l{aw},-{ah} l0,{L}",{x0:2*x0,y0:rwidth,L:L,aw:2,ah:4});
    } else {
        return Raphael.fullfill("M{x0},{y0} l{aw},-{ah} l-{aw},0 l-{aw},0 l{aw},{ah} l0,{L}",{x0:2*x0,y0:-rwidth,L:L,aw:2,ah:4});
    }
}
function lbladjust(lbl,x0,L){
    lbl.attr({x:2*x0,y:L>0?L+10:L-10});
    lbl.attr("text",parseInt(Math.abs(L))+"N");
}
function arrow(x0,L){
//if L>0, pointing up; if L<0, pointing down
    paper.setStart();
    paper.path(arrowS(x0,L)).attr({opacity:0.5,"fill":"black","stroke-linejoin":"round","stroke-width":"2px"});
    let lbl=paper.text(x0,L>0?L+10:L-10,"").attr("stroke-width",0);
    lbladjust(lbl,x0,L);
    let obj=paper.setFinish();
    obj.data({label:lbl, x0:x0, L:L});
    return obj;
}
let hitic;
let ruler;
let tooltip;
function init(){
    paper=Raphael("canvas",$("#canvas").width(),$("#canvas").height());
    paper.setViewBox(-hzpad,-50,Ntics*2+2*hzpad,100);
    ruler=paper.rect(0,-rwidth/2,Ntics*2,rwidth);
    paper.setStart();
    let toolsize=4;
    paper.rect(-toolsize,-toolsize,toolsize*2,toolsize*2).attr({"fill":"yellow","stroke-width":"0.5"});
    position=paper.text(0,0,"5").attr({"font-size":toolsize,"text-anchor":"middle"});
    tooltip=paper.setFinish();
    tooltip.hide()
    hitic=paper.path("").attr({"stroke":"red"});
    for(let i=0; i<Ntics; i++) {
	paper.setStart();
        let tic=paper.path(Raphael.format("M{0},{1}l0,{2}",i*hscale,-rwidth/2+1,rwidth-2));
	let Tic=paper.setFinish();
        if(i%major){tic.attr("stroke-width",0.3);}
	Tic.data("val",i);
	Tic.mouseover(function(){
            this.attr({stroke:"goldenrod"});
            i=this.data().val;tooltip.transform("t"+(i*hscale)+",-5");
	    position.attr({"text":i});
	    tooltip.show();});
	Tic.mouseout(function(){
            this.attr({stroke:"black"});
            tooltip.hide();});
    }
    a0={x:25,y:10};
    a0.obj=arrow(a0.x,a0.y);
    a0.obj.drag(dragmove,dragstart,dragend,a0.obj,a0.obj,a0.obj);
    a0.obj.attr({"fill":"red","stroke":"red"});
    paper.setStart();
    paper.rect(Ntics-35,43,70,14,5).attr("fill","#ddd");
    paper.text(Ntics,50,"Check answer");
    let button=paper.setFinish();
    button.translate(0,5);
    button.click(correctQ);
    score={correct:0, total:0, count:0, error:0, max:5};
    nextQuestion();
    correctMessage("");
    new Help($("#help"),"toggle");
}
function irand(b,e){
    return Math.floor((e-b)*Math.random()+b);
}
function rand(b,e){
    return (e-b)*Math.random()+b;
}
function chooseQuestion(){
    //choose Fa, Fb, and xc
    //let xb=xc-Fa
    //let xa=Fb+xc
    //then Fc=-Fa-Fb
    //keep trying until xa, xb, and Fc are in range
    let Fmax=30; let Fmin=5;
    let xa,xb,xc,Fa,Fb,Fc;
    if(typeof(a1)=="object"){
        a1.obj.remove();
        a2.obj.remove();
    }
    do {
        xc=irand(0,Ntics+1);
        Fa=irand(Fmin,Math.min(Fmax,xc));
        Fb=-irand(Fmin,Math.min(Fmax,xc)+1);
        xb=xc-Fa;
        xa=Fb+xc;
        Fc=-Fa-Fb;
    } while (!(Fa!=-Fb && xa>=0 && xa<=Ntics && xb>=0 && xb<=Ntics));
    a1={x:xa, y:Fa, obj: arrow(xa,Fa)};
    a2={x:xb, y:Fb, obj: arrow(xb,Fb)};
    solution={x:xc,y:Fc};
}

let drag={};
function dragstart(x,y){
    drag=$(this);
    drag=$(this)[0];
    tooltip.show();
    //FIX: change value
}
function correctMessage(txt){
    if(txt==""){
	$("#correct").hide();
    } else {
	$("#correct").show();
	$("#correct").html(txt);
    }
}
function correctQ(){
    if(a0.x==solution.x && a0.y==solution.y){
        console.log("Correct!");
        score.correct++; score.total++;
        updateScore();
        setTimeout(nextQuestion,3000);
	correctMessage("Correct!");
    } else if (Math.abs(a0.x-solution.x)+Math.abs(a0.y==solution.y)<=2){
	console.log("So close!");
	correctMessage("Almost! Try again.");
	setTimeout(function(){correctMessage("");},2000);
    } else {
        console.log("Try again.");
        score.total++;
        score.error++;
        updateScore();
	correctMessage("Try again.");
	setTimeout(function(){correctMessage("");},2000);
    }
}
function updateScore(){
    $("#count").html((score.count)+" of "+score.max);
    let suffix="errors"; if(score.error==1){suffix="error";}
    $("#score").html(score.error+" "+suffix);
}
function nextQuestion(){
    correctMessage("");
    score.count++;
    updateScore();
    if(score.count>score.max){
        $("#count").html("");
	correctMessage(score.error+" errors<br>"+score.max+' questions. <div class="playagain">Try Again</div>');
        $(".playagain").click(init);
    } else {
        chooseQuestion();
    }
}
function dragmove(dx,dy,x,y){
    let scale=0.15;
    let nx=drag.data("x0")+scale*dx;
    if(nx<0){nx=0;}
    if(nx>Ntics){nx=Ntics;}
    nx=Math.round(nx);
    hitic.attr("path",Raphael.format("M{0},{1}l0,{2}",2*nx,-rwidth/2+1,rwidth-2)).toFront();
    let ny=drag.data("L")+scale*dy;
    let sgn=ny>0?1:-1;
    if(Math.abs(ny)>30){ny=sgn*30;}
    if(Math.abs(ny)<1){ny=sgn*1;}
    drag.attr("path", arrowS(nx,ny));
    lbladjust(drag.data("label"),nx,ny);
    drag.data({nx:nx,ny:ny});
    settooltip(nx);
}
function settooltip(i){
    tooltip.transform("t"+(i*hscale)+",-5");
    position.attr({"text":i});
}
function dragend(){
    drag.data({x0:drag.data("nx"),
                L:Math.trunc(drag.data("ny"))});
    a0.x=drag.data("x0");
    a0.y=drag.data("L");
    tooltip.hide();
}

$(init);
