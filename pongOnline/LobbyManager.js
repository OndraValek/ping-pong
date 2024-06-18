// Konstruktor pro objekt LobbyManager
function LobbyManager(io) {
  // Uchování reference na instanci LobbyManageru
  var LbMg = this;
  
  // Inicializace lobby jako prázdného pole
  LbMg.lobby = [];
  
  // Inicializace stavu aktualizace
  LbMg.updating = false;

  // Metoda pro přidání socketu do lobby
  LbMg.push = function(socket) {
    LbMg.lobby.push(socket);
  };

  // Metoda pro vyhození socketu z lobby
  LbMg.kick = function(socket) {
    var index = LbMg.lobby.indexOf(socket);
    if (index >= 0) LbMg.lobby.splice(index, 1);
  };

  // Metoda pro vyčištění lobby od null hodnot
  LbMg.clean = function() {
    var sockets = LbMg.lobby;
    LbMg.lobby = sockets.filter(function(socket) { return socket !== null; });
  };

  // Metoda pro rozeslání hráčů do herních místností
  LbMg.dispatch = function(RmMg) {
    // Pokud již probíhá rozesílání, tak skončí
    if (LbMg.dispatching) return;
    LbMg.dispatching = true;

    // Rozdělení hráčů do herních místností, dokud je v lobby alespoň 2 hráči
    while (LbMg.lobby.length > 1) {
      var player0 = LbMg.lobby.splice(0, 1); // Odebrání prvního hráče
      var player1 = LbMg.lobby.splice(0, 1); // Odebrání druhého hráče
      RmMg.create(player0[0], player1[0]); // Vytvoření herní místnosti s těmito hráči
    }

    LbMg.dispatching = false;
  };
}

// Exportování modulu pro použití v jiných částech aplikace
module.exports = LobbyManager;
