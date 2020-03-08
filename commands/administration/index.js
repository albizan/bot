const setupApproveCommand = require('./approve.js');
const setupDeleteCommand = require('./delete.js');
const setupMuteCommand = require('./mute.js');
const setupUnmuteCommand = require('./unmute.js');
const setupReplyCommand = require('./reply');
const setupStatsCommand = require('./stats');

function setupAdministrationCommands(bot) {
  setupApproveCommand(bot);
  setupMuteCommand(bot);
  setupUnmuteCommand(bot);
  setupDeleteCommand(bot);
  setupReplyCommand(bot);
  setupStatsCommand(bot);
}

module.exports = setupAdministrationCommands;
