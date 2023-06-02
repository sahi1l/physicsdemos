import Score from "/lib/quiz.js";


function init(){
    new Score($("#main"),30,generator);
}
$(init)
