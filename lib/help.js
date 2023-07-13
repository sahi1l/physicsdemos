export function linepath(x0,y0,x1,y1,relative=false) {
    if (relative) {
        return `M${x0},${y0}l${x1},${y1}`;
    } else {
        return `M${x0},${y0}L${x1},${y1}`;
    }
}
export class HelpTour {
    constructor(paper,fsize=14,sw=3) {
        this.font = {"font-size":fsize,"font-family":"Times-Italic"};
        this.arrow = {2:{"arrow-start":"classic","arrow-end":"classic","stroke-width":sw},
                      1:{"arrow-end":"classic","stroke-width":sw}};
        this.paper = paper;
        this.collection = paper.set();
        this.hidden = false;
    }
    add(obj){
        this.collection.push(obj);
    }
    /*
    animate(obj,path) {
        let at = 900+100*Math.random();
        let ad = 10;
        let anim = Raphael.animation(
            {path:path(ad)},at,"<>",
            () => {obj.animate(
                {path:path(-ad)},at,"<>",
                ()=>{obj.animate(
                    {path:path(0)},at,"<>",
                    anim);}
            );}
        );
        obj.animate(anim);

        }
    */
    addHArrow(y,x0,x1,color,heads=2){
        let coords = [x0,y,x1,y];
        let path = function(dx) {
            let co = [...coords];
            //            co[0] += dx; co[2] += dx;
            if(dx=="zero") {co[0] = co[2] = (co[0]+co[2])/2;}
            return linepath(...co);
        };
        let arrow = this.paper.path(path("zero")).attr({...this.arrow[heads],stroke:color});
        arrow.animate({path:path(0)},1500,"<>");
//        this.animate(arrow,path);
        this.add(arrow);
    }
        
    addVArrow(x,y0,y1,color,heads=2){
        let coords = [x,y0,x,y1];
        let path = function(dy) {
            let co = [...coords];
            //          co[1] += dy; co[3] += dy;
            if(dy=="zero") {co[1] = co[3] = (co[1]+co[3])/2;}
            return linepath(...co);
        };
        
        let arrow = this.paper.path(path("zero")).attr({...this.arrow[heads],stroke:color});
        arrow.animate({path:path(0)},1500,"<>");
        this.add(arrow);
    }
    
    addText(x,y,text,color="black",align="start",rotate=0) {
        let txt = this.paper.text(x,y,text).attr({...this.font,"text-anchor":align,fill:color});
        txt.node.style.fontStyle = 'italic';
        if (rotate) {
            txt.rotate(rotate,x,y);
        }
        this.collection.push(txt);
        return txt;
    }
    hide(){
        if (!this.hidden){
            this.hidden=true;
            this.collection.animate({opacity:0},2000);
            setTimeout((c=this.collection)=>c.remove(),2000);
        }
    }
}

