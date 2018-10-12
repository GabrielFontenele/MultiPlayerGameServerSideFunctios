var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 8080);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(8080, function() {
  console.log('Starting server on port 8080');
});

var players = {};
var bulletsArray = [];
function bullet(x, y, vx, vy,playerId) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.playerId = playerId;
}

io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: 300,
      y: 300,
      life: 100,
      points: 0
    };
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      if(player.x > 20){player.x -= 5;}
    }
    if (data.up) {
      if(player.y > 20){ player.y -= 5;}
    }
    if (data.right) {
      if(player.x < 800){ player.x += 5;}
    }
    if (data.down) {
      if(player.y < 600){ player.y += 5;}
    }
    // console.log(JSON.stringify(data));
  });
  socket.on('mouseClick', function(data){
    var dx = (data.x - players[socket.id].x);
    var dy = (data.y - players[socket.id].y);
    var mag = Math.sqrt(dx * dx + dy * dy);              
    var velocityX = (dx / mag) * 10;
    var velocityY = (dy / mag) * 10;
    
    bulletsArray.push(new bullet(
      players[socket.id].x + velocityX * 4,
      players[socket.id].y + velocityY * 4,
      velocityX,
      velocityY,
      socket.id
    ));

  });
  socket.on('disconnect', function () {
    players[socket.id] = undefined;

  });
});


 var lastUpdateTime = (new Date()).getTime();
 var nLoops=0;
setInterval(function() {
  io.sockets.emit('statePlayers', players);
  io.sockets.emit('stateBullets', bulletsArray);
  for (var i in bulletsArray) {
    if(bulletsArray[i].x < 0){
      bulletsArray.splice(i ,1);
    }else if(bulletsArray[i].x > 800){
      bulletsArray.splice(i ,1);
    }else if(bulletsArray[i].y < 0){
      bulletsArray.splice(i ,1);
    }else if(bulletsArray[i].y > 600){
      bulletsArray.splice(i ,1);
    }else{
    bulletsArray[i].x += bulletsArray[i].vx
    bulletsArray[i].y += bulletsArray[i].vy
    for (var id in players) {
      if(isCollide(players[id],bulletsArray[i])){
        
        players[id].life -= 3;
        if(players[id].life < 0 ){
          players[id].life = 100;
          if(players[bulletsArray[i].playerId]!= undefined){
          players[bulletsArray[i].playerId].points++;
          }
        }
      }
    }
    }  
  }
  nLoops++;

  if(nLoops == 1000){
  var currentTime = (new Date()).getTime();
  var timeDifference = currentTime - lastUpdateTime;
  // console.log("currentTime:"+currentTime);
  // console.log("lastUpdateTime:"+lastUpdateTime);
  console.log("timeDifference:"+timeDifference);
  nLoops= 0;  
  lastUpdateTime = currentTime;

  }
  
  // console.log(JSON.stringify(players));
}, 1000 / 60);

function isCollide(a, b) {
  var r = 20;
  // console.log(JSON.stringify(b.y));
  if(a!=undefined && b!=undefined){
    return !(
        ((a.y + r) < (b.y)) ||
        (a.y > (b.y + r)) ||
        ((a.x + r) < b.x) ||
        (a.x > (b.x + r))
    );
  }
}