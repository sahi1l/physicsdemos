function insertMath(paper,x,y,text,attr={}) {
    //convert x and y to percentages
    let [left,top,vwidth,vheight,bleh] = paper._viewBox;
    let xp = (x-left)/(vwidth);
    let yp = (y-top)/(vheight);
    //convert to screen coordinates
    let $canvas = $(paper.canvas);
    let offset = $canvas.offset();
    offset = {left:0,top:0};
    let width = $canvas.width();
    let height = $canvas.height();
    let X = offset.left + width*xp;
    let Y = offset.top + height*yp;
    let $result = $(`<span>`)
        .html(text)
        .addClass("mathtext")
        .css({...attr,"font-size":24,"font-family":"Times",
              position:"absolute",
              left:X, top:Y})
        .appendTo($canvas.parent());
    return $result;
}
function init() {
    $("#help").show();
    let paper = Raphael("triangle","100%","100%");
    paper.setViewBox(-10,-10,120,120);
    console.debug(paper);
    let LEFT = 0;
    let RIGHT = 57.7;
    let TOP = 0;
    let BOTTOM = 100;
    let attrBase = {"stroke-linecap":"round","arrow-end":"classic"};
    let attrComps = {...attrBase,
                     "stroke-dasharray":"-",
                     "stroke-width":2,
                    };
    let attrMain = {...attrBase,"stroke-width":3};
    let attrText = {"font-family":"Times"};
    let mathify = [];
    paper.path(`M${RIGHT+1},${TOP+2}L${RIGHT+1},${BOTTOM}`)
        .attr({...attrComps,stroke:"purple"}); //vertical 
    paper.path(`M${RIGHT-2},${BOTTOM-1}L${LEFT+1},${BOTTOM-1}`)
        .attr({...attrComps,stroke:"green"}); //horizontal
    paper.path(`M${RIGHT},0L0,100`).attr(attrMain); //diagonal
    insertMath(paper,(LEFT+RIGHT)/2-12,(TOP+BOTTOM)/2-5,
               String.raw`<math><mover accent="true"><mi>v</mi><mo>&rarr;</mo></mover></math>`);
    insertMath(paper,RIGHT+4,(TOP+BOTTOM)/2,
               String.raw`&ndash;<math><mi>v</mi></math> sin 60&deg;`
               ,{color:"purple"}
              );
    insertMath(paper,10,BOTTOM+4,
               String.raw`&ndash;<math><mi>v</mi></math> cos 60&deg;`,
               {"text-align":"center",color:"green"});
    paper.path(`M70,${TOP+5}l0,20l20,0`)
        .attr({"arrow-start":"classic","arrow-end":"classic"});
    insertMath(paper,92,TOP+14+5,
               String.raw`<math><mrow><mo>+</mo><mover accent="true"><mi>x</mi><mo>^</mo></mover></mrow></math>`);
    insertMath(paper,64,TOP-10,
               String.raw`<math><mrow><mo>+</mo><mover accent="true"><mi>y</mi><mo>^</mo></mover></mrow></math>`);
    paper.text(LEFT+8,BOTTOM-7,"60°")
        .attr({...attrText,"text-anchor":"start"});
    $("#helpbutton").off("click");
    $("#helpbutton").on("click",()=>{$("#help").toggleClass("shown");});
}
$(init);
