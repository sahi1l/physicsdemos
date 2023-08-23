/*global $ , Raphael*/
import { listing } from "./listing.js";
let panels = {math: "Mathematics",
              mechanics: "Mechanics",
              optics: "Optics",
              waves: "Waves",
              misc: "Miscellaneous Topics"
             };
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}
class Card {
    constructor(){
        this.panel = "";
        this.type = "";
        this.title = "";
        this.link = "";
        this.img = "";
        this.description = [];
    }
    ready(){
        return (this.panel && this.title && this.link);
    }
    html(){
        
        let html = `<a href="${this.link}/"><div class="card ${this.type.toLowerCase()}">\n`;
        html += `<h2  title=${this.type}>${this.title}</h2>\n`;
        html += `<img src="lib/main/img/${this.img}">\n`;
        if (typeof this.description === "string") {
            html += `<p>${this.description}</p>\n`;
        } else {
            html += `<p>${this.description.join("\n<BR>")}</p>\n`;
        }
        if (this.topics) {
            let txt = this.topics.map((x)=>"<span>"+toTitleCase(x)+"</span>").join(" ");
            html += `<div class="topics">${txt}</div>`;
        }
        html += "</div></a>";
        return html;
    }
    addDesc(txt) {
        this.description.push(txt);
    }
    publish(){
        $(`.panel#${this.panel} .cards`).append(this.html());
    }
}
function toggleCategory(w) {
    let category = w.getAttribute("data-cat");
    let showQ = $(w).hasClass("disabled"); //this will toggle it
    $(w).toggleClass("disabled",!showQ);
    $(`.card.${category}`).toggle(showQ);
}
function init(){
    let data = undefined;
    let $root = $("body");
    for (let p in panels){
        let $panel = $("<div>").addClass("panel").attr({id:p}).appendTo($root);
        let $title = $("<h1>").html(panels[p]).appendTo($panel);
        let $cards = $("<div>").addClass("cards").appendTo($panel);
    }
    for (let portion of listing) {
        let card = new Card();
        for (let key of Object.keys(portion)){
            card[key] = portion[key];
        }
        card.publish();
    }
    $("#title .icon").each((i,w) => {
        $(w).on("click",(e)=>toggleCategory(w));
        $(w).attr("title","Click to hide/show this category");
    });


};
$(init);
