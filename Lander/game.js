let canvas;
let context;
let handle;
let gravity=0.0025;
let scale=800;
let xmax,ymax;
let showingHelp = 1;
let wins=[false,false];
let target =
    {
        width: 70,
        height: 10,
        color: "yellow",
        maxspeed: 0.5,
        shift: 0,
        win:false,
        mode:0 //0 for no gravity, 1 for gravity
    };
let dots=[];
let dotcount=0;
let spaceship = {
    color: "grey",
    width: 24,
    height: 36,
    position: {x: 50,y: 60},
    velocity: {x: 0, y: 0},
    angle: 0,
    thrust:2*gravity,
    engineOn: false,
    rotatingLeft: false,
    rotatingRight: false,
};

function drawSpaceship() {
    context.save();
    if(wins[0] && wins[1]){
        context.save();
        context.beginPath();
        context.translate(xmax/2,ymax/2);
        context.fillStyle="yellow";
        context.font="96px sans";
        context.textAlign="center";
        context.fillText("Complete!",0,0);
        context.closePath();
        context.restore();
    }
    //target
    context.beginPath();
    context.translate(0,0);
    context.rect(target.shift-target.width*0.5,
                 ymax-target.height,
                 target.width,
                 target.height);
    context.fillStyle=target.color;
    context.fill();
    context.closePath();
    //dots
    let Ndots=50;
    for(let i=0;i<Ndots;i++){
        let D=dots[i];
        if(D==undefined){break;}
        context.beginPath();
        context.globalAlpha=1-i/(Ndots+0.0);
        context.arc(D.x,D.y,2,0,2*Math.PI);
        context.fillStyle="blue";
        context.fill();
        context.closePath();
    }

    context.beginPath();
    context.globalAlpha=1.0;
    context.translate(spaceship.position.x,spaceship.position.y);
    context.fillStyle="white";
    context.font="16px sans";
    context.textAlign="center";
    if(target.win){
        context.fillText("Success!",0,-20);
        cancelAnimationFrame(handle);
        target.win=false;
        $("#G"+target.mode).addClass("buttondone");
    } else {
        context.fillText($("#vx").html()+" , "+$("#vy").html(),0,-40);
        context.fillStyle="orange";
        context.fillText($("#ax").html()+" , "+$("#ay").html(),0,-20);
    }
    context.closePath();
    
    context.beginPath();
    context.rotate(spaceship.angle);
    let img=document.getElementById("ship");
    context.drawImage(img,-spaceship.width/2, -spaceship.height/2, spaceship.width, spaceship.height);
    context.fillStyle = spaceship.color;
    context.fill();
    context.closePath();

    // Draw the flame if engine is on
    if(spaceship.engineOn)
    {
        context.beginPath();
        context.moveTo(spaceship.width * -0.2, spaceship.height * 0.45);
        context.lineTo(spaceship.width * 0.2, spaceship.height * 0.45);
        context.lineTo(0, spaceship.height * 0.45 + Math.random() * 30);
        context.lineTo(spaceship.width * -0.2, spaceship.height * 0.45);
        context.closePath();
        context.fillStyle = "orange";
        context.fill();
    }
    context.restore();
}
function updateSpaceship()
{
    if((dotcount++)%20==0){dots.unshift({x:spaceship.position.x, y:spaceship.position.y});}
    spaceship.position.x+=spaceship.velocity.x;
    spaceship.position.y+=spaceship.velocity.y;
    let bounciness=1.0;
    let padding=spaceship.width/2;
    let X=spaceship.position.x;
    let Y=spaceship.position.y;
    let collide=0;
    if(Y>ymax-target.height-padding){
        if(Math.abs(X-target.shift)<target.width/2){
            if(Math.hypot(spaceship.velocity.x,spaceship.velocity.y)<target.maxspeed){
                collide=2;
                wins[target.mode]=true;
                target.win=true;
                spaceship.velocity.x=0;
                spaceship.velocity.y=0;
                spaceship.angle=0;
            } else {
                spaceship.velocity.y=-Math.abs(spaceship.velocity.y);
                collide=1;
            }
        }
    }
    target.color=["yellow","red","green"][collide];
    if(spaceship.position.x<padding && spaceship.velocity.x<0){
        spaceship.velocity.x*=-bounciness;
    }
    if(spaceship.position.y<padding && spaceship.velocity.y<0){
        spaceship.velocity.y*=-bounciness;
    }
    if(spaceship.position.x>xmax-padding && spaceship.velocity.x>0){
        spaceship.velocity.x*=-bounciness;
    }
    if(spaceship.position.y>ymax-padding && spaceship.velocity.y>0){
        console.log(Math.hypot(spaceship.velocity.x,spaceship.velocity.y));
        spaceship.velocity.y*=-bounciness;
    }
    
    if(spaceship.rotatingRight){spaceship.angle += 2*Math.PI / 180;}
    else if(spaceship.rotatingLeft){spaceship.angle -= 2*Math.PI / 180;}
    let acceleration={x:0,y:gravity*target.mode};
    if(spaceship.engineOn)
    {
        acceleration.x=spaceship.thrust*Math.sin(spaceship.angle);
        acceleration.y-=spaceship.thrust*Math.cos(spaceship.angle);
    }
    spaceship.velocity.x+=acceleration.x;
    spaceship.velocity.y+=acceleration.y;
    $("#vx").html(formV(spaceship.velocity.x));
    $("#vy").html(formV(spaceship.velocity.y));
    let vmag=Math.hypot(spaceship.velocity.x,spaceship.velocity.y);
    $("#vmag").html(formV(vmag));
    if(vmag<target.maxspeed){
        $("#vmag").addClass("slowenough");
    } else {
        $("#vmag").removeClass("slowenough");
    }
    
    $("#ax").html(formA(acceleration.x));
    $("#ay").html(formA(acceleration.y));
    $("#amag").html(formA(Math.hypot(acceleration.x,acceleration.y)));
}
function formV(val){
    let sign=" ";
    if(val<0){sign="";}
    return sign+((0.001*scale*val).toFixed(1));
}
function formA(val){
    let sign=" ";
    if(val<0){sign="";}
    return sign+((scale*val).toFixed(1));
}
function draw()
{
    // Clear entire screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    updateSpaceship();
    
    // Begin drawing
    drawSpaceship();
    /* other draw methods (to add later) */
    if(showingHelp>=0) {
        if (showingHelp < 1) {
            showingHelp -= 0.01;
        }
        showHelp();
    }
    handle=requestAnimationFrame(draw);
}

