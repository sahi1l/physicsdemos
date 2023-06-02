function round(number){
    if(number>=10){return number.toFixed(0);}
    return number.toPrecision(2);
}
function randint(from,to){
    return Math.floor(Math.random()*(to-from+1))+from;
}
function str(num){return num.toString();}
function Metric(a,b,t){
    var S=str(a)+"."+str(b)+"e-"+str(t);
    var pfx="µ"; var mul=1e6;
    if (t<4 || (t==4 && randint(0,1))){pfx="m"; mul=1e3;}
    if (t>7 || (t==7 && randint(0,1))){pfx="n"; mul=1e9;}
    return round(parseFloat(S)*mul)+" "+pfx;
}
function Decimal(a,b,t){
    var S=str(a)+"."+str(b)+"e-"+str(t);
    return parseFloat(S).toFixed(t+1)+" ";
}
function Scientific(a,b,t){
    return str(a)+"."+str(b)+"×10<sup>-"+str(t)+"</sup> ";
}
function chooseQuestion(){
    var a=randint(1,9);
    var b=randint(0,9);
    var t=randint(1,10);
    var unit=["m","N","J","C"][randint(0,3)];
    var functions=[Decimal,Scientific,Metric];
    var Q=randint(0,2);
    var A;
    if(Q==0){A=randint(1,2);} else {A=3-Q;} //don't let decimal be an answer, it's a pain
//    var A=(Q+randint(1,2))%3;
    var question=functions[Q](a,b,t)+unit;
    var answers=[1,2,3,4,5,6,7,8,9,10];
    answers.splice(t-1,1);
    for(i=0; i<4; i++){
        answers.splice(randint(1,9-i)-1,1);
    }
//    answers.splice(randint(0,5),0,t); //add in correct answer somewhere
    fn=functions[A];
    console.log(answers);
    answers=answers.map(function(x){return fn(a,b,x)+unit});
    setquestion({question:question,
                correct:(functions[A](a,b,t))+unit,
                others:answers});
}
        

