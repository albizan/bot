const setupAdministrationCommands = require('./administration');
const setupStartCommand = require('./start');

function setupCommands(bot) {
  setupAdministrationCommands(bot);
  setupStartCommand(bot);
}

module.exports = setupCommands;
