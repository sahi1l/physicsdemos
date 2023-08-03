function randint(start,eww) {//a number start, start+1, ..., eww-1
    if (eww==undefined) {
        eww = start;
        start=0;
    }
    return Math.floor((eww-start)*Math.random())+start;
}
class Number {
    constructor(digits, ten) {
        //digits is a string of digits not starting or ending with zero, might contain a decimal point
        //ten is the exponent of the number.  So d.igits * 10^ten
        this.isNumberObj = true;
        this.value = parseFloat(digits) * Math.pow(10,parseInt(ten));
        if (!digits.includes(".")) {
            digits = digits+".";
        }
        
        let split = digits.split(".");
        let a = split[0].length;
        ten = parseInt(ten) + (a-1);
        this.digits = digits.replace(/^0+/,"").replace(/0+$/,"").replace(".","")
        this.exponent = ten;
    }
    pointed(n) { //return digits with the decimal point in the right place. number of places to shift to the right it from the beginning
        let L = this.digits.length;
        if (n>L) { //e.g. digits = 123, n=4, want 1230
            return this.digits + ("0").repeat(n-L) + ".";
        } else if (n>0) { //e.g. digits = 123, n=2, want 12.3
            return this.digits.slice(0,n) + "." + this.digits.slice(n);
        } else { //e.g. digits = 123, n=-3, want 0.000123
            return ("0." + ("0").repeat(-n) + this.digits);
        }
    }
    shifted(n) {//number of decimal points to shift to the right of standard
        return [this.pointed(n+1), this.exponent-n]
    }
    withExp(t) {
        return this.shifted(this.exponent-t);
    }
};

class Display {
    //FIX: DO THIS IN RAPHAEL, THIS ISN'T WORKING RIGHT
    constructor($root){
        this.$mantissa = $("<span>").addClass("mantissa").appendTo($root).html("0");
        this.$times = $("<span>").addClass("times").html("⨉").attr({"text-align":"center"}).appendTo($root);
        this.$ten = $("<span>").html("10").addClass("exponent").appendTo($root);
        this.$exponent = $("<sup>").appendTo(this.$ten).html("0");
    }
    setNumber(digits,ten){
        if (digits.isNumberObj) {
            this.number = digits;
        } else {
            if (typeof(digits)=="object") {
                digits = randint(digits[0],digits[1]);
            }
            if (typeof(ten)=="object") {
                ten = randint(ten[0],ten[1]);
            } else if (ten==undefined) {ten=0;}
            this.number = new Number(digits,ten);
        }
        this.display(0);
        return this;
    }
    display(n) {
        let N = this.number.shifted(n);
        this.$mantissa.html(N[0]);
        this.$exponent.html(N[1]);
    }
};

function init(){
    display = new Display($("#main"));
}
$(init)
