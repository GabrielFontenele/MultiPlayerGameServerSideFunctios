var socket = io();
var test = false;

var movement = {
  up: false,  
  down: false,
  left: false,
  right: false
}

var players = {};
var bulletsArray = [];

document.addEventListener('mousedown',function(e) {
  socket.emit('mouseClick', {
    x:e.x,
    y:e.y
  });
});

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
    case 71: // G
      test = !test;
      break;
  }
  
});
//canvas 
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

function bullet(x, y, vx, vy) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.playerId = playerId;
}
// ClickToShoot


socket.emit('new player');


socket.on('statePlayers', function(playersS) {
  players = playersS;
}); 
socket.on('stateBullets', function(bulletsS) {
  bulletsArray = bulletsS;
}); 
var timeTestM = 0;
var timeTestB = 0;
var lastUpdateTime = (new Date()).getTime();
setInterval(function () {
  var currentTime = (new Date()).getTime();
  var timeDifference = currentTime - lastUpdateTime;
  socket.emit('bulletMovement', bulletsArray);
  //movement

  if(test){
    timeTestM = timeTestM + timeDifference;
    timeTestB = timeTestB + timeDifference;
    if(timeTestM > (Math.random()*500+ Math.random()*100) ){
    var upDown = (Boolean(Math.random()<.5));
    var rightLeft = (Boolean(Math.random()<.5));
    timeTestM = 0;
    //bullet
    }else{
      upDown = movement.up;
      rightLeft = movement.left
    }
    if(timeTestM > (Math.random()*100)+100 ){
      socket.emit('mouseClick', {
        x:Math.random()*800,
        y:Math.random()*600
      });
      timeTestM =0;
    }
    movement.up = upDown;
    movement.down = !upDown;
    movement.left = rightLeft;    
    movement.right = !rightLeft;
  }

  socket.emit('movement', movement);
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    // console.log(JSON.stringify(player));
    context.fillStyle = 'green';
    context.beginPath();
    context.fillRect( player.x - 60, player.y + 25 , player.life, 5);
    context.fill();
    if(socket.id==id){
    context.fillStyle = 'blue';
    }else{
    context.fillStyle = 'red';
    }
    context.beginPath();
    context.arc(player.x-10, player.y-10, 10, 0, 2 * Math.PI);
    context.fill();    
    context.fillStyle = 'yellow ';
    context.font = "15px Arial";
    context.fillText(player.points,player.x-15,player.y-5);
    // context.beginPath();  
    // context.clearRect(player.x-40, player.x-20, player.y-50, player.y+player.life);
    // context.fill();

  }
  for (var i in bulletsArray) {
    context.fillStyle = 'black ';
    context.beginPath();
    context.arc(bulletsArray[i].x-10, bulletsArray[i].y-10, 10, 0, 2 * Math.PI);
    context.fill();
  }

  lastUpdateTime = currentTime;
}, 1000 / 60);