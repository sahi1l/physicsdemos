import Button from "/lib/buttons.js";
function shuffle(A) {
    let R=[]
    while (A.length) {
        let n = randint(0,A.length);
        R.push(A[n]);
        A.splice(n,1);
    }
    return R;
}
function randint(start,eww) {//a number start, start+1, ..., eww-1
    return Math.floor((eww-start)*Math.random())+start;
}
//================================================================================
function qgen(canvas) {
    return {"text": "What is 2+2?", //this can be a JQuery object
            "correct": 4,
            "others": [1,2,3,5]
           };
}
export class Canvas {
    constructor($root,W,H) {
        this.W = W??300;
        this.H = H??300;
        this.$w = $("<div>"); //.attr({width:this.W, height:this.H});
        if ($root) {
            this.$w.appendTo($root);
            this.$root = $root;
        }
        this.paper = Raphael(this.$w[0],this.W,this.H);
    }
}
export class Score {
    constructor($root, maxtries, questiongenerator, settings) {//questiongenerator returns an object
        this.settings = settings;
        //multiple: n, allow n tries before getting the right answer
        //noauto, do not automatically go to the next question, but add an advance button
        this.$w = $("<div>").appendTo($root).addClass("score");
        this.$q = $("<div>").appendTo($root);
        this.$reaction = $("<div>").appendTo($root).addClass("reaction");
        this.right = 0;
        this.total = 0;
        this.errors = 0;
        this.complete = false; //true when correct or when you run out of
        this.maxtries = maxtries;
        this.$left = $("<span>").css({float:"left", padding:"0 5"}).appendTo(this.$w);
        this.$right = $("<span>").css({float:"right",padding:"0 5"}).appendTo(this.$w);
        
        this.$score = $("<span>").addClass("numbers").appendTo(this.$w);
        this.$correct = $("<span>").html("0").addClass("scoreheader").addClass("right");
        this.$total = $("<span>").html("0").addClass("scoreheader");
        this.$errors = $("<span>").html("0").addClass("scoreheader").addClass("wrong");
        if (maxtries) {
            this.$left.append(this.$total," of ",maxtries);
        } else {
            this.$left.append("Try ",this.$total);
        }
        this.$right.append(this.$correct, this.$errors);
        this.qgen = questiongenerator;
        this.$paper = undefined;
        this.paper = undefined;
        if (this.settings.canvas) {
            this.canvas = new Canvas(undefined, 300, 300);
        }
        //NEW: IF settings.canvas, then create a new canvas and pass to generator
        this.newQuestion();
    }
    newQuestion() {
        this.total += 1;
        this.complete = false;
        this.$total.html(this.total);
        this.$reaction.html("").removeClass("right").removeClass("wrong");

        let q = this.qgen(this.canvas); //passing the canvas and the widget to qgen.
        console.log(q);
        this.Q = new Question(this.$q, q.text, q.correct, q.others, this.register.bind(this),{sort:this.settings.sort});
        this.guessesLeft = this.settings.multiple??1;
    }
    update(){
        this.$correct.html(this.right);
        this.$errors.html(this.errors);
    }
    register(correctQ) {
        let delay = 1000;
        if (this.complete) {return;}

        //Update the counts
        this.right += (correctQ+0);
        this.errors += (1-correctQ);
        this.update();
        
        //Add text to the bottom
        if(correctQ) {
            this.$reaction.html("Correct!").addClass("right");
            this.complete = true
        } else {
//            this.$reaction.html("No, sorry.").addClass("wrong");
        }

        this.guessesLeft--;
        console.log(correctQ,this.guessesLeft);

        //if we are done
        if (this.guessesLeft==0 || correctQ){
            this.complete = true;
            $(".mybutton").addClass("disabled");
            this.Q.buttons[0].$w.addClass("right");
            

            
            //Adds a Try Another button
            //FIX: If this.total = this.maxtries, then put a different message?
            if (this.settings.noauto) {
                let aButton = new Button("Try Another?",this.newQuestion.bind(this));
                aButton.$w.addClass("tryanother");
                this.$reaction.append(aButton.$w);
            } else {
                setTimeout(this.newQuestion.bind(this), (correctQ)?delay:3*delay);
            }
            
        }

    }
    clear() {
        this.tries = 0;
        this.points = 0;
        this.update();
    };
}
//================================================================================

class Question {
    constructor($q, text, correct, others, callback, prams) {
        $q.html("");
        this.text = text;
        this.$question = $("<div>").appendTo($q).addClass("question");
        this.$answers = $("<div>").appendTo($q).addClass("answers");
        
        this.$question.append(this.text);
        this.answers = [correct,...others]; //answers will be referred to by index in this list
        this.correct = correct;
        this.callback = callback; //what gets to know if it was right or not?
        this.buttons = {};
        this.prams = prams;
        for (let i = 0; i < this.answers.length; i++) {
            //Question: Can button take more than text?
            this.buttons[i] = new Button(this.answers[i], ((e,a=i)=>{this.response(a);}).bind(this));
        };
        this.render();
    }
    response(a) {
        this.callback(a==0);
        if (a==0) {
            this.buttons[a].$w.addClass("right");
        } else {
            this.buttons[a].$w.addClass("wrong");
        }
    }
    render() {
        console.debug(this.answers,this.buttons);
        let shf = Object.keys(this.answers);
        if (this.prams.sort.startsWith("n")){
            shf = shf.sort((a,b)=>{return parseFloat(this.answers[a])-parseFloat(this.answers[b]);});
        } else if (this.prams.sort.startsWith("a")){
            shf = shf.sort((a,b)=>{return a>b ? 1 : (a<b ? -1 : 0)});
        } else {
            shf = shuffle(shf);
        }
        console.debug(this.answers,shf);
        for (let a of shf) {
            this.$answers.append(this.buttons[a].$w);
        }
    }
}

