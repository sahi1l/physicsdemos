import Score from "/lib/quiz.js";
import {randint} from "/lib/default.js";
let CANVAS = {};
function setupCanvas() {
    CANVAS.$w = $("<div>");
    CANVAS.paper = Raphael(CANVAS.$w[0], 300, 300);
}


function generator() {
    return {text: "",
            correct: "",
            others: []
           };
}

function init() {
    //setupCanvas();
    new Score($("#main"), 10, generator, {multiple: 2, noauto: true});
}

$(init)
