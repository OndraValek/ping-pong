// Načtení potřebných tříd a konfiguračních nastavení
var Player = require("./objects/PlayerObject.js");
var Ball = require("./objects/BallObject.js");
var Score = require("./objects/ScoreObject.js");
var Countdown = require("./objects/CountdownObject.js");
var SETTINGS = require("./SETTINGS.js");

// Konstruktor pro objekt RoomManager
function RoomManager(io) {
  var RmMg = this;
  RmMg.rooms = {};      // Mapa místností indexovaná podle ID
  RmMg.roomIndex = {};  // Index hráčů a jejich příslušných místností

  // Metoda pro vytvoření nové herní místnosti s dvěma hráči
  RmMg.create = function(socket0, socket1) {
    var roomId = socket0.id + socket1.id;  // Vytvoření jedinečného ID místnosti
    var room = new Room(RmMg, roomId, socket0, socket1);  // Vytvoření instance místnosti
    socket0.join(roomId);  // Připojení hráče 0 do místnosti
    socket1.join(roomId);  // Připojení hráče 1 do místnosti
    RmMg.rooms[roomId] = room;  // Přidání místnosti do seznamu místností
    RmMg.roomIndex[socket0.id] = roomId;  // Mapování hráče 0 na ID místnosti
    RmMg.roomIndex[socket1.id] = roomId;  // Mapování hráče 1 na ID místnosti
    ready.initialize(io, room);  // Inicializace fáze "ready" pro místnost
    io.to(socket0.id).emit("ready", "left");  // Odeslání signálu hráči 0
    io.to(socket1.id).emit("ready", "right");  // Odeslání signálu hráči 1
    console.log("Room Created :", roomId);  // Výpis vytvoření místnosti
  };

  // Metoda pro zničení herní místnosti
  RmMg.destroy = function(roomId) {
    var room = RmMg.rooms[roomId];  // Získání instance místnosti
    room.players.forEach(function(socket) {
      // Odeslání zprávy hráči, pokud není připravený nebo není nastaven countdown
      var message = (!room.objects[socket.id].ready && !room.objects.countdown) ? "YOU ARE NOT PREPARED" : null;
      delete RmMg.roomIndex[socket.id];  // Odstranění z indexu místností
      io.to(socket.id).emit('destroy', message);  // Odeslání zprávy o zničení místnosti hráči
    });
    delete RmMg.rooms[roomId];  // Odstranění místnosti ze seznamu místností
  };
}

// Exportování modulu pro použití v jiných částech aplikace
module.exports = RoomManager;

// Konstruktor pro objekt Room
function Room(RmMg, id, socket0, socket1) {
  var room = this;
  room.id = id;  // ID místnosti
  room.RmMg = RmMg;  // Reference na RoomManager
  room.players = [socket0, socket1];  // Pole hráčů v místnosti
  room.loop = function() {};  // Prázdná funkce pro smyčku hry
  room.objects = {};  // Objekty (hráči, míč, skóre) v místnosti
  room.objects[room.players[0].id] = new Player(room.players[0].id, "LEFT");  // Vytvoření hráče 0
  room.objects[room.players[1].id] = new Player(room.players[1].id, "RIGHT");  // Vytvoření hráče 1
  room.objects.player0Score = new Score(room.players[0].id, "LEFT");  // Skóre hráče 0
  room.objects.player1Score = new Score(room.players[1].id, "RIGHT");  // Skóre hráče 1
  room.objects.ball = new Ball(room.players[0].id, room.players[1].id);  // Míč
}

// Objekt ready pro fázi "ready"
var ready = {
  initialize: function(io, room) {
    this.io = io;  // Reference na Socket.IO
    room.status = "ready";  // Nastavení stavu místnosti na "ready"
    room.loop = this.loop;  // Nastavení smyčky místnosti
    room.objects.countdown = new Countdown(10, null, SETTINGS.HEIGHT - 40);  // Inicializace countdownu
    room.objects.countdown.action = function(room) {
      // Akce po dokončení countdownu
      delete room.objects.countdown;  // Odstranění countdownu
      room.RmMg.destroy(room.id);  // Zničení místnosti
    };
  },
  loop: function(room) {
    var player0ready = room.objects[room.players[0].id].ready;  // Připravenost hráče 0
    var player1ready = room.objects[room.players[1].id].ready;  // Připravenost hráče 1
    if (player0ready && player1ready) {  // Pokud jsou oba hráči připraveni
      ready.destroy(room);  // Zničení fáze "ready"
      playing.initialize(ready.io, room);  // Inicializace fáze "playing"
    }
    var statuses = [];
    for (var object in room.objects) {
      var obj = room.objects[object];
      obj.update(room);  // Aktualizace stavu objektu
      statuses.push(obj.status);  // Přidání stavu do seznamu
    }
    ready.io.to(room.id).emit('update', statuses);  // Odeslání aktualizovaných stavů klientům
  },
  destroy: function(room) {
    delete room.objects.playing;  // Zničení fáze "playing"
  }
};

// Objekt playing pro fázi "playing"
var playing = {
  initialize: function(io, room) {
    this.io = io;  // Reference na Socket.IO
    room.status = "countdown";  // Nastavení stavu místnosti na "countdown"
    room.loop = this.loop;  // Nastavení smyčky místnosti
    room.objects.countdown = new Countdown(5, null, SETTINGS.HEIGHT * 3 / 4, 100);  // Inicializace countdownu
    room.objects.countdown.action = function(room) {
      // Akce po dokončení countdownu
      delete room.objects.countdown;  // Odstranění countdownu
      room.status = "playing";  // Nastavení stavu místnosti na "playing"
    };
    io.to(room.id).emit('playing');  // Odeslání klientům informace o začátku hry
  },
  loop: function(room) {
    var statuses = [];
    for (var object in room.objects) {
      var obj = room.objects[object];
      obj.update(room);  // Aktualizace stavu objektu
      statuses.push(obj.status);  // Přidání stavu do seznamu
    }
    playing.io.to(room.id).emit('update', statuses);  // Odeslání aktualizovaných stavů klientům
  }
};
