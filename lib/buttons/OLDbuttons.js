export default class Buttonset {
    constructor(styles, toggle) {
        //style, hover, and active are dictionaries of style
        let name = "mybutton";
        let css = {display: "inline",
                   padding: "0.25em 0.5em",
                   cursor: "pointer",
                  };
        let head = $("<style>");
        $("head").append(head);
        head.append(`.${name} {${css}}`);
        for (let [k,v] of Object.elements(styles)){
            head.append(processStyle(v, "."+name+(k=="style"?"":":"+k)));
        }
        console.log(this.processStyle(undefined));
        this.$w = $("<div>").addClass(name).html(text);
        this.command = command;
        this.$w.on("click", command);
    }
    processStyle(dic,cls) { //cls is the class name with :hover or :active
        if (dic == undefined) {
            return "";
        }
        let result = [];
        let abbrevs = {fsize: "font-size",
                   bg: "background",
                   fg: "foreground"};
        for (let [k,v] of Object.entries(dic)) {
            let key = abbrevs[k]??k;
            result.push(`${key}:${v}`);
        }
        return cls + "{" + result.join(";") + "}";
    };
    changeText(text) {
        this.$w.html(text);
    }
}
