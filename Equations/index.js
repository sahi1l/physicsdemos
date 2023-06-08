//even numbers are outer, odd numbers are inner
var letters=["A","B","C","D","E","F","G","H"];
var known=[];
var knownL=[];
var unknownL=[];
var need=0;
function rn(max){
    return Math.floor(Math.random()*max);
}
var choices={
1:[ //this is REALLY REALLY simple.
    [["1","1"]] 
    ,  [["11",""]]  
    ],
2:[ 
    [["011","011"],["011","1"]] 
    , [["1011","10"],["1011","01"]]
    ],
3:[
    [["0111","01"],["0101","101"]]
    , [["101","011"]]
    ],
4:[
    [["1101","010"]],
    [[]]
]
};
var choose=function(difficulty){
    if(difficulty==4){
        need=rn(4)*2;
    } else {need=rn(8);}
    var pattern=choices[difficulty][need%2];
    pattern=pattern[rn(pattern.length)];
    console.log(pattern);
    var dir=rn(2)*2-1;
    known=[]; knownL=[];
    for(var shift=1;shift<=4;shift++){
        var num=(need+shift*dir+8)%8;
        if(pattern[0][shift-1]=="1"){
            known.push(num);
            knownL.push(letters[num]);
        } else if (num!=need) {
	    unknownL.push(letters[num]);
	}
    }
    for(var shift=1;shift<=3;shift++){
        var num=(need-shift*dir+8)%8;
        if(pattern[1][shift-1]=="1"){
            known.push(num);
            knownL.push(letters[num]);
        } else if (pattern[1][shift-1]==undefined && rn(2)){
            known.push(num);
            knownL.push(letters[num]);
        } else {
	    unknownL.push(letters[num]);
	}
    }
    $("#need>span").html(letters[need]);
    $("#known>span").html(knownL.sort().join(","));
}

Equation=function(n,x,y){
    function format(a,b,c,s){
        return a+"="+b+s+c;
        var open="<span>\$$"; var close="\$$</span>";
        if(s=="*"){
            return open+a+"="+b+c+close;
        } else if (s=="/"){
            return open+a+"=\\frac{"+b+"}{"+c+"}"+close;
        } else {
            return open+a+"="+b+s+c+close;
        }
    }
    this.outer=letters[2*n];
    this.inner=[letters[2*n+1],letters[(2*n+7)%8]];
    this.type=["add","mul"][Math.floor(Math.random()*2)];
    var height=30;     var width=5*height;
    this.obj=$("#eq"+n);
    this.obj.addClass("ui-widget-content");
    this.obj.draggable({revert:"valid"});
    this.mode=0;
    this.update=function(adv){
        if(adv=="advance"){this.mode=(this.mode+1)%3;}
        var eqn;
        var p="+"; var n="-";
        if(this.type=="mul"){
            p="*"; n="/";
        }
        if(this.mode==0){
            eqn=format(this.outer,this.inner[0],this.inner[1],p);
        } else if (this.mode==1){
            eqn=format(this.inner[0],this.outer,this.inner[1],n);
        } else {
            eqn=format(this.inner[1],this.outer,this.inner[0],n);
        }
        this.obj.html("<span>\$$"+parse(eqn)+"\$$</span>");
        this.obj.data({"equation":eqn});
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.obj[0].id]);
    }
    this.obj.click($.proxy(function(){this.update("advance");},this));
    this.update();
}
var paper,eq1;
var workequation="";
//FIX: simplify double fractions
function drop(event,ui){
    var eqn=ui.draggable.data("equation");
    var eqnL=eqn.split("=");
    
    if(eqnL[0]==letters[need]){
        workequation=eqn;
    } else if(workequation.search(eqnL[0])>0 && eqnL[1].search(letters[need])<0){
        workequation=workequation.replace(eqnL[0],"("+eqnL[1]+")");
    }
    $(this).html("$$"+parse(workequation)+"$$");
    console.log("hi");
    Win();
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,ui.draggable.id]);
    
};
function Win(){
    var winQ=true;
    unknownL.forEach(function(val){
	if(workequation.search(val)>=0) {winQ=false;}
    });
    if(workequation.search(letters[need])<0){winQ=false;}
    if(winQ){
	console.log("WIN!");
	$("#win").show();
    }
}
function init(){
    choose(3);
    eq1=new Equation(0,100,100);
    eq2=new Equation(1,100,150);
    eq3=new Equation(2,100,200);
    eq4=new Equation(3,100,250);
    
    $("#workspace").droppable({
        drop:drop
    });
}

function parse(S) {
    function exprsplit(expr){
        //takes in an expression with an operator, and returns a list of [LEFT,OP,RIGHT]
        var LEFT="",OP="",RIGHT="";
        var paren=0;
        expr.split("").forEach(function(c){
            if(c=="("){
                paren++;
                if(paren>=1){
                    if(OP){RIGHT+=c;} else {LEFT+=c;}
                }
            } else if (c==")"){
                paren--;
                if(paren>=0){
                    if(OP){RIGHT+=c;} else {LEFT+=c;}
                }
            } else if (paren==0 && LEFT && !OP){
                OP=c;
            } else {
                if(OP){RIGHT+=c;} else {LEFT+=c;}
            }
        });
        return [LEFT,OP,RIGHT];
    }
    function color(letter){
        if(knownL.indexOf(letter)>=0){
            return "\\color{blue}{"+letter+"}";
        } else if (letter==letters[need]){
            return "\\color{red}{"+letter+"}";
        } else {
            return letter;
        }
    }
    function expression(expr,topQ){
        //takes either a single letter, or an expression in parentheses
        var LEFT,RIGHT,OP;
        if (expr[0]!="(") {
            return color(expr);
        }
        [LEFT,OP,RIGHT]=exprsplit(expr.slice(1,-1));
        LEFT=expression(LEFT); 
        RIGHT=expression(RIGHT);
        if(OP=="/"){return '\\frac{'+LEFT+'}{'+RIGHT+'}'}
        else if (OP=="*"){return LEFT+RIGHT;}
        else if (!topQ){{return "("+LEFT+OP+RIGHT+")";}}
        else {return LEFT+OP+RIGHT;}
    }
    var LHS=color(S.slice(0,1));
    return LHS+"="+expression("("+S.slice(2)+")",true);
}


$(init);

