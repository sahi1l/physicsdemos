/*global Snap*/
export class Arrow {
    constructor(paper,x1,y1,x2,y2,attrs={}) {
        let sc = 2; //scale of arrowhead
        this.color = attrs.color??"grey";
        this.width = attrs.width??3;
        this.class = attrs.class??"";
        this.obj = paper.group();
        this.headid = "head" + parseInt(1e6*Math.random());
        this.arrowhead=paper.polyline(0,-sc,2*sc,0,0,sc).attr({fill:this.color,class:this.class});
        this.arrowhead.marker(0,-sc,2*sc,2*sc,sc,0).attr({id:this.headid});
        this.line = paper.line(x1,y1,x2,y2)
            .attr({"stroke-width":this.width,
                   "stroke-linecap":"round",
                   "stroke": this.color,
                   "class": this.class
                  });
        this.obj.append(this.line);
        this.line.node.style['marker-end'] = Snap.url(this.headid);
        console.debug(this.line);
    }
    attr(args) {
        this.line.attr(args);
    }
    setColor(color) {
        this.line.node.style["stroke"]=color;
        this.arrowhead.node.style["fill"] = color;
    }
}
class AngledArrow {
    /*An arrow with a label and a dotted arc between angle (0-360) and horizontal or vertical*/
    constructor(paper,length,angle,vertical) {
        this.color = "grey";
        this.paper = paper;
        this.length = length;

        
        this.mask = paper.group();
        this.mask.rect = paper.polyline(0,0,0,0).attr({fill:"black"});
        this.mask.wedge = paper.polyline(0,0,0,0).attr({fill:"white"});
        this.mask.append(this.mask.rect);
        this.mask.append(this.mask.wedge);
        
        this.circle = paper.circle(0,0,0.8*length)
            .attr({"stroke-dasharray": "1,1",
                   "fill": "transparent",
                   "stroke": "grey",
                   "mask": this.mask
                  });
        this.vector = new Arrow(paper,0,0,0,0);
        this.label = paper.text(0,0,"?°")
            .attr({"font-size":parseInt(length/6), "text-anchor": "middle", "dominant-baseline":"middle"});

        
        if(angle!=undefined) {this.SetAngle(angle,vertical);}
        this.vector.setColor(this.color);
    }

    Components(xs,ys,angle,vertical) {
        let radians=angle*Math.PI/180.0;
        if(vertical){
            return {x:xs*Math.sin(radians),
                    y:ys*Math.cos(radians)};
        } else {
            return {x:xs*Math.cos(radians),
                    y:ys*Math.sin(radians)};
        }
    }
    
    SetAngle(xs,ys,angle,base){
        //base is the angle of the base, that the angle is measured from
        
        
        let XS = xs*this.length;
        let YS = -ys*this.length;
        let full = this.Components(XS, YS, angle, vertical);
        let half = this.Components(XS, YS, 0.5*angle, vertical);
        let zero = this.Components(XS, YS, 0, vertical);
        if(vertical) {
            base.attr({x1:0, y1: -this.length, x2: 0, y2: this.length});
        } else {
            base.attr({x1: -this.length, y1:0, x2: this.length, y2: 0});
        }
        this.vector.attr({x2: full.x, y2: full.y});
        this.label.attr({x: 0.6*half.x,
                         y: 0.6*half.y,
                         text: angle+"°"});
        let M = Math.max(Math.abs(full.x/full.y),Math.abs(full.y/full.x));
        let X = 20*M*full.x; let Y = 20*M*full.y;

        this.mask.rect.attr("points", [0,0,X,0,X,Y,0,Y].join(","));
        if(vertical) {
            this.mask.wedge.attr("points", [0,0,X,Y,0,Y,0,0].join(","));
        } else {
            this.mask.wedge.attr("points", [0,0,X,Y,X,0,0,0].join(","));
        }
    }
}
