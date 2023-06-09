let imgfolder = "../lib/img"
export function shuffle(A,tracker) {
    let R=[]
    while (A.length) {
        let n = randint(0,A.length);
        R.push(A[n]);
        A.splice(n,1);
    }
    return R;
}
export function randint(start,eww) {//a number start, start+1, ..., eww-1
    if (eww==undefined) {
        eww = start;
        start=0;
    }
    return Math.floor((eww-start)*Math.random())+start;
}
let choosetracker = {};
function choose1(items,tracker) {
    //Can I make the chooser tend to avoid recent uses?
    if (tracker) {
        let id = tracker.id;
        let N = tracker.N??2;
        if (!choosetracker[id]){
            choosetracker[id]={};
            for (let a of items){
                choosetracker[id][a] = N;
            }
        } else {
            let flag = false;
            for (let a of items) {
                if (choosetracker[id][a] == 0){
                    flag = true;
                    break;
                }
            }
            if (flag) {
                for (let a of items){
                    choosetracker[id][a] += N;
                }
            }
        }
        items = [];
        for (let a of Object.keys(choosetracker[id])){
            for (let i=0; i<choosetracker[id][a]; i++){
                items.push(a);
            }
        }
        console.debug(choosetracker[id]);
        let choice = items[randint(items.length)];
        choosetracker[id][choice]--;
        return choice;
    }
    return items[randint(items.length)];
}
export function choose(items,tracker){
    let previous = [];
    let id=null; let N=0;
    if (tracker) {
        id = tracker.id;
        N = tracker.N??2;
        if (!choosetracker[id]) {choosetracker[id]=[];}
        previous = choosetracker[id];
    }
    let choice;
    while (true) {
        choice = items[randint(items.length)];
        let count = previous.filter(x => x===choice).length;
        if (count==0) {break;}
        if (Math.random(1)*(count+1) < 1) {break;}
    }
    if (tracker) {
        choosetracker[id] = [choice,...choosetracker[id]].slice(0,N);
        console.debug(choosetracker[id]);
    }
    return choice;
        
}
export class Slideshow {
    constructor($w) {
        this.$w = $w;
        this.imgs = $w.children("img");
        this.imgdiv = $("<div>").appendTo($w)
            .css({"height":400,
                  "text-align":"center"
                 }); //this will contain the images
        this.imgs.appendTo(this.imgdiv); //move the images inside imgdiv
        this.makeHeader();
        this.current = 0;
        this.N = this.imgs.length;
        this.show(0);
    }
    makeHeader() {
        let $header = $("<nav>").prependTo(this.$w);
        this.prev = $("<div>")
            .addClass("arrow header")
            .css("left",0)
            .html("<")
            .on("click",(e)=>{this.advance(-1);})
            .appendTo($header);
        this.title = $("<h2>")
            .addClass("header title")
            .html(`Help`)
            .appendTo($header);
        this.next = $("<div>")
            .addClass("arrow header")
            .css("right",0)
            .html(">")
            .on("click",(e)=>{this.advance(1);})
            .appendTo($header);
    }
    toggle(){
        this.visible = !this.visible;
        this.imgdiv.animate({
            height: ["toggle", "swing"],
            opacity: "toggle",
        }, 400);
        console.debug(this.visible);

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


function init() {
    let h1 = $("<h1>").html($("header").html());
    $("header").css({position:"relative"}).html(h1);
    let $buttons = $("<span>").css({position:"absolute", right:5,top:5}).appendTo(h1);
    console.debug(h1,$buttons);
    let $help = $("#help");
    if ($help.length) {
        $("<a>").attr("name","help").insertBefore($help);
        $help.hide();
        let $helpbtn = $("<img>")
            .attr({src:imgfolder+"/help.png"})
            .appendTo($buttons);
        $helpbtn.on("click",()=>{
            $help.show();
            $help[0].scrollIntoView({behavior: "smooth"});});
        if ($("#help.slideshow").length) {
            new Slideshow($help);
        }
    }
//    let root = "/";
//    console.debug(document.currentScript);
//    if (document.currentScript) {
//        root = document.currentScript.getAttribute('root')??"/";
//    }
    let root = "..";
    let $homeimg = $("<img>")
        .attr("src",imgfolder+"/home.png");
    let $home = $("<a>")
        .attr("href", root)
        .appendTo($buttons)
        .append($homeimg);

}
$(init)
