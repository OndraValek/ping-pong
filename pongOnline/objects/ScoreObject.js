var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

// Konstruktor pro objekt Score
function Score(id, position) {
  var xPos;
  // Nastavení pozice skóre podle pozice hráče (LEFT nebo RIGHT)
  switch (position) {
    case "LEFT":
      xPos = SETTINGS.WIDTH / 2 - SETTINGS.SCORE.GAP;
      break;
    case "RIGHT":
      xPos = SETTINGS.WIDTH / 2 + SETTINGS.SCORE.GAP;
      break;
  }

  // Zavolání rodičovského konstruktoru
  BaseObejct.call(this);

  // Inicializace vlastností skóre
  this.playerId = id;
  this.status.shape = "text";
  this.status.text = {
    color: { fill: "#123456" },
    font: "Arial",
    textAlign: "center",
    textBaseline: "middle",
    size: SETTINGS.SCORE.SIZE,
    message: undefined, // Skóre bude nastaveno v metodě update
    x: xPos,
    y: SETTINGS.SCORE.Y
  };
}

// Dědění z BaseObejct
Score.prototype = new BaseObejct();
Score.prototype.constructor = Score;

// Metoda update pro aktualizaci stavu skóre
Score.prototype.update = function(room) {
  // Nastavení aktuálního skóre hráče
  this.status.text.message = room.objects[this.playerId].score;
};

// Exportování modulu pro použití v jiných částech aplikace
module.exports = Score;
