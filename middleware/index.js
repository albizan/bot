// Import Telegraf components
const Telegraf = require('telegraf');
const { Stage, session } = Telegraf;

// Import Actions (Callback Queries Middleware)
const { setupSaleProduct } = require('./actions');

// Import Wizard Scenes
const sellProductWizard = require('../wizards/sell');
const seekItemWizard = require('../wizards/seek');

// Imports Base Scenes
const supportChat = require('../scenes/chat.scene');

// Compose stage with given scenes
const stage = new Stage([supportChat, sellProductWizard, seekItemWizard]);

function setupMiddleware(bot) {
  bot.use(session());
  bot.use(stage.middleware());

  // Handle middlewares for callback_data
  setupSaleProduct(bot);
}

module.exports = setupMiddleware;
