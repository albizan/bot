// Import Telegraf components
const Telegraf = require('telegraf');
const { Stage, session } = Telegraf;

// Import Actions (Callback Queries Middleware)
const { setupSellProduct } = require('./actions');
const { setupSearchProduct } = require('./actions');
const { setupFindProductsByCategory } = require('./actions');

// Import Wizard Scenes
const sellProductWizard = require('../wizards/sellProduct');
const seekItemWizard = require('../wizards/seek');

// Imports Base Scenes
const supportChat = require('../scenes/chat.scene');

// Compose stage with given scenes
const stage = new Stage([supportChat, sellProductWizard, seekItemWizard]);

function setupMiddleware(bot) {
  bot.use(session());
  bot.use(stage.middleware());

  // Handle middlewares for callback_data
  setupSellProduct(bot);
  setupSearchProduct(bot);
  setupFindProductsByCategory(bot);
}

module.exports = setupMiddleware;