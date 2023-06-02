function getWidth($w){
    let width = $w.width()
    let mleft = parseFloat($w.css("margin-left"))
    let mright = parseFloat($w.css("margin-right"))
    return width+mleft+mright
    }
class Sidescroller {
    constructor($widget, panelclass=".panel") {
        this.margin = 5
        this.panels = $widget.children(panelclass)
        this.N = this.panels.length
        this.lefts = [0]
        this.buttons = []
        let last = 0
        let i = 0
        for (let p of this.panels){
            last += getWidth($(p))
            this.lefts.push(last)
            let title = $(p).children("h1").html()
            let $button = $(`<div class="button">${title}</div>`)
            $button.on("click",{main: this, n:i},(e)=>{e.data.main.scrollTo(e.data.n)})
            $("#buttons").append($button)
            this.buttons.push($button)
            i+= 1
        }
        this.totalWidth = this.lefts[this.lefts.length-1]
        $widget.css({width:this.totalWidth})
        $("#background").css({height:this.totalWidth})
    }
    scrollPct=function(p) {
        let scroll = p;
        if (p<1) {
            scroll = p*this.totalWidth;
        }
        
        this.panels.css({"left":-scroll})
    }
    scrollTo=function(n) {
        console.log(n,this.lefts[n])
        $("html,body").animate({"scrollTop":Math.round(this.lefts[n])},500)
    }
}
    
function init(){
    let sidescroller = new Sidescroller($("#sidescroller"))
    $(window).scroll(
        function(e){
            sidescroller.scrollPct($(window).scrollTop())
    });
}
$('head').append('<link rel="stylesheet" type="text/css" href="sidescroll.css">');
$(init)
