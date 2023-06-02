import Score from "/lib/quiz.js";
import {randint} from "/lib/default.js";


function generator() {
    return {text: "",
            correct: "",
            others: []
           };
}

function init() {
    new Score($("#main"), 10, generator, {multiple: 2, noauto: true});
}

$(init)
