var canvas = document.getElementById("game");
var context = canvas.getContext("2d");
var gravity=0.0025;
var scale=800;
var xmax=canvas.width;
var ymax=canvas.height;
var wins=[false,false];
var target =
    {
        width: 70,
        height: 10,
        color: "yellow",
        maxspeed: 0.5,
        shift: xmax*0.8,
        win:false,
        mode:0 //0 for no gravity, 1 for gravity
    };
dots=[];
dotcount=0;
var spaceship =
{
    color: "grey",
    width: 24,
    height: 36,
    position:
    {
        x: 50,
        y: 60
    },
    velocity:
    {
        x: 0,
        y: 0
    },
    angle: 0,
    thrust:2*gravity,
    engineOn: false,
    rotatingLeft: false,
    rotatingRight: false,
}

function drawSpaceship()
{
    context.save();
    if(wins[0] && wins[1]){
        context.save();
        context.beginPath();
        context.translate(xmax/2,ymax/2);
        context.fillStyle="yellow"
        context.font="96px sans";
        context.textAlign="center";
        context.fillText("Complete!",0,0);
        context.closePath();
        context.restore();
    }
    //target
        context.beginPath();
        context.translate(0,0);
    context.rect(target.shift-target.width*0.5,ymax-target.height,
                 target.width,target.height);
    context.fillStyle=target.color;
    context.fill();
    context.closePath();
    //dots
    var Ndots=50;
    for(i=0;i<Ndots;i++){
        var D=dots[i];
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
    var img=document.getElementById("ship");
    context.drawImage(img,-spaceship.width/2, -spaceship.height/2, spaceship.width, spaceship.height);
//    context.rect(spaceship.width * -0.5, spaceship.height * -0.5, spaceship.width, spaceship.height);
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
    var bounciness=1.0;
    var padding=spaceship.width/2;
    var X=spaceship.position.x;
    var Y=spaceship.position.y;
    var collide=0;
    if(Y>ymax-target.height-padding){
        if(Math.abs(X-target.shift)<target.width/2){
            if(Math.hypot(spaceship.velocity.x,spaceship.velocity.y)<target.maxspeed){
                collide=2;
                wins[target.mode]=true
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
    var acceleration={x:0,y:gravity*target.mode};
    if(spaceship.engineOn)
    {
        acceleration.x=spaceship.thrust*Math.sin(spaceship.angle);
        acceleration.y-=spaceship.thrust*Math.cos(spaceship.angle);
    }
    spaceship.velocity.x+=acceleration.x;
    spaceship.velocity.y+=acceleration.y;
    $("#vx").html(formV(spaceship.velocity.x));
    $("#vy").html(formV(spaceship.velocity.y));
    var vmag=Math.hypot(spaceship.velocity.x,spaceship.velocity.y);
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
    var sign=" ";
    if(val<0){sign="";}
    return sign+((0.001*scale*val).toFixed(1));
}
function formA(val){
    var sign=" ";
    if(val<0){sign="";}
    return sign+((scale*val).toFixed(1));
}
var handle;
function draw()
{
    // Clear entire screen
    context.clearRect(0, 0, canvas.width, canvas.height);

    updateSpaceship();
    
    // Begin drawing
    drawSpaceship();
    /* other draw methods (to add later) */

    handle=requestAnimationFrame(draw);
}

function keyLetGo(event)
{
    switch(event.keyCode)
    {
        case 37:
            // Left Arrow key
            spaceship.rotatingLeft = false;
            break;
        case 39:
            // Right Arrow key
            spaceship.rotatingRight = false;
            break;
        case 38:
            // Up Arrow key
            spaceship.engineOn = false;
            break;
    }
}

document.addEventListener('keyup', keyLetGo);

function keyPressed(event)
{
    switch(event.keyCode)
    {
        case 37:
            // Left Arrow key
            spaceship.rotatingLeft = true;
            break;
        case 39:
            // Right Arrow key
            spaceship.rotatingRight = true;
            break;
        case 38:
            // Up Arrow key
            spaceship.engineOn = true;
            break;
    }
}

document.addEventListener('keydown', keyPressed);
function init(mode){
    cancelAnimationFrame(handle);
    $(".button").removeClass("selected");
    $("#G"+mode).addClass("selected");
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
$(function(){
    $("#G0").click(function(){init(0);});
    $("#G1").click(function(){init(1);});
    init(0);
});

/*TODO:
 X When both buttons are lit up, give a congratulatory message.
 X When velocity is ok for entry, light up vmag.
 * Add instructions
 * - Up for thrust, left/right to turn
 * - No crashing; bounce off walls
 * - Must hit target with speed less than maximum
 * - Click on a button to start the game.  Deep Space means no gravity.
 * - You can click on a button to restart a game.
 * - Button turns yellow when complete.
 * Console.log to make sure I don't get a cheater who knows HTML.
 * Title: "Lander"? or "Newton's 2nd Law"
 * Add axes. (y points down)
 * I never did include a "different mass" game.
 * Add a fuel counter just for bragging rights.
 */
