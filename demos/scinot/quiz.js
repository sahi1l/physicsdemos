import {shuffle, randint} from "/lib/default.js";
import {Button} from "/lib/buttons.js";
//================================================================================
function qgen() {
    return {"text": "What is 2+2?",
            "correct": 4,
            "others": [1,2,3,5]
           };
}
export default class Score {
    constructor($root, maxtries, questiongenerator) {//questiongenerator returns an object
        this.$w = $("<div>").appendTo($root).addClass("score");
        this.$q = $("<div>").appendTo($root);
        this.$reaction = $("<div>").appendTo($root).addClass("reaction");
        this.right = 0;
        this.total = 0;
        this.$score = $("<span>").addClass("numbers").appendTo(this.$w);
        this.$right = $("<span>").html("0").appendTo(this.$score);
        this.$score.append(" of ");
        this.$total = $("<span>").html("0").appendTo(this.$score);
        this.qgen = questiongenerator;
        this.newQuestion();
    }
    newQuestion() {
        this.$reaction.html("").removeClass("right").removeClass("wrong");
        let q = this.qgen();
        
        this.Q = new Question(this.$q, q.text, q.correct, q.others, this.register.bind(this));
    }
    update(){
        this.$right.html(this.right);
        this.$total.html(this.total);
    }
    register(correctQ) {//callback gets a new question
        this.total += 1;
        this.right += (correctQ+0);
        this.update();
        console.log("registering",correctQ);
        if(correctQ) {
            this.$reaction.html("Correct!").addClass("right");
        } else {
            this.$reaction.html("Wrong!").addClass("wrong");
        }
        setTimeout(this.newQuestion.bind(this), 1000);
    }
    clear() {
        this.tries = 0;
        this.points = 0;
        this.update();
    };
}
//================================================================================

class Question {
    constructor($root, text, correct, others, callback) {
        console.log("New question");
        $root.html("");
        this.$question = $("<div>").appendTo($root).addClass("question");
        this.$answers = $("<div>").appendTo($root).addClass("answers");
        this.text = text;
        this.$question.html(this.text);
        this.answers = [correct,...others]; //answers will be referred to by index in this list
        this.correct = correct;
        this.callback = callback; //what gets to know if it was right or not?
        this.buttons = {};
        for (let i = 0; i < this.answers.length; i++) {
            //Question: Can button take more than text?
            this.buttons[i] = new Button(this.answers[i], ((e,a=i)=>{this.response(a);}).bind(this));
        };
        this.render();
    }
    response(a) {
        this.callback(a==0);
    }
    render() {
        let shf = shuffle(Object.keys(this.answers));
        console.debug(shf);
        for (let a of shf) {
            this.$answers.append(this.buttons[a].$w);
        }
    }
}

/*function init(){
    let $correct = $("<span>").html("4");
    let $one = $("<span>").html("1");
    let s = new Score($("#main"), 10, qgen);
//    let q = new Question($("#main"),"What is 2+2?",$correct,[$one,2,3,5],s.register.bind(s));
}

$(init);
*/
