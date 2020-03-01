const setupHome = require('./home');
const setupNewInsertion = require('./sellProduct.js');
const setupSearchProduct = require('./searchProduct.js');
const setupFindProductsByCategory = require('./findProductByCategory');
const setupBotInfo = require('./botInfo');

const setupActions = bot => {
  setupHome(bot);
  setupNewInsertion(bot);
  setupSearchProduct(bot);
  setupFindProductsByCategory(bot);
  setupBotInfo(bot);
};

module.exports = setupActions;
