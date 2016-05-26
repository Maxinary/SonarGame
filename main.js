var c = document.getElementById("game");
var ctx = c.getContext("2d");

//global vars

//player specific
var playerSize = 30;
var playerPos = [0.5,0.5];
var sizer = 6;
var speed = 1/200;
var winCount = 0;

//the circle
var dotPositions = [];
var stuckDots = [];
var dotNumber = 128;
var dotLength = 400;
var delayTime = 100;
for(var i=0;i<dotNumber;i++){
  dotPositions.push([0,0]);
  stuckDots.push(false);
}
var timeoutCounter = 0;
var dotSpeed = .005;
var dpos = [playerPos[0],playerPos[1]];

//global board vars
var board = [];
var state="choose";
var gridSize = 3*playerSize-3*playerSize%(document.body.clientWidth/16);
var moveScalar = gridSize/(sizer*playerSize);
var winsquare = [-1,-1];
var clevel;

//menue
var menuSquareSize = 75;
var menuSpace = 30;

function modulus(start,end){
  if(start>0){
    return start%end;
  }else{
    return end+start%end;
  }
}

//from http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

//player movement
registerKeyPress(buttonMove.hold, 87, function(){playerPos[1]-=speed;});//left
registerKeyPress(buttonMove.hold, 65, function(){playerPos[0]-=speed;});//up
registerKeyPress(buttonMove.hold, 83, function(){playerPos[1]+=speed;});//down
registerKeyPress(buttonMove.hold, 68, function(){playerPos[0]+=speed;});//right

function round(innum,place){
  return Math.round( innum * Math.pow(10,place)) / Math.pow(10,place);
}

function reset(){
  playerPos = [0.5,0.5];
  for(var i=0;i<dotPositions.length;i++){
    dotPositions[i] = [0,0];
    stuckDots[i] = false;
    dpos = [0.5,0.5];
  }
  timeoutCounter = 0;
}

function isEdge(posx,posy){
  if(posx<0 || posx>=board.length || posy<0 || posy>=board[0].length || board[posx][posy]=="1"){
    return true;
  }
  return false;
}

function toCenter(x,y){
  var nx = document.body.clientWidth/2+playerSize*sizer*x;
  var ny = document.body.clientHeight/2+playerSize*sizer*y;
  return [nx,ny];
}

function fromCenter(x,y){
  var nx = x/(sizer*playerSize)-document.body.clientWidth/2;
  var ny = y/(sizer*playerSize)-document.body.clientHeight/2;
  return [nx,ny];
}

