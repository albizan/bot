const setupApproveCommand = require('./approve.js');
const setupDeleteCommand = require('./delete.js');
const setupReplyCommand = require('./reply');
const setupStatsCommand = require('./stats');
const setupValidateCommand = require('./validate');

function setupAdministrationCommands(bot) {
  setupApproveCommand(bot);
  setupDeleteCommand(bot);
  setupReplyCommand(bot);
  setupStatsCommand(bot);
  setupValidateCommand(bot);
}

module.exports = setupAdministrationCommands;
