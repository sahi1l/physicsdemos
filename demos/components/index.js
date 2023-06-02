//FIX: Add +x and +y axes
var guess={x:1,y:1,trig:false};
var correct={x:1,y:1,trig:false};
var timeout;
//var sign={x:1,y:1};
//var trig=false;
function SetMagnitude(val){$(".magnitude").each(function(i,e){e.innerHTML=val;});};
function SetAngle(val){$(".angle").each(function(i,e){e.innerHTML=val;});};
function ToggleSign(which){
    guess[which]=-guess[which];
    var c;
    if(guess[which]>0){c="+";} else {c="-";}
    $("#"+which).html(c);
}
function ToggleTrig(){
    guess.trig=!guess.trig;
    var x="cos"; var y="sin";
    if(guess.trig){
        x="sin"; y="cos";
    }
    $("#xtrig").html(x); $("#ytrig").html(y);
}
var paper=undefined,base,vector,Lang,arc,correctQ;
function CalcComponents(obj,angle,trig){
    var radians=angle*Math.PI/180.0;
    if(trig){
        return {x:obj.x*Math.sin(radians),
                y:obj.y*Math.cos(radians)};
    } else {
        return {x:obj.x*Math.cos(radians),
                y:obj.y*Math.sin(radians)};
    }
}
function DrawArrow(xs,ys,trig,angle){
    //xs and ys are +/-1, trig works as above, angle is the angle in degrees
    //this should fix the base, the vector, and the angle indicator
    //positioning the angle indicator may be difficult
    correct={x:xs,y:ys,trig:trig};
    SetAngle(angle);
    var full = CalcComponents({x:xs,y:-ys},angle,trig);
    var half = CalcComponents({x:xs,y:-ys},0.5*angle,trig);
    var zero = CalcComponents({x:xs,y:-ys},0,trig);
    if(trig){
        base.attr("path","M0,-50L0,50");
    } else {
        base.attr("path","M-50,0L50,0");
    }
    vector.attr("path",(Raphael.format("M0,0L{0},{1}",50*full.x,50*full.y)));
    var llength=-0.43*angle+48.6;
    Lang.attr({x:llength*half.x,
                y:llength*half.y,
                text:angle+"°"});
    llength*=0.8;
    arc.attr({path:Raphael.format("M{0},{1}S{2},{3},{4},{5}",
                                  llength*zero.x, llength*zero.y,
                                  llength*half.x, llength*half.y,
                                  llength*full.x, llength*full.y
                )});
}
function CheckAnswer(){
    //Is the answer correct?
    if(guess.x==correct.x && guess.y==correct.y && guess.trig==correct.trig){
        correctQ.attr({text:"Correct!",fill:"green",opacity:1});
        score.correct++;
        score.number++;
        score.total++;
        if(score.number>score.max){
            correctQ.animate({opacity:0},2000,Win);
        } else {
            correctQ.animate({opacity:0},2000,RandomVector);
        }
    } else {
        score.total++; score.error++;
        correctQ.attr({text:"Try again",fill:"red",opacity:1});
        correctQ.animate({opacity:0},2000,ClearCorrect);
    }
    updateScore();
}
function Win(){
    $("#win>.click").click(start);
    $("#win>#percentage").html(score.error+' errors<br>'+score.max
                               +' questions');
        /*<br><div id="playagain">Try Again?</div>');*/
/*    $('#playagain').click(init);*/
    /*$("#win>#percentage").html(parseInt(100.0*score.correct/(0.0+score.total)+0.5)+"%");*/
    $("#win").attr({opacity:0}).show().animate({opacity:1},2000);
}
function updateScore(){
    var suffix=" errors"; if(score.error==1){suffix=" error";}
    $("#score").html(score.error+suffix);
//    $(".score").html(score.correct+"/"+score.total);
}
function updateNumber(){
    $(".number").html(score.number+" of "+score.max);
}
function ClearCorrect(){
//    correctQ.attr("text","");
}
function RandomVector(){
    ClearCorrect();
    updateNumber();
    DrawArrow(
        Math.floor(Math.random()*2)*2-1,
        Math.floor(Math.random()*2)*2-1,
        Math.floor(Math.random()*2),
        Math.floor(Math.random()*13)*5+20
        );
    
}
var score={correct:0,total:0,number:1,max:10,error:0};
function init(){
    if(paper!=undefined){paper.remove();}
    paper=Raphael("canvas",500,500);
    paper.setViewBox(-50,-50,100,100);
    base=paper.path("M0,0L30,0").attr({"stroke-dasharray":"-"});
    arc=paper.path("").attr({"stroke-dasharray":".",stroke:"grey","stroke-width":1});
    vector=paper.path("M0,0L10,30").attr({"stroke-width":3,"arrow-end":"classic","stroke-linecap":"round","stroke":"grey"});
    Lang=paper.text(0,0,"20°").attr({"font-size":8});
    correctQ=paper.text(-50,43,"")
        .attr({"font-size":10,"text-anchor":"start",opacity:0});
    $(".trig").click(ToggleTrig);
    $("#x").click(function(){ToggleSign("x")});
    $("#y").click(function(){ToggleSign("y")});
    $("#check").click(CheckAnswer);
    RandomVector();
    updateScore();
}
function start(){
    score.correct=0;
    score.total=0;
    score.number=1;
    score.error=0;
    $("#win").hide();
    correctQ.attr({opacity:0});
    RandomVector();
    updateScore();
}

$(init);
