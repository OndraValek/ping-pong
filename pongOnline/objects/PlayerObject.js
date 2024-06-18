var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

// Konstanty pro klávesy a pohybovou jednotku
var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var UNIT = 5;

// Konstruktor pro objekt Player
function Player(id, position) {
  // Zavolání rodičovského konstruktoru
  BaseObejct.call(this);
  
  // Náhodné generování barvy hráče
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += (Math.floor(Math.random() * 16)).toString(16);
  }
  
  // Nastavení počáteční pozice hráče podle jeho role (LEFT nebo RIGHT)
  var xPos;
  switch (position) {
    case "LEFT":
      xPos = SETTINGS.PLAYER.GAP;
      break;
    case "RIGHT":
      xPos = SETTINGS.WIDTH - SETTINGS.PLAYER.GAP - SETTINGS.PLAYER.WIDTH;
      break;
  }
  
  // Inicializace vlastností hráče
  this.role = "player";
  this.status.shape = "rectangle";
  this.id = id;
  this.score = 0;
  this.ready = false;
  this.keypress = {};
  this.mouse = {
    move: { x: undefined, y: undefined },
    click: { x: undefined, y: undefined }
  };

  // Nastavení obdélníku reprezentujícího hráče
  this.status.rect = {
    height: SETTINGS.PLAYER.HEIGHT,
    width: SETTINGS.PLAYER.WIDTH,
    x: xPos,
    y: SETTINGS.HEIGHT / 2,
    color: { fill: color }
  };
}

// Dědění z BaseObejct
Player.prototype = new BaseObejct();
Player.prototype.constructor = Player;

// Metoda update pro aktualizaci stavu hráče
Player.prototype.update = function(room) {
  var player = this.status.rect;
  
  // Pohyb hráče jen pokud je hra ve stavu "countdown" nebo "playing"
  if (room.status == "countdown" || room.status == "playing") {
    // Kontrola kláves pro pohyb nahoru
    if (this.keypress[UP]) {
      moveUp(player);
      this.mouse.click = null;
    }
    
    // Kontrola kláves pro pohyb dolů
    if (this.keypress[DOWN]) {
      moveDown(player);
      this.mouse.click = null;
    }
    
    // Kontrola kliknutí myší pro pohyb hráče
    if (this.mouse.click && ((this.mouse.click.x < player.x + 50 && this.mouse.click.x > player.x - 50) || (this.mouse.click.x === null))) {
      if (this.mouse.click.y < player.y - 5) {
        moveUp(player);
      } else if (this.mouse.click.y > player.y + 5) {
        moveDown(player);
      } else {
        this.mouse.click = null;
      }
    }
  }
};

// Exportování modulu pro použití v jiných částech aplikace
module.exports = Player;

// Funkce pro pohyb hráče nahoru
function moveUp(player) {
  if (player.y - player.height / 2 - UNIT >= 0 + SETTINGS.BORDER_WIDTH)
    player.y -= UNIT;
}

// Funkce pro pohyb hráče dolů
function moveDown(player) {
  if (player.y + player.height / 2 + UNIT <= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH)
    player.y += UNIT;
}
