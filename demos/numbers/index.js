var data={};
var score={correct:0, total:0, count:0, error:0};
var maxquestions=8;
function setquestion(question){
    //Question is an object
    //question.question is a string with the question.
    //question.correct is a string, the correct answer
    //question.others is a list of strings, the other answers
    $(".question")[0].innerHTML=question.question;
    
    var A=question.others.slice();
    A.push(question.correct);
    data=$.extend(true,{},question); //clone question into data
    for (var i=A.length-1; i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var tmp=A[i];
        A[i]=A[j];
        A[j]=tmp;
    }
    var result=""
    for (var i=0;i<A.length;i++){
        if(i%3==0){result+="<br>";}
        result+="<span>"+A[i]+"</span>"
    }
    $(".answers")[0].innerHTML=result;
//    MathJax.Hub.Queue(["Typeset",MathJax.Hub]); //race condition?
    bindanswers(question);
}
function bindanswers(question){
    $(".answers>span").mousedown(function(e){
            e.preventDefault();
            $(this).addClass("mousedown");
        });
    $(".answers>span").mouseout(function(){
            $(this).removeClass("mousedown");
        });
    $(".answers>span").mouseup(function(){
            $(this).removeClass("mousedown");
            answer=this.innerHTML;
            correctQ(answer);
        });
};
function nextQuestion(){
    $("#correct").html("");
    score.count++;
    updateScore();
    console.log("Number of questions:",score.count);
    if(score.count==maxquestions){
        //Ending scenario
        $(".answers").html("");
        $("#count").html("");
        $("#correct").html(score.error+" errors<br>"+maxquestions+" questions");
        $(".answers").html('<div class="playagain">Try Again</div>');
        $(".playagain").click(init);
                
//        $("#correct").html("Total score:<BR>"+parseFloat(score.correct/(0.0+score.total)*100).toFixed(0)+"%");
    } else {
        chooseQuestion();
    }
}
function correctQ(response){
    if(response == data.correct) {
        console.log("Correct!");
        score.correct++; score.total++;
        updateScore();
        setTimeout(nextQuestion,3000);
        $("#correct").html("Correct!<BR>"+response);
    } else {
        console.log("Wrong!",response,data.correct);
        score.total++;
        score.error++;
        updateScore();
        $("#correct").html("Try again.");
    }
}
function updateScore(){
    $("#count").html((score.count+1)+" of "+maxquestions);
    if(score.total){
//        $("#score").html((score.correct*100/score.total).toFixed(0)+"%");
    } else {
//        $("#score").html("--");
//        $("#score").html(score.error+" errors");
    }
    var suffix="errors"; if(score.error==1){suffix="error";}
    $("#score").html(score.error+" "+suffix);
}
function init(){
    score={correct:0,total:0,count:0,error:0};
    updateScore();
    $("#correct").html("");
    chooseQuestion();
}
$(init);

