let panels = {math: "Mathematics",
              mechanics: "Mechanics",
              optics: "Optics",
              waves: "Waves",
              misc: "Miscellaneous Topics"
}

class Card {
    constructor(){
        this.panel = ""
        this.type = ""
        this.title = ""
        this.link = ""
        this.img = ""
        this.description = []
    }
    ready(){
        return (this.panel && this.title && this.link)
    }
    html(){
        let html = `<a href="demos/${this.link}/"><div class="card ${this.type.toLowerCase()}">\n`
        html += `<h2>${this.title}</h2>\n`
        html += `<img src="img/${this.img}">\n`
        html += `<p>${this.description.join("\n<BR>")}</p>\n`
        html += "</div></a>"
        return html
    }
    addDesc(txt) {
        this.description.push(txt)
    }
}
function init(){
    let data = undefined
    let $root = $("body")
    for (let p in panels){
        let $panel = $("<div>").addClass("panel").attr({id:p}).appendTo($root)
        let $title = $("<h1>").html(panels[p]).appendTo($panel)
        let $cards = $("<div>").addClass("cards").appendTo($panel)
//        $("body").append(`<div class="panel" id="${p}"><h1>${panels[p]}</h1><div class="cards"></div></div>`)
    }
    $.ajax(
        {url: 'listing.txt',
         async: false,
         cache: false,
         dataType: "text",
         success: function(dat) {
             data = dat.split("\n")
         }
    });
    let card = new Card()
    for (let line of data){
        line=line.trim()
        console.debug(card)
        if (line==""){
            if (card.ready()){
                $(`.panel#${card.panel} .cards`).append(card.html())
                card = new Card()
            }
        }
        else if (line.startsWith(":")) {
            line = line.split(":")
            card.panel = line[1]
            card.type = line[2]
            card.link = line[3]
        } else if (line.startsWith("IMG:")) {
            card.img = line.replace(/^IMG:/,"")
        } else if (card.title==""){
            card.title = line
        } else {
            card.addDesc(line)
        }
    }
}
$(init)
