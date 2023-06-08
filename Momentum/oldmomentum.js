var Height=300; var Width=900;
var radius=30;
var fontsize=12;
//var shooter={xmin:10,xmax:110,thumbH:10, thumbW:5, grooveH:4, y:100};
//shooter.vmax=40; //maximum velocity that can be obtained
/*var range={xmin: shooter.xmax+radius, xmax:Width-2*radius, 
           bally:shooter.y};
range.arrowy=range.bally-1.5*radius;
range.vely=range.arrowy-fontsize;*/


/*var paper;*/
var source,target;
var Smass,Tmass;
var Svel,Tvel;
var W=150;
var leftmargin=100;
//var shooter={}

/*
function arrow(len){
    var L=Math.sign(len)*(0.5+(Math.sqrt(Math.abs(len))))*radius/4; //scale properly
    console.log(L);
    if(L==0){L=1;}
    return "M"+(-L)+","+range.arrowy + "l"+2*L+",0";
}
*/
function init(){
/*    paper=Raphael("canvas",Width,Height);*/
    paper.path("M-"+W+",-"+radius+"L"+W+",-"+radius);
//    paper.setStart();
//    Tarrow=paper.path(arrow(30)).attr({"arrow-end":"normal","stroke-width":2});
//    paper.circle(-1,0,radius).attr({fill:"#ccc"});
//    Tmass=paper.text(-1,0,"M");
//    Tvel=paper.text(0,range.vely,"V");
//    target=paper.setFinish();
//    target.translate(range.xmax,0);

//    paper.setStart();
//    Sarrow=paper.path(arrow(30)).attr({"arrow-end":"normal","stroke-width":2});
//    paper.circle(1,0,radius).attr({fill:"yellow"});
//    Smass=paper.text(1,0,"m");
//    Svel=paper.text(0,range.vely,"v");
//    source=paper.setFinish();
//    source.translate(range.xmin,0);

/*
    shooter.groove=paper.rect(shooter.xmin,shooter.y-shooter.grooveH/2,
                              shooter.xmax-shooter.xmin,shooter.grooveH).attr({fill:"grey"});
    shooter.thumb=paper.rect(0,shooter.y-shooter.thumbH/2,shooter.thumbW,shooter.thumbH)
        .attr({fill:"red"});
    shooter.thumb.drag(shooter.dragmove,shooter.dragstart,shooter.dragend);
*/
//    shooter.moveto(1);
    setup();
}
/*
shooter.moveto=function(v){
    if(v>shooter.vmax){v=shooter.vmax;}
    if(v<1){v=1;}
    var x=shooter.xmin+(shooter.vmax-v+1)/parseFloat(shooter.vmax)*(shooter.xmax-shooter.xmin);
    shooter.thumb.attr({x:x-shooter.thumbW/2});
};
*/

/*
shooter.getvel=function(x){
    var v=-(x-shooter.xmin)*shooter.vmax/parseFloat(shooter.xmax-shooter.xmin)+1+shooter.vmax;
    return v;
};
*/
/*
shooter.dragstart=function(x,y){
};
shooter.dragmove=function(dx,dy,nx,ny){
    var v=shooter.getvel(nx);
     shooter.moveto(Math.round(v));
};
shooter.dragend=function(){

};
*/
shooter.launch=function(){
};
function label(){
    Tmass.attr("text",target.mass);
    Tvel.attr("text",Math.abs(target.vel));
    Smass.attr("text",source.mass);
    Svel.attr("text",Math.abs(source.vel));
    Sarrow.attr("path",arrow(source.vel));
    Tarrow.attr("path",arrow(target.vel));
    //fix arrows to switch direction and length
}
var handle;
function setup(){
    var L=twopair();
    target.mass=L[0].mass;
    target.vel=-L[0].vel;
    source.mass=L[1].mass;
    source.vel=1;
    target.x=W-radius; position(target);
    source.x=-W+radius; position(source);
    label();
    clearInterval(handle);
    handle=setInterval(step,10);
    
}
var launchedQ=false;
var dt=0.04;
function position(obj){
    obj.transform("");
    obj.translate(obj.x,0);
}
function step(){
    if(source.x+2*radius>target.x){clearInterval(handle);return;}
    target.x+=target.vel*dt;
    if(launchedQ){
        source.x+=source.vel*dt;
    }
    position(target);
    position(source);
}

//Choosing numbers
/*
function f(x,y,z){
    return Math.pow(2,x) * Math.pow(3,y) * Math.pow(5,z);
}
function randint(max){
    return Math.floor(Math.random()*(max+1));
}
function twopair(){
    var a,b,c,z;
    do {
        a=randint(3);
        b=randint(2);
        c=randint(2);
        z=(a==0) + (b==0) + (c==0);
    } while (a+b+c<3 || z>1);
    var N=f(a,b,c);
    var m,n=f(randint(a), randint(b), randint(c));
    do {
        m=f(randint(a), randint(b), randint(c));
    } while (Math.max(m,N/m)==Math.max(n,N/n));
    return [{mass:Math.max(n,N/n),vel:Math.min(n,N/n)},
            {mass:Math.max(m,N/m),vel:Math.min(m,N/m)}];

};
*/


$(init);
//FIX: The viewbox is a problem with dragging
//Dragging uses screen coordinates
//Probably best to ditch the viewbox and maybe use translate instead?
