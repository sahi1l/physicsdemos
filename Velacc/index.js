import {Score} from "../lib/quiz.js";
let $main;
function arrow(paper,x,y,L,dir,text,boxQ=false) {
    //just a horizontal arrow...for now (dunh dunh dunh)
    //dir will be an angle in degrees, eventually
    let fsize = 24;
    console.debug(paper,x,y,L);
    let lineobj = paper.path(`M${x},${y}m${-L/2},0l${L},0`)
        .attr({"arrow-end":"classic","stroke-width":4});
    let textobj = paper.text(x,y-fsize,text)
        .attr({"font-size":fsize, "text-anchor":"middle"});
    let st = paper.set();
    st.push(lineobj,textobj);
    if (boxQ) {
        let size = L/2;
        let boxobj = paper.rect(x-L/2-size,y-size/2,size,size);
        st.push(boxobj);
    }
    st.rotate(dir,x,y);
    textobj.rotate(-dir,x,y-fsize);
    return st;
}
function generator(canvas) {
    let vdir = Math.random()*360;
    let adir;
    do {
        adir = Math.random()*360;
    } while (Math.abs(Math.abs(adir-vdir)%180 -90) < 10);
    let diff = Math.abs(adir-vdir);
    let sgn = 1;
    if (diff>90 && diff<270) {sgn=-1;}
//    canvas.$w.appendTo($main);
    canvas.$w.css({"border":"1px solid","display":"inline-block"});
    arrow(canvas.paper,150,100,70, vdir,"v",true).attr({"stroke":"red","fill":"red"});
    arrow(canvas.paper,150,200,70,adir,"a");
    let poss = ["slowing down","","speeding up"];
    return {text: "This object is...",
            correct: poss[sgn+1],
            others: [poss[-sgn+1]]
           };
}

function init(){
    $main = $("demo-quiz");
    new Score($main,30,generator,{canvas:true,sort:"a"});
}
$(init);
