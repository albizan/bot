const {
  setupApproveCommand,
  setupMuteCommand,
  setupUnmuteCommand,
} = require('./administration');

function setupAdministrationCommands(bot) {
  setupApproveCommand(bot);
  setupMuteCommand(bot);
  setupUnmuteCommand(bot);
}

module.exports = {
  setupAdministrationCommands,
};
