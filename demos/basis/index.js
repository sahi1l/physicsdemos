var N=4;
var A=undefined,B=undefined;
var rng=3;
var score={correct:0, total:0, count:0, error:0};
var maxquestions=10;
arrow={"stroke-width":0.2,"arrow-end":"classic"};
var btn=[];

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
//========================================
function init() {
    score={correct:0, total:0, count:0, error:0};
    $("#problem").empty();
    $("#correct").empty();
    $("#problem").append('<div id="A" class="source"></div>');
    if(A!=undefined){
        A.remove();
        for(i=1;i<=N;i++){btn[i-1].remove();}
    }
    btn=[];
    A=Raphael("A",200,200)
        .setViewBox(-rng,-rng,2*rng,2*rng)
        .path("M-1,0L1,0").attr(arrow);
    let basis = Raphael("basis",100,100)
	.setViewBox(-rng,-rng,2*rng,2*rng)
    basis.path("M-2,-1.5L-2,2L1.5,2").attr(arrow).attr({"arrow-start":"classic"});
    basis.text(-2,-2,"+y").attr({"font-size":1,"font-family":"Times"})
    basis.text(2,2,"+x").attr({"font-size":1,"font-family":"Times"})
    $("#choices").empty();
    for(i=1;i<=N;i++){
        $("#choices").append('<div id="c'+parseInt(i)+'" class="button"></div>')
    }
    
    for(i=1; i<=N; i++){
        btn.push(
            Raphael("c"+parseInt(i),100,100)
                .setViewBox(-rng,-rng,2*rng,2*rng)
		.text(0,0,"").attr({"font-size":2,"font-family":"Times"})
//                .path("M-1,0L1,0").attr(arrow)
        );
        $("#c"+parseInt(i)).click({"b":i-1},clik);
        $("#c"+parseInt(i)).mousedown({"b":i-1},mdown);
        $("#c"+parseInt(i)).mouseout({"b":i-1},mup);
        $("#c"+parseInt(i)).mouseup({"b":i-1},mup);
    }
    updateScore();
    makeproblem();
}
function drawarrow(canvas,dx,dy){
    console.debug("drawarrow",dx,dy)
    canvas.attr("path",Raphael.format("M{0},{1}L{2},{3}",-dx,-dy,dx,dy));
};
function mdown(e){
    e.preventDefault();
    btn[e.data.b].attr("stroke-width",0.5);//.attr("stroke-width",0.4);
};
function mup(e){
    e.preventDefault();
    btn[e.data.b].attr("stroke-width",0.2);//.attr("stroke-width",0.2);
};
function clik(pram){
    var b=pram.data.b;
    if(b==soln){
        console.log("Right!");
        score.correct++; score.total++;
        updateScore();
        setTimeout(nextQuestion,3000);
        $("#correct").html("Correct!");
        for(i=0;i<4;i++){
            if(i!=b){btn[i].hide();}
        }
        btn[b].attr("stroke-width",0.5);
    } else {
        console.log("Wrong!");
        score.total++; score.error++;
        updateScore();
        $("#correct").html("Try again.");
        btn[b].attr("path","M10,10l1,1");
    }
}
function updateScore(){
    $("#count").html((score.count+1)+" of "+maxquestions);
    var suffix="errors"; if(score.error==1){suffix="error";}
    $("#score").html(score.error+" "+suffix);
}

function rn(){
    var r;
//    do {
//        r=Math.floor(Math.random()*5-2);
    //    } while (r==0);
    return r;
}
var soln;
function nextQuestion(){
    for(i=0;i<4;i++){
        btn[i].show().attr(arrow);
    }
    $("#correct").html("");
    score.count++;
    updateScore();
    console.log("Number of questions:",score.count);
    if(score.count==maxquestions){
        //Ending scenario
        $("#count").html("");
        $("#correct").html(score.error+' errors<br>'+maxquestions+' questions<br><div class="playagain">Try Again?</div>');
        $(".playagain").click(init);
    } else {
        makeproblem();
    }
}

function makeproblem(){
    let L = 1;
    let yQ = Math.floor(Math.random()*2)
    let sgn = Math.floor(Math.random()*2)*2-1
    let answers = [["+x", "-x", "+y", "-y"],
		   ["(+5,0)", "(-5,0)", "(0,+5)", "(0,-5)"]]
    answers = shuffle(answers)[0]
    soln=0;
    
    if (!yQ) {
	drawarrow(A,sgn*L, 0)
    } else {
	drawarrow(A,0,-sgn*L)
    }
    soln = yQ*2 + (1-sgn)/2
    console.log("yQ,sgn,soln",yQ,sgn,soln)
    let b = [0,1,2,3];
//    var b=shuffle([0,1,2,3]);
    soln=b[soln];
    for (let i=0; i<4; i++) {
	btn[b[i]].attr("text", answers[i])
    }
	
}
$(init);
