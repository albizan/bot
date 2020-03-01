const setupHome = require('./home');
const setupNewInsertion = require('./sellProduct.js');
const setupSearchInsertionByCategory = require('./searchInsertionByCategory');
const setupFindProductsByCategory = require('./findProductByCategory');
const setupBotInfo = require('./botInfo');

const setupActions = bot => {
  setupHome(bot);
  setupNewInsertion(bot);
  setupSearchInsertionByCategory(bot);
  setupFindProductsByCategory(bot);
  setupBotInfo(bot);
};

module.exports = setupActions;
