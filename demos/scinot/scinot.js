import Score from "/lib/quiz.js";
import {randint,choose} from "/lib/default.js";
function round(number) {
    if (number>=10) {return number.toFixed(0);}
    return number.toPrecision(2);
}
let units = ["m","N","J","C","W"];
let prefixes = {0: "",
                3: "m",
                6: "µ",
                9: "n",
                12: "p",
               };
class Number {
    constructor(a,b,t,unit){
        //a.b e-t
        this.a = a??randint(1,10);
        this.b = b??randint(10);
        this.t = t??randint(1,11);
        this.unit = unit??(choose(units));
        this.value = parseFloat(`${this.a}.${this.b}e-${this.t}`);
        this.val = {decimal: this.decimal(),
                    metric: this.metric(),
                    scientific: this.scientific()
                   };
        
    }
    metric() {
        let engineering = Math.floor(this.t/3.0 + Math.random())*3;
        let multiplier = Math.pow(10,engineering);
//        console.debug("engineering:", this.t,engineering,premultiplier,this.value*multiplier);
        return round(this.value * multiplier) + " " + prefixes[engineering] + this.unit;
    }
    decimal() {
        let val = "0.";
        for(let i=1; i<this.t; i++){
            val += "0";
            if (!(i%3)) {val +=" ";}
        }
        val += `${this.a}${this.b} ${this.unit}`;
        return val;
    }
    scientific() {
        return `${this.a}.${this.b}×10<sup>-${this.t}</sup> ${this.unit}`;
    }
    
}

function generator() {
    let number = new Number();
    let functions = ["decimal", "scientific", "metric"];
    let Q;
    let A;
    while (true) {
        Q = choose(functions);
        A = choose(functions);
        if (Q!=A && A!="decimal") {break;}
    }
    let question = number.val[Q];


    let answers = [number.t];
    let others = [];
    while (answers.length<6) {
        let another = randint(1,11);
        if (!answers.includes(another)) {
            answers.push(another);
            let nnumber = new Number(number.a, number.b, another, number.unit);
            console.debug(nnumber);
            others.push(nnumber.val[A]);
        }
    }

    return {text: question,
            correct: number.val[A],
            others: others};
}

class Slideshow {
    constructor($w) {//$w should be a div of img tags
        this.imgs = $w.children("img");
        this.imgdiv = $("<div>").appendTo($w).css("height",400);
        this.imgs.appendTo(this.imgdiv);
        this.prev = $("<div>")
            .addClass("arrow header")
            .css("left",0)
            .html("☜")
            .on("click",(e)=>{this.advance(-1);})
            .appendTo($w);
        this.title = $("<h2>")
            .addClass("header title")
            .html("Help &#x25BD;")
            .appendTo($w)
            .on("click",this.toggle.bind(this));
        this.next = $("<div>")
            .addClass("arrow header")
            .css("right",0)
            .html("☞")
            .on("click",(e)=>{this.advance(1);})
            .appendTo($w);
        this.current = 0;
        this.N = this.imgs.length;
        this.show();
        this.visible = true; this.toggle();
    }
    toggle(){
        this.visible = !this.visible;
        this.imgdiv.animate({
            height: ["toggle", "swing"],
            opacity: "toggle",
        }, 400);
//        if(this.visible) {
//            this.imgs.animate({opacity:1,height:toggle},400);
//        } else {
//            this.imgdiv.animate({opacity:0,height:toggle},400);
//            }

    }
    show(n) {
        if (n==undefined) {n=this.current;} else {this.current=n;}
        this.imgs.hide();
        $(this.imgs[n]).show();
    }
    advance(dn) {
        this.current = (this.current + dn + this.N)%this.N;
        this.show();
    }
    
}
function init(){
    new Score($("#main"), 10, generator, {multiple:2, noauto: true});
    new Slideshow($("#help"));
}

$(init)
