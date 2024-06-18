// Konstruktor pro základní objekt
function BaseObject() {
  this.status = {}; // Status objektu, může obsahovat různé vlastnosti a stavové informace
}

// Prázdná metoda update, kterou mohou přepsat potomci
BaseObject.prototype.update = function() {};

// Exportování modulu pro použití v jiných částech aplikace
module.exports = BaseObject;
