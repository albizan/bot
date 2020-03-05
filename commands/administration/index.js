const setupApproveCommand = require('./approve.js');
const setupDeleteCommand = require('./delete.js');
const setupMuteCommand = require('./mute.js');
const setupUnmuteCommand = require('./unmute.js');

function setupAdministrationCommands(bot) {
  setupApproveCommand(bot);
  setupMuteCommand(bot);
  setupUnmuteCommand(bot);
  setupDeleteCommand(bot);
}

module.exports = setupAdministrationCommands;
