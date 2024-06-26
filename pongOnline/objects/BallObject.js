var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

// Enum-like objekt definující typy kolize
var COLLUSION_TYPE = { NO_COLLUSION: -1, VERTICAL: 1, HORIZONTAL: 2 };

// Konstruktor pro objekt Ball
function Ball(player0Id, player1Id){
  // Zavolání rodičovského konstruktoru
  BaseObejct.call(this);
  
  // ID hráčů spojených s míčem
  this.playerIds = [player0Id, player1Id];
  
  // Směr pohybu míče
  this.dx = 1;
  this.dy = 1;
  
  // Rychlost míče
  this.speed = 5;
  
  // Příznak pro kontrolu pohybu
  this.move = true;
  
  // Tvar a vlastnosti pro vykreslení míče
  this.status.shape = "rectangle";
  this.status.rect = {
    x: SETTINGS.WIDTH / 2,
    y: SETTINGS.HEIGHT / 2,
    width: SETTINGS.BALL.WIDTH,
    height: SETTINGS.BALL.HEIGHT,
    color: { fill: "#000000" },
  };
}

// Dědění z BaseObejct
Ball.prototype = new BaseObejct();
Ball.prototype.constructor = Ball;

// Metoda update pro pohyb míče a řešení kolizí
Ball.prototype.update = function(room){
  // Pohyb míče jen pokud je hra ve stavu "playing"
  if(this.move && room.status == "playing"){
    var ball = this.status.rect;
    // Aktualizace pozice míče
    ball.x += this.dx * this.speed;
    ball.y += this.dy * this.speed;

    /* Mód ladění (debug mode)
    if(ball.x <= 50 || ball.x >= SETTINGS.WIDTH - 50 ){
      this.speed = 0.2;
    } else {
      this.speed = 2;
    }
    */

    // Kontrola kolize s levým a pravým okrajem obrazovky
    if(ball.x <= 0 - ball.width * 2){
      room.objects[this.playerIds[1]].score++;
      this.dx = Math.abs(this.dx);
      this.initialize();
    }
    if(ball.x >= SETTINGS.WIDTH + ball.width * 2){
      room.objects[this.playerIds[0]].score++;
      this.dx = -Math.abs(this.dx);
      this.initialize();
    }

    // Kontrola kolize s horním a spodním okrajem obrazovky
    if(ball.y - ball.height / 2 <= 0 + SETTINGS.BORDER_WIDTH)
      this.dy = Math.abs(this.dy);
    if(ball.y + ball.height / 2 >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH)
      this.dy = -Math.abs(this.dy);

    // Kontrola kolize s hráči
    for(var object in room.objects){
      if(room.objects[object].role == "player"){
        var playerStat = room.objects[object].status.rect;
        var collusionType = ballCollusionCheck(ball, playerStat, this.dx * this.speed);
        switch(collusionType){
          case COLLUSION_TYPE.NO_COLLUSION:
            break;
          case COLLUSION_TYPE.VERTICAL:
            this.dy = bounce(ball.y + ball.height / 2, playerStat.y + playerStat.height / 2, this.dy);
            break;
          case COLLUSION_TYPE.HORIZONTAL:
            this.dx = bounce(ball.x + ball.width / 2, playerStat.x + playerStat.width / 2, this.dx);
            break;
        }
      }
    }
  }
};

// Inicializační metoda pro nastavení míče do výchozí pozice
Ball.prototype.initialize = function(objects){
  var ball = this.status.rect;
  ball.x = SETTINGS.WIDTH / 2;
  ball.y = SETTINGS.HEIGHT / 2;
};

module.exports = Ball;

// Funkce pro odražení míče
function bounce(x, y, v){
  return x < y ? -Math.abs(v) : Math.abs(v);
}

// Funkce pro kontrolu kolize míče s hráčem
function ballCollusionCheck(ballStat, playerStat, dx){
  if(pointSquareCollusionCheck(ballStat.x - ballStat.width / 2, ballStat.y - ballStat.height / 2, playerStat)){
    return pointSquareCollusionCheck(ballStat.x - ballStat.width / 2 - dx, ballStat.y - ballStat.height / 2, playerStat) ?
      COLLUSION_TYPE.VERTICAL :
      COLLUSION_TYPE.HORIZONTAL;
  }
  if(pointSquareCollusionCheck(ballStat.x + ballStat.width / 2, ballStat.y - ballStat.height / 2, playerStat)){
    return pointSquareCollusionCheck(ballStat.x + ballStat.width / 2 - dx, ballStat.y - ballStat.height / 2, playerStat) ?
      COLLUSION_TYPE.VERTICAL :
      COLLUSION_TYPE.HORIZONTAL;
  }
  if(pointSquareCollusionCheck(ballStat.x - ballStat.width / 2, ballStat.y + ballStat.height / 2, playerStat)){
    return pointSquareCollusionCheck(ballStat.x - ballStat.width / 2 - dx, ballStat.y + ballStat.height / 2, playerStat) ?
      COLLUSION_TYPE.VERTICAL :
      COLLUSION_TYPE.HORIZONTAL;
  }
  if(pointSquareCollusionCheck(ballStat.x + ballStat.width / 2, ballStat.y + ballStat.height / 2, playerStat)){
    return pointSquareCollusionCheck(ballStat.x + ballStat.width / 2 - dx, ballStat.y + ballStat.height / 2, playerStat) ?
      COLLUSION_TYPE.VERTICAL :
      COLLUSION_TYPE.HORIZONTAL;
  }
  return COLLUSION_TYPE.NO_COLLUSION;
}

// Funkce pro kontrolu kolize bodu s obdélníkem
function pointSquareCollusionCheck(x, y, square){
  if(x >= square.x - square.width / 2 && x <= square.x + square.width / 2 && y >= square.y - square.height / 2 && y <= square.y + square.height / 2)
    return true;
}
