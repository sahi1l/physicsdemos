function setlabels() {
    let paper = Raphael("labels","100%","100%");

    let lineattr = {"stroke-width":5};
    let xclick = $("#x").offset();
    paper.path(`M${xclick.left},0l0,40`).attr({...lineattr,stroke:"red","arrow-start":"classic"});
    let yclick = $("#y").offset();
    paper.path(`M${yclick.left},0l0,40`).attr({...lineattr,stroke:"red","arrow-start":"classic"});
}
$(()=>setTimeout(setlabels,100));
