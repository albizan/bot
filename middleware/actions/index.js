const setupHome = require('./home');
const setupSellProduct = require('./sellProduct.js');
const setupSearchProduct = require('./searchProduct.js');
const setupFindProductsByCategory = require('./findProductByCategory');

const setupActions = bot => {
  setupHome(bot);
  setupSellProduct(bot);
  setupSearchProduct(bot);
  setupFindProductsByCategory(bot);
};

module.exports = setupActions;
