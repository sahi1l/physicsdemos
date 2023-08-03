class Wave {
    constructor(paper,x0,y0,L){
        this.paper = paper;
        this.x0 = x0;
        this.y0 = y0;
        this.L = L;
        this.wave = paper.path("");
        let wallheight = 10;
        let wallattr = {"stroke-width":3};
        this.Lwall = this.paper.path(`M${x0},${y0-wallheight/2}l0,${wallheight}`).attr(wallattr);
        this.Rwall = this.paper.path(`M${x0+L},${y0-wallheight/2}l0,${wallheight}`).attr(wallattr);
        
    }
    antinode(x1,w,y1,A){
        //x1/x2 are the two endpoints
        //y1 is the base
        //A is the amplitude
        let c = x1+w/2.0;
        let yp = y1+4*A/3.0;
        return `M${x1},${y1}C${c},${yp},${c},${yp},${x1+w},${y1}`;
    }

    make(n,A,T){
        //L is the distance between the walls
        //n is the order
        //T is the period of oscillation
        this.wave.stop();
//        this.wave = this.paper.path("");
        let w = this.L/n;
        let uppath = "";
        let dnpath = "";
        for (let i=0; i<n; i++){
            uppath+=this.antinode(this.x0+i*w, w, this.y0, +(i%2?A:-A));
            dnpath+=this.antinode(this.x0+i*w, w, this.y0, -(i%2?A:-A));
        }
        this.wave.attr({path:uppath});
        let upanim,dnanim;
        dnanim = Raphael.animation({path:dnpath},T/2,"<>",
                                   ()=>{this.wave.animate(upanim);});
        upanim = Raphael.animation({path:uppath},T/2,"<>",
                                   ()=>{this.wave.animate(dnanim);});
        this.wave.animate(dnanim);
    }
}

function init(){
    let paper = Raphael("canvas",400,400);
    let wave = new Wave(paper,50,200,300);
    wave.make(8,50,2000);
    $("#order").on("input",()=>wave.make(+$("#order").val(),50,2000));
}
$(init);
