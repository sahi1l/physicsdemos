/*global $*/
import {Score} from "../lib/quiz.js";

function generator(canvas) {
    return {text: "This is a test of the quiz layout.",
            correct: "A",
            others: ["B","C","D"]
           };
}

function init() {
    new Score($("demo-quiz"), 10, generator, {multiple: 2, noauto: true});
}

$(init)