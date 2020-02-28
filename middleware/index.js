// Import Telegraf components
const Telegraf = require('telegraf');
const { Stage, session } = Telegraf;

// Import time check middleware
const ignoreOldUpdates = require('./ignoreOldUpdates');

// Import Actions (Callback Queries Middleware)
const {
  setupSellProduct,
  setupHome,
  setupFindProductsByCategory,
  setupSearchProduct,
} = require('./actions');

// Import Wizard Scenes
const sellProductWizard = require('../wizards/sellProduct');
const seekItemWizard = require('../wizards/seek');

// Imports Base Scenes
const supportChat = require('../scenes/chat.scene');

// Compose stage with given scenes
const stage = new Stage([supportChat, sellProductWizard, seekItemWizard]);

function setupMiddleware(bot) {
  bot.use(ignoreOldUpdates);
  bot.use(session());
  bot.use(stage.middleware());

  // Handle middlewares for callback_data
  setupHome(bot);
  setupSellProduct(bot);
  setupSearchProduct(bot);
  setupFindProductsByCategory(bot);
}

module.exports = setupMiddleware;