//funcs
function draw(){
  c.width = document.body.clientWidth;
  c.height = document.body.clientHeight;
  ctx.font = "75px sans-serif";
  //draw bg
  ctx.fillStyle = "#222";
  ctx.fillRect(0,0,document.body.clientWidth, document.body.clientHeight);
  ctx.fillStyle = "#111";
  for(var i=0;i<document.body.clientWidth/gridSize;i++){
    ctx.fillRect(modulus(i*gridSize-gridSize/moveScalar*playerPos[0], document.body.clientWidth),0,1, document.body.clientHeight);
  }
  for(var i=0;i<document.body.clientHeight/gridSize;i++){
    ctx.fillRect(0,modulus(i*gridSize-gridSize/moveScalar*playerPos[1], document.body.clientHeight), document.body.clientWidth,1);
  }
  //draw yellow win stage
  ctx.fillStyle = "rgba(255,255,0,.25)";
  var m = toCenter(winsquare[0]-playerPos[0],winsquare[1]-playerPos[1]);

  ctx.fillRect(m[0],m[1],sizer*playerSize,sizer*playerSize);
  
  //draw circle
  var m = toCenter(dotPositions[0][0]+(dpos[0]-playerPos[0]),dotPositions[0][1]+(dpos[1]-playerPos[1]));

  ctx.moveTo(m[0],m[1]);
  for(var i=1;i<=dotPositions.length;i++){
    m = toCenter(dotPositions[i%dotPositions.length][0]+(dpos[0]-playerPos[0]),dotPositions[i%dotPositions.length][1]+(dpos[1]-playerPos[1]));
    ctx.lineTo(m[0],m[1]);
  }
  ctx.closePath();
  var brightness = (1-timeoutCounter*1/dotLength).toString();
  ctx.strokeStyle = "rgba(0,255,0,"+brightness+")";
  ctx.lineWidth = 5;
  ctx.stroke();
  //draw player
  ctx.fillStyle = "#222";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(document.body.clientWidth/2,document.body.clientHeight/2,playerSize,0,2*Math.PI);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  //inner player
  ctx.beginPath();
  ctx.fillStyle = "#3C3";
  ctx.strokeStyle = "rgba(0,0,0,0)";
  ctx.arc(document.body.clientWidth/2,document.body.clientHeight/2,playerSize*(timeoutCounter/(dotLength+delayTime)),0,2*Math.PI);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

draw();
ctx.clearRect(0,0,document.body.clientWidth,document.body.clientHeight);

function doIt(){
  if(state=="play"){
    //hold functions
    for(var i in holdFunctions){
      if(holdFunctions[i]!==undefined){
        if(keys[i] === true){
          for(var j=0;j<holdFunctions[i].length;j++){
            holdFunctions[i][j]();
          }
        }
      }
    }
    
    //dot logic
    for(var i=0;i<dotPositions.length;i++){
      if( !stuckDots[i] &&
          Math.floor(dpos[0]+dotPositions[i][0])>=0 && Math.floor(dpos[0]+dotPositions[i][0])<board.length &&
          Math.floor(dpos[1]+dotPositions[i][1])>=0 && Math.floor(dpos[1]+dotPositions[i][1])<board[0].length &&
          board[Math.floor(dpos[0]+dotPositions[i][0])][Math.floor(dpos[1]+dotPositions[i][1])]!="1"){
        dotPositions[i][0] += dotSpeed*Math.cos(i*1.0/dotPositions.length*(Math.PI*2));
        dotPositions[i][1] += dotSpeed*Math.sin(i*1.0/dotPositions.length*(Math.PI*2));
      }else{
        stuckDots[i] = true;
      }
    }
    //test collision
    var k = [0,0];//left,right,up,down
    var touch = false;
    if(playerPos[0]%1 > 1-1/sizer){//bottom
      k[0] = 1;
      if(isEdge(Math.floor(playerPos[0])+1,Math.floor(playerPos[1]))){
        touch=true;
      }
    }
    
    if(playerPos[0]%1 < 1/sizer){//top
      k[0] = -1;
      if(isEdge(Math.floor(playerPos[0])-1,Math.floor(playerPos[1]))){
        touch=true;
      }
    }
    
    if(playerPos[1]%1 > 1-1/sizer){//right
      k[1] = 1;
      if(isEdge(Math.floor(playerPos[0]),Math.floor(playerPos[1])+1)){
        touch=true;
      }
    }
    
    if(playerPos[1]%1 < 1/sizer){//left
      k[1] = -1;
      if(isEdge(Math.floor(playerPos[0]),Math.floor(playerPos[1])-1)){
        touch=true;
      }
    }
  
    if(touch){
      reset();
    }
    
    timeoutCounter++;
    if(timeoutCounter >= dotLength+delayTime){
      timeoutCounter = 0;
      dpos = [playerPos[0],playerPos[1]];
      for(var i=0;i<dotPositions.length;i++){
        dotPositions[i][0] = Math.cos(i*1.0/dotPositions.length*(Math.PI*2))/sizer;
        dotPositions[i][1] = Math.sin(i*1.0/dotPositions.length*(Math.PI*2))/sizer;
        stuckDots[i] = false;
      }
    }
    
    if(winsquare[0]==Math.floor(playerPos[0]) && winsquare[1]==Math.floor(playerPos[1])){
      winCount++;
      if(winCount>200){
        if(clevel<levels.length-1){
          clevel++;
          console.log(clevel);
          board = levels[clevel];
          for(var i=0;i<board.length;i++){
            if(board[i].indexOf("2")!=-1){
              winsquare = [i,board[i].indexOf(2)];
            }
          }
          reset();
        }else{
          state="choose";
        }
      }
    }else{
      winCount = 0;
    }
    draw();
  }else if(state=="choose"){
    ctx.fillStyle = "#222";
    ctx.fillRect(0,0,document.body.clientWidth,document.body.clientHeight);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#FFF";
    var fitting = Math.floor(document.body.clientWidth/(menuSquareSize+menuSpace));
    for(var i=0;i<levels.length;i++){
      roundRect(ctx, 
        10+menuSpace*(i%fitting) + menuSquareSize*(i%fitting), 
        10+menuSpace*(Math.floor(i/fitting)) + menuSquareSize*Math.floor(i/fitting),
        menuSquareSize,
        menuSquareSize);
      ctx.fillText(
        i+1,
        10+menuSpace*(i%fitting) + menuSquareSize*(i%fitting+0.20), 
        10+menuSpace*(Math.floor(i/fitting)) + menuSquareSize*(Math.floor(i/fitting)+0.85));
    }
  }
}

document.onclick = function(event){
  rectSize = menuSquareSize+menuSpace;
  if(state=="choose"){
    if((event.clientX-10)%rectSize<menuSquareSize &&
       (event.clientY-10)%rectSize<menuSquareSize
    ){
      clevel = Math.floor(event.clientX/rectSize)+(Math.floor(document.body.clientWidth/rectSize))*Math.floor(event.clientY/rectSize);
      board = levels[clevel];
      for(var i=0;i<board.length;i++){
        if(board[i].indexOf("2")!=-1){
          winsquare = [i,board[i].indexOf(2)];
        }
      }
      state="play";
    }
  }
}
window.onload = function(){
  setInterval(doIt,5);
};