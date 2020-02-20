const {
  setupApproveCommand,
  setupMuteCommand,
  setupUnmuteCommand,
} = require('./administration');
const setupStartCommand = require('./start');

function setupAdministrationCommands(bot) {
  setupApproveCommand(bot);
  setupMuteCommand(bot);
  setupUnmuteCommand(bot);
}

function setupBaseCommands(bot) {
  setupStartCommand(bot);
}

function setupCommands(bot) {
  setupAdministrationCommands(bot);
  setupBaseCommands(bot);
}

module.exports = setupCommands;
