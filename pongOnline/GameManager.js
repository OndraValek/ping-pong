// Definice intervalu v milisekundách pro aktualizaci hry
var INTERVAL = 10;

// Konstruktor pro objekt GameManager
function GameManager(io, roomManager) {
  // Uchování reference na instanci GameManageru
  var GmMg = this;

  // Uchování reference na správce místností
  GmMg.RmMg = roomManager;

  // Nastavení intervalu pro aktualizaci stavu hry
  GmMg.update = setInterval(function() {
    // Procházení všech místností
    for (var roomId in GmMg.RmMg.rooms) {
      var room = GmMg.RmMg.rooms[roomId];
      // Spuštění hlavního smyčkového procesu pro každou místnost
      room.loop(room);
    }
  }, INTERVAL);
}

// Exportování modulu pro použití v jiných částech aplikace
module.exports = GameManager;
