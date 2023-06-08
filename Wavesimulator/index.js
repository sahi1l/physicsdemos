var paper;
var W=1000;
var H=300;
var Ndots=500;
var border=100;
var radius=5;
var dots=[];
var wavelength=200; var frequency=1; var amplitude=20; var transverse=true;
var time=0
var dt=0.1
var stoppedQ=false;
function run(){
    if(!stoppedQ){
        move(time)
        time+=dt
        setTimeout(run,100)
    } else {stoppedQ=0;}
}
function move(t){
    var x; var y
    wavelength=$("#wavelength").val()
    frequency=$("#frequency").val()
    amplitude=$("#amplitude").val()
    transverse=($("input[name='type']:checked").val()=="true")
    var hilite=$("#highlight:checked").val();
    for (hi of highlights){
        if(hilite){
            hi.attr("fill","red")
        } else {
            hi.attr("fill","black")
        }
    }
        
    for (var dot of dots){
        var D=amplitude*Math.cos(2*Math.PI*((dot.x0-border)/wavelength-t*frequency));
        if(transverse){
            x=dot.x0;
            y=H/2+D;
        } else {
            x=dot.x0+D;
            y=dot.y0;
        }
        dot.obj.attr({cx:x,cy:y});
    }
}
var highlights=[];
function init(){
    paper=Raphael("canvas",W,H);
    $("#canvas").height(H);
    $("#canvas").width(W);
    dots=[]
    for(let i=0;i<Ndots;i++){
        var x=i/Ndots*(W-2*border)+border;
//        var x=Math.random()*(W-2*border)+border;
        var y=Math.random()*50-25+H/2;
        var O={obj:paper.circle(x,y,radius).attr({fill:"black"}),
                     x0:x,
               y0:y};
    dots.push(O);
        if(i%100==50){
            highlights.push(O.obj);O.obj.toFront();}
        else {O.obj.toBack();}
    }
}
$(init);
