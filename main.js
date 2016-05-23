var c = document.getElementById("game");
var ctx = c.getContext("2d");

//global vars
var playerSize = 30;

var playerPos = [0.5,0.5];

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

var board = 
[
  "01010100000",
  "01000101110",
  "00011100000",
  "01000001110",
  "01011101000",
  "01010001110",
  "01011101010",
  "00000000012"
];

var gridSize = 3*playerSize-3*playerSize%(document.body.clientWidth/16);
var sizer = 6;
var moveScalar = gridSize/(sizer*playerSize);

var speed = 1/300;

var dpos = [playerPos[0],playerPos[1]];

function modulus(start,end){
  if(start>0){
    return start%end;
  }else{
    return end+start%end;
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
  var poses = [-256,-256];
  for(var i=0;i<board.length;i++){
    if(board[i].indexOf("2")!=-1){
      poses = [i,board[i].indexOf(2)];
    }
  }
  var m = toCenter(poses[0]-playerPos[0],poses[1]-playerPos[1]);

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
  ctx.fillStyle = "#8E8";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(document.body.clientWidth/2,document.body.clientHeight/2,playerSize,0,2*Math.PI);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.beginPath();
}

function doIt(){
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
    playerPos = [0.5,0.5];
    for(var i=0;i<dotPositions.length;i++){
      dotPositions[i] = [0,0];
      stuckDots[i] = false;
      dpos = [0.5,0.5];
    }
    timeoutCounter = 0;
  }
  
  timeoutCounter++;
  if(timeoutCounter >= dotLength+delayTime){
    timeoutCounter = 0;
    dpos = [playerPos[0],playerPos[1]];
    for(var i=0;i<dotPositions.length;i++){
      dotPositions[i][0] = 0;
      dotPositions[i][1] = 0;
      stuckDots[i] = false;
    }
  }
  draw();
}

setInterval(doIt,2);