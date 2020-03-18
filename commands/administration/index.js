const setupApproveCommand = require('./approve.js');
const setupDeleteCommand = require('./delete.js');
const setupReplyCommand = require('./reply');
const setupStatsCommand = require('./stats');

function setupAdministrationCommands(bot) {
  setupApproveCommand(bot);
  setupDeleteCommand(bot);
  setupReplyCommand(bot);
  setupStatsCommand(bot);
}

module.exports = setupAdministrationCommands;
