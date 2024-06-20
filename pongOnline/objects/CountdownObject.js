var SETTINGS = require("../SETTINGS.js");
var BaseObejct = require("./BaseObject.js");

// Konstruktor pro objekt Countdown
function Countdown(count, xPos, yPos, size){
  // Zavolání rodičovského konstruktoru
  BaseObejct.call(this);
  
  // Výchozí hodnota odpočtu (pokud není zadána, použije se 10)
  this.defaultCount = count ? count : 10;
  
  // Výchozí velikost textu (pokud není zadána, použije se 40)
  this.defaultSize = size ? size : 40;
  
  // Čas vytvoření odpočtu
  this.createdAt = Date.now();
  
  // Nastavení tvaru jako text a definování vlastností textu
  this.status.shape = "text";
  this.status.text = {
    color: { fill: "#123456", stroke: "#ffffff" },
    font: "Arial",
    lineWidth: 10,
    textAlign: "center",
    textBaseline: "middle",
    size: this.defaultSize,
    message: this.defaultCount,
    x: xPos ? xPos : SETTINGS.WIDTH / 2,
    y: yPos ? yPos : SETTINGS.HEIGHT / 2
  };
}

// Dědění z BaseObejct
Countdown.prototype = new BaseObejct();
Countdown.prototype.constructor = Countdown;

// Metoda update pro aktualizaci stavu odpočtu
Countdown.prototype.update = function(room){
  // Výpočet zbývajícího času
  var count = this.defaultCount - Math.floor((Date.now() - this.createdAt) / 1000);
  
  // Aktualizace zprávy a velikosti textu, pokud se změnil zbývající čas
  if(this.status.text.message != count && count >= 0){
    this.status.text.size = this.defaultSize;
    this.status.text.message = count;
  } else {
    // Postupné zmenšování velikosti textu
    this.status.text.size *= 0.997;
  }
  
  // Volání akce po dokončení odpočtu
  if(count < 0){
    this.action(room);
  }
};

// Prázdná metoda action, kterou mohou přepsat potomci
Countdown.prototype.action = function(room){};

// Exportování modulu pro použití v jiných částech aplikace
module.exports = Countdown;
