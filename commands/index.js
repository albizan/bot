const setupAdministrationCommands = require('./administration');
const setupStartCommand = require('./start');
const setupFeedbackCommand = require('./feedback');

function setupCommands(bot) {
  setupAdministrationCommands(bot);
  setupStartCommand(bot);
  setupFeedbackCommand(bot);
}

module.exports = setupCommands;
