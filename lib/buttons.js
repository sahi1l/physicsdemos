let name = "mybutton";
let init = function(){
    let head = $(`<style>`);
    head.append(`\n.${name} {`);
    head.append("\ndisplay: inline-block;");
    head.append("\ntext-align: center;");
    head.append("\npadding: 0.25em 0.5em;");
    head.append("\ncursor: pointer;");
    head.append("\nmargin: 0px 2px;");
    head.append("\n}");
    $("head").append(head);
}
$(init);
export default class Button {
    constructor(text,command,toggleQ) {
        //text can either be a string, or a list of two strings for a toggle button. The first is the default
        //command is called when the button is pressed.
        //- It should receive the click event for a normal button
        //- It should receive the state of the button and the event for a toggle
        //if toggleQ is undefined, then this.toggleQ is false.
        //if it is true or false, then the button's state defaults to that.
        let name = "mybutton";
        this.text = text;
        let txt = this.text;
        if (typeof(txt)=="object") {txt = txt[0];}
        this.$w = $("<div>").addClass(name).html(txt);
        this.onQ = !(toggleQ??false);
        this.toggleQ = (toggleQ!==undefined);
        this.toggle = this.toggle.bind(this);
        let cmd = (this.toggleQ) ? this.toggle : (command);
        this.command = command;
        this.$w.on("click", cmd);

        //This bit resizes the button to fit both texts
        if (this.toggleQ){
            let tests = [];
            for (let i of [0,1]) {
                tests[i] = $("<div>").addClass(name).html(text[i]).hide();
                tests[i].appendTo("body");
            }
            setTimeout(((a=tests[0],b=tests[1])=>{this.resize(a,b)}).bind(this),1);
            this.toggle();
        }
    }
    resize(A,B) {
        while (A.width()==0){;}
        let a = A.width();
        let b = B.width();
        this.$w.css({width:Math.ceil(Math.max(a,b))+2});
        A.remove(); B.remove();
        
    }
    toggle(e) {
        this.onQ = !this.onQ;
        
        this.$w.toggleClass("onQ",this.onQ);
        this.$w.toggleClass("offQ",!this.onQ);
        let txt = ([...this.text,...this.text])[this.onQ+0];
        this.changeText(txt);
        if (this.command) {
            this.command(this.onQ,e);
        }
    }
    changeText(text) {
        this.$w.html(text);
    }
}
export {Button};
