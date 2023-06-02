var O;
function shake(dx,dy) {
    O.attr("fill","yellow");
    O.animate({fill:"red"},200);
    //    setTimeout("O.attr(\"fill\",\"red\")",100);
}
function lihstep(dx,dy) {
    x=O.attr("cx")+dx;
    y=O.attr("cy")+dy;
    r=O.attr("r");
    if(x>200-r){dx=-Math.abs(dx);shake(1,0);}
    if(x<r){dx=Math.abs(dx);shake(-1,0);}
    if(y>200-r){dy=-Math.abs(dy);shake(0,1);}
    if(y<r){dy=Math.abs(dy);shake(0,-1);}
    O.attr({cx:x,cy:y});
    //    O.animate({x: x,y:y},100);
    //    $("circle").attr("x",x);
    //    $("circle").attr("y",y);
    setTimeout("lihstep("+dx+","+dy+")",10);
}
 
$(document).ready(function(){
	var paper=Raphael("canvas",320,320);
	var circle=paper.circle(160,160,20);
	circle.attr("fill","cyan");
	circle.attr("stroke","black");
	O=circle;
	lihstep(1,1.1);
    }
    )
    
    
