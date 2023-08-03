import Button from "../lib/buttons.js";
//parseFloat is string/number to number
//.toFixed is number to string
function fixed(val) {
    return parseFloat(val).toFixed(1);
}
function isConstructive(val) {
    if (typeof(val) != "string") {
        val = parseFloat(val);
    }
    val = fixed(val).split(".");
    let decimal = val[1];
    return !(decimal>2.5 && decimal<7.5);
}
function combine(textlist) {
    return textlist.map((x)=>`<P>${x}</P>`);
}
class Color {
    constructor(args) {
        this.color = "";
        let code = (args.fg!=undefined)*2 + (args.bg!=undefined);
        if (code==0) {this.fg = "black"; this.bg = "white"; this.color = "black";}
        else if (code==1) {this.fg = "white", this.bg = args.bg; this.color = args.bg;}
        else if (code==2) {this.fg = args.fg, this.bg = "white"; this.color = args.fg;}
        else {this.fg = args.fg, this.bg = args.bg; this.color = args.fg;}
        this.text = args.text??"";
    }
    $widget(){
        return $("<span>").html(this.text).addClass("vocab").css({color: this.fg,"background-color": this.bg});
    }
    html(text){
        let $w = this.$widget();
        if (text) {$w.html(text);}
        return $w[0].outerHTML;
    }
}
        
