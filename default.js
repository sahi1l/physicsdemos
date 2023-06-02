export function shuffle(A) {
    let R=[]
    while (A.length) {
        let n = randint(0,A.length);
        R.push(A[n]);
        A.splice(n,1);
    }
    return R;
}
export function randint(start,eww) {//a number start, start+1, ..., eww-1
    if (eww==undefined) {
        eww = start;
        start=0;
    }
    return Math.floor((eww-start)*Math.random())+start;
}
export function choose(items) {
    return items[randint(items.length)];
}


function init() {
    let span = $("<a>").attr("href","/");
    let h1 = $("h1").css({position:"relative"});
    span.html("🏠").css({position:"absolute", right:5,top:5});
    h1.append(span);
}
$(init)
