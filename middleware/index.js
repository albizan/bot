// Import Telegraf components
const Telegraf = require('telegraf');
const { Stage, session } = Telegraf;

// Import time check middleware
const ignoreOldUpdates = require('./ignoreOldUpdates');

// Import command parser
const commandParser = require('./commandParser');

// Import Actions (Callback Queries Middleware)
const setupActions = require('./actions');

// Import Wizard Scenes
const newInsertionWizard = require('../wizards/newInsertion');
const searchInsertionByCategory = require('../wizards/searchInsertionByCategory');
const replyToAdminsWizard = require('../wizards/replyToAdmins');
const manageInsertions = require('../wizards/manageInsertions');

// Compose stage with given scenes
const stage = new Stage([newInsertionWizard, searchInsertionByCategory, replyToAdminsWizard, manageInsertions]);

function setupMiddleware(bot) {
  bot.use(ignoreOldUpdates);
  bot.use(session());
  bot.use(commandParser);
  // This has to come before commands setup to avoid bot commands to override wizard specific commands
  bot.use(stage.middleware());

  // Handle middlewares for callback_data also known as actions
  setupActions(bot);
}

module.exports = setupMiddleware;