let crest = new Color({text:"red", bg:"red"});
let trough = new Color({text:"blue", bg:"blue"});
let mixed = new Color({text:"purple", bg:"#A74576"}); //#B1487D"}
let black = "#0F1735";
let accent = "#DBBB1D";
let constructive = new Color({text: "constructive", bg: accent, fg: black});
let destructive = new Color({text: "destructive",   fg: accent, bg: black});
class Canvas {
    constructor($root,W,H) {
        this.$root = $root;
        this.$w = $("<div>").appendTo($root);
        this.H = H;
        this.W = W;
        this.p = 0;
        this.spacing = 20;
        this.paper = Raphael(this.$w.get(0), W, H);
        this.left = new Ripple(this, W/4, H/2, this.spacing);
        this.right = new Ripple(this, 3*W/4, H/2, this.spacing);
        this.overlay = this.paper.rect(0,0,this.W,this.H).attr({opacity:0.05, fill:black});
        //        this.rulers = new Rulers()
        this.stopanimate = false;
        this.left.raise();
        this.right.raise();
        this.overlay.toFront();
        this.left.source.toFront();
        this.right.source.toFront();
    }
    animate() {
        this.p += 0.05;
        if(this.p>=1) {this.p-=2;}
        this.left.animate(this.p);
        this.right.animate(this.p);
        if (!this.stopanimate) {
            setTimeout(this.animate.bind(this), 100);
        }
    }
}
//================================================================================
class Ripple {
    colors = [crest.color, trough.color]
    constructor(canvas,x0,y0,spacing) {
        this.x0 = x0
        this.y0 = y0
        this.spacing = spacing
        this.imax = canvas.W/this.spacing
        canvas.paper.setStart();
        for(let i=0; i<this.imax; i++){
            canvas.paper.circle(this.x0, this.y0, i*this.spacing)
                 .attr({"stroke-width":this.spacing,
                        stroke: this.colors[i%2],
                        opacity:0.5,
                        "clip-rect": `0,0,${canvas.W},${canvas.H}`,
                       })
        }
        this.circles = canvas.paper.setFinish()
        this.source = canvas.paper.circle(this.x0, this.y0, this.spacing/2).attr({fill:black}).toFront()
        this.source.click(this.toggleVisibility.bind(this))
        this.visible = true
        this.raise()
    }
    toggleVisibility() {
        this.visible = !this.visible
        if (this.visible){
            this.circles.show()
        } else {
            this.circles.hide()
        }
    }
    raise() {
        this.circles.forEach((circle, index)=> {if (index%2==0) {circle.toFront();}}) //it just looks better if the reds are above the blues

        this.source.toFront();
    }
    animate(p) {
        this.circles.forEach(
            (circle, index) => {
                let radius = 0;
                if (index + p >= 0) {radius = (index + p) * this.spacing};
                circle.attr("r",radius);
            })
    }
}
//================================================================================
class Text {
    constructor($root,canvas) {
        this.$w = $("<div>").appendTo($root).addClass("text")
        this.canvas = canvas;
        console.debug(this.$w);
        let N = [this.addAnimation(), this.addWavefronts(), this.addPathLength()];
        console.debug(N);
        for (let n of N) {
            this.$w.append(n.addClass("card"))
        }
    }
    vocab(text,tooltip) {
        return `<span class="tooltip">${text}<span class="tooltiptext">${tooltip}</span></span>`;
    }
    addSources(){
    }
    addWavefronts(){
        let div = $("<div>")
        let color = (text,color)=> {color=color??text; return }
        let conText = this.vocab(constructive.html(),"when two crests or two troughs line up");
        let desText = this.vocab(destructive.html(), "when a crest lines up with a trough");
        let text = ["The wavefronts created by each source form circles which move away from the source.",
                    `The ${crest.html()} regions are crests, and the ${trough.html()} regions are troughs.`,
                    `Where the wavefronts of both sources overlap, we get ${this.vocab("interference","when two or more waves occupy the same space")}:`,
                    `- ${crest.html()} + ${crest.html()} = ${crest.html()}:     <B>${conText}</B> interference`,
                    `- ${trough.html()} + ${trough.html()} = ${trough.html()}:  <B>${conText}</B> interference`,
                    `- ${crest.html()} + ${trough.html()} = ${mixed.html()}: <B>${desText}</B> interference`
                   ];
        div.html(combine(text))
        return div
        
    }
    addAnimation() {
        let text = [
            `The two black dots &#x25CF; are <B>sources</B> of waves, which are ${this.vocab("in phase","the sources create crests and troughs at the same time")} with each other.`,
            "• Click on a dot to turn its wavefronts on or off."];
        
        this.animateButton = new Button(["Start","Stop"], undefined , true);
        this.animateButton.command = this.toggleAnimate.bind(this);
        let buttontext = $("<div>").html(combine(text));
        this.animateStatus = false;
        let p = $("<P>").appendTo(buttontext);
        this.animateButton.$w.appendTo(p);
        p.append(" the animation by pressing this button.");
        this.toggleAnimate();
        return buttontext;
    }
    addPathLength() {
        let div = $("<div>").html("Click on a point to show the distance from that point to each source, measured in wavelengths.<BR>Try to click on a spot which is red, blue, or purple.  (You can turn off the animation to make this easier.)")
        this.L1 = $("<span>")
        this.L2 = $("<span>")
        this.dL = $("<span>")
        this.closerTo = $("<span>")
        this.interference = $("<span>")
        this.PLcalc = $("<div>").append("The path length difference at this point is &Delta;L = │")
        this.PLcalc.append(this.L1).append("&lambda;-").append(this.L2).append("&lambda;│=")
        this.PLcalc.append(this.dL)
        this.PLcalc.append("&lambda;")
        this.PLcalc.append(`<BR>The decimal is closer to `)
        this.PLcalc.append(this.closerTo)
        this.PLcalc.append(" so this is ")
        this.PLcalc.append(this.interference)
        this.PLcalc.append(" interference.")
        this.PLcalc.hide().css("font-size","125%")
        
        this.PLcalc.appendTo(div)
        return div
        //hide this line 
    }
    updatePathLength(l1,l2){
        this.PLcalc.show()
        this.L1.html(fixed(l1))
        this.L2.html(fixed(l2))
        let dL = Math.abs(fixed(l1)-fixed(l2)).toFixed(1)
        let integer = dL.split(".")[0]
        let decimal = dL.split(".")[1]
        this.dL.html(`${integer}.<span class="decimal">${decimal}</span>`) //IDEA: highlight the number after the decimal point
        $(".decimal").css({"font-weight":"bold"})
        if (isConstructive(dL)){
            let color = constructive.color
            this.closerTo.html(".0")
            this.interference.html(constructive.html())
            $(".decimal").html(constructive.html(decimal))
//            $(".decimal").css({color:color})
        } else {
            let color = destructive.color
            this.closerTo.html(".5")
            this.interference.html(destructive.html()).css({color:color})
            $(".decimal").html(destructive.html(decimal))
//            $(".decimal").css({color:color})
        }
        //updates values for the two path lengths and the difference
        //which are spans created in addPathLength
    }
    toggleAnimate() {//this is what the button calls
        this.canvas.stopanimate = !(this.animateButton.onQ);
        if (this.animateButton.onQ) {
            this.canvas.animate();
        }
/*        if (this.animateStatus) {//currently running
            this.canvas.stopanimate=true;
            this.animateButton.html("Start")
        } else {
            this.canvas.stopanimate=false;
            this.canvas.animate()
            this.animateButton.html("Stop")
        }
        this.animateStatus = !this.animateStatus;*/
    }
}
//================================================================================
class Label {
    constructor(canvas) {
        this.bW = 40
        this.bH = 20
        this.backing = canvas.paper.rect(-100, -100, this.bW, this.bH).attr({fill:"white", stroke:black});
        this.label = canvas.paper.text(0,0,"").attr({"font-size":18, fill:black});
    }
    resize(bW,bH) {
        this.bW = bW ?? this.bW
        this.bH = bH ?? this.bH
        this.backing.attr({height: this.bH, width: this.bW})
    }
    draw(x,y,text,color){
        let fg = black; let bg="white"
        if (color) {
            fg = color.fg; bg = color.bg
        }
        this.backing.attr({x: x - this.bW/2 , y: y - this.bH/2, fill: bg}).toFront()
        this.label.attr({x: x, y:y, text: text, fill:fg}).toFront()
    }
}
//================================================================================
class LabelledLine {
    constructor(canvas, x0, y0) {
        let linestyle = {stroke:"white", "stroke-width":3, "stroke-dasharray": "."}
        this.canvas = canvas
        this.x0 = x0
        this.y0 = y0
        this.line = canvas.paper.path("M0,0").attr(linestyle);
        this.label = new Label(canvas)
//        this.backing = canvas.paper.rect(-100,-100,bW,bH).attr({fill:"white", stroke:black});
//        this.label = canvas.paper.text(0,0,"").attr({"font-size":18, fill:black});
    }
    draw(x,y,text) {
        this.line.attr("path",`M${this.x0},${this.y0}L${x},${y}`).toFront()
        let length = Math.hypot(x-this.x0, y-this.y0)/(2*this.canvas.spacing).toFixed(1);
        let tx = (this.x0+x)/2.;
        let ty = (this.y0+y)/2.;
        this.label.draw(tx, ty, fixed(length))
//        this.backing.attr({x:(tx-this.bW/2.), y:(ty-this.bH/2.)}).toFront();
//        this.label.attr({x:tx, y:ty, text: length.toFixed(1)}).toFront();
        return parseFloat(length)
    }
}
//================================================================================
class Rulers {
    constructor(canvas, text) {
        this.canvas = canvas
        this.text = text
        this.point = {x:0, y:0};
        this.left = new LabelledLine(canvas, canvas.left.x0, canvas.left.y0);
        this.right = new LabelledLine(canvas, canvas.right.x0, canvas.right.y0);
        this.delta = new Label(canvas)
        this.init = {x:0, y:0};
        canvas.overlay.drag(this.drag.bind(this), this.start.bind(this))
    }
    drag(dx,dy) {
        this.draw(this.init.x + dx, this.init.y + dy);
    }
    start(x,y) {
        let offset = this.canvas.$w.offset()
        this.init = {x: x-offset.left, y: y-offset.top}
        this.draw(this.init.x, this.init.y)
    }
    draw(x,y) {
        let L1 = this.left.draw(x,y,"")
        let L2 = this.right.draw(x,y,"")
        let L1r = fixed(L1)
        let L2r = fixed(L2)
        let dL = fixed(Math.abs(L1r-L2r))
        this.delta.resize(80)
        let color=undefined;
        if (isConstructive(dL)) {color = constructive} else {color = destructive}
        this.delta.draw(x, y + 20*Math.sign(y-this.canvas.H/2), `∆L = ${dL}`, color)
        this.text.updatePathLength(L1,L2)
    }
}
//================================================================================
$(function() {
    let $root = $("#main")
    let canvas = new Canvas($root,400,400)
    let text = new Text($root, canvas)
    let rulers = new Rulers(canvas, text)
})
