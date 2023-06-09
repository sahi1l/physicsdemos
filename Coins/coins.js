import Button from "../lib/buttons.js";
let coins=4;
let trials=12;
let N=0;
let S=0;
let SS=0;
let coinimgwidth = 600;
let coinwidth = 20;
let setup=function(){
    coins=$("#coin").html();
    $("#histogram").html("");
    let coinimg = $("#coinimg");
    coinimg.html("").css("width",coinimgwidth);
    let width = Math.min(20,coinimgwidth/coins);
    for(let c=0; c<=coins; c++){
        if (c>0) {
            let img = $('<img>').css("width",coinwidth);
            img.attr("src","coin.png");
            let pos = c*width;
            img.css({position:"absolute",left:pos});
            img.appendTo(coinimg);
        }
        $("#histogram").append("<tr><td><span class='heads'>"+c+"</span></td><td><span class='count' id='c"+c+"'><span class='num'>0</span></span></td></tr>");
    }
}
let run=function(){
    trials=$("#trial").html();
    for(let t=0;t<trials;t++){
        trial();
    }
    let avg = S/N;
    let std = Math.sqrt((SS/N)-(S/N)**2);
    let txt  = [`Number of trials: ${N}`];
    txt.push([`Average number of heads: ${avg.toFixed(1)}`]);
    txt.push([`Standard deviation: ${std.toFixed(1)}`]);
    txt = txt.map((x)=>{return `<span>${x}</span>`}).join('\n');
    $("#stats").html(txt);
    console.log(S,SS);
    console.log("Mean: ",S/N);
    console.log("Stdev: ",Math.sqrt((SS/N)-(S/N)**2));
    
}
let trial=function(){
    var cnt=0;
    for(let c=0; c<coins; c++){
        if(Math.random()<0.5){cnt++;}
    }
    $("#c"+cnt).prepend("&nbsp;");
    N+=1;
    S+=cnt;
    SS+=cnt*cnt;
    var w=$("#c"+cnt+">.num").html();
    $("#c"+cnt+">.num").html(parseInt(w)+1);
};
let resetcount=function(){
    N=0;
    S=0;
    SS=0;
    $(".count").html("<span class='num'>0</span>");
};
let init=function(){
    
    $("#trials").on("input",function(){$("#trial").html(this.value);});
    $("#coins").on("input",function(){$("#coin").html(this.value);setup();});
    $("#run").on("click",function(){resetcount();run();});
    $("#add").on("click",run);
    $("#trial").html($("#trials").val());
    let Run = new Button("Clear count and run trials",()=>{resetcount();run();});
    let Add = new Button("Run more trials", run);
    Run.$w.appendTo("#buttons");
    Add.$w.appendTo("#buttons");
    setup();
};

$(init);
