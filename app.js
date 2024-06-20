var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var path    = require('path');

// Nastavení statické složky pro Express
app.use(express.static(path.join(__dirname,"public")));

// Nastavení portu pro server
var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("server on!: http://localhost:3000/");
});

var SETTINGS = require("./pongOnline/SETTINGS.js");

var lobbyManager = new (require('./pongOnline/LobbyManager.js'))(io);
var roomManager = new (require('./pongOnline/RoomManager.js'))(io);
var gameManager = new (require('./pongOnline/GameManager.js'))(io, roomManager);

// Hlavní události pro WebSocket připojení
io.on('connection', function(socket){
  // Odeslání klientských nastavení nově připojenému uživateli
  io.to(socket.id).emit('connected', SETTINGS.CLIENT_SETTINGS);
  console.log('user connected: ', socket.id);

  // Událost pro připojení uživatele do lobby
  socket.on('waiting', function(){
    lobbyManager.push(socket);
    lobbyManager.dispatch(roomManager);
  });

  // Událost pro odpojení uživatele
  socket.on('disconnect', function(){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.destroy(roomIndex); // Zničení místnosti, pokud uživatel v nějaké je
    lobbyManager.kick(socket); // Odstranění uživatele z lobby
    console.log('user disconnected: ', socket.id);
  });

  // Událost pro stisk klávesy
  socket.on('keydown', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode] = true;
  });

  // Událost pro připravenost uživatele
  socket.on('ready', function(){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].ready = true;
  });

  // Událost pro uvolnění klávesy
  socket.on('keyup', function(keyCode){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) delete roomManager.rooms[roomIndex].objects[socket.id].keypress[keyCode];
  });

  // Událost pro pohyb myší
  socket.on('mousemove', function(x,y){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].mouse.move = {x:x, y:y};
  });

  // Událost pro kliknutí myší
  socket.on('click', function(x,y){
    var roomIndex = roomManager.roomIndex[socket.id];
    if(roomIndex) roomManager.rooms[roomIndex].objects[socket.id].mouse.click = {x:x, y:y};
  });
});