let leftArrow = 37;
let rightArrow = 39;
let upArrow = 38;
function keyLetGo(event)
{
    switch(event.keyCode)
    {
        case leftArrow:
            spaceship.rotatingLeft = false;
            break;
        case rightArrow:
            spaceship.rotatingRight = false;
            break;
        case upArrow:
            spaceship.engineOn = false;
            break;
    }
}

document.addEventListener('keyup', keyLetGo);

function keyPressed(event)
{
    if(showingHelp==1) {showingHelp = 0.99;}
    switch(event.keyCode)
    {
        case leftArrow:
            spaceship.rotatingLeft = true;
            break;
        case rightArrow:
            spaceship.rotatingRight = true;
            break;
        case upArrow:
            spaceship.engineOn = true;
            break;
    }
}
function drawHelpLine(x1,y1,dx,dy){
        context.beginPath();
    context.strokeStyle = "white";
    context.moveTo(x1,y1);
    context.lineTo(x1+dx,y1+dy);
    context.lineWidth = 5;
    context.stroke();
    return {x:x1+dx,y:y1+dy};

}
function drawTextLines(text,x,y){
    text = text.split("|");
    for (let i in text) {
        context.fillText(text[i], x, y+20*i);
    }
}
function showHelp(){
    let cursor = drawHelpLine(60,60,40,15);
    context.font = "16px serif";
    context.lineCap = "round";
    context.fillStyle="white";
    context.globalAlpha = showingHelp>0?showingHelp:0;
    drawTextLines("Press the up key for thrust,|left/right to rotate the ship",
                  cursor.x+5, cursor.y-5);
    cursor = drawHelpLine(800,100,-100,40);
    drawTextLines("The ship will bounce|off walls and floors.",cursor.x-140, cursor.y);
    cursor = drawHelpLine(target.shift, ymax-10, -40, -100);
    drawTextLines("Hit this target with|a speed less than 0.5.",cursor.x-120,cursor.y-30);
    drawHelpLine(50,ymax,40,-100);
    cursor = drawHelpLine(150,ymax,-60,-100);
    drawTextLines("Two missions to choose from.",cursor.x-50,cursor.y-10);
    context.globalAlpha = 1;
}
function startGame(mode) {
    cancelAnimationFrame(handle);
    $(".button").removeClass("selected");
    $("#G"+mode).addClass("selected");
    if(mode==1 && showingHelp==1) {showingHelp = 0.99;}
    dots=[];
    target.mode=mode;
    spaceship.win=false;
    spaceship.position={x:50, y:60};
    spaceship.velocity={x:0,y:0};
    spaceship.angle=0;
    spaceship.engineOn=false;
    spaceship.rotatingLeft=false;
    spaceship.rotatingRight=false;
    draw();
}
function init() {
    xmax = 800;
    ymax = 500;
    canvas = document.getElementById("game");
    $(canvas).attr({width:xmax,height:ymax});
    context = canvas.getContext("2d");
    context.globalAlpha = 1;
    document.addEventListener('keydown', keyPressed);
    target.shift = xmax*0.8;
    $("#G0").click(function(){startGame(0);});
    $("#G1").click(function(){startGame(1);});
    startGame(0);
};
$(init);

