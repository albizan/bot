const setupHome = require('./home');
const setupNewInsertion = require('./sellProduct.js');
const setupSearchInsertionByCategory = require('./searchInsertionByCategory');
const setupBotInfo = require('./botInfo');

const setupActions = bot => {
  setupHome(bot);
  setupNewInsertion(bot);
  setupSearchInsertionByCategory(bot);
  setupBotInfo(bot);
};

module.exports = setupActions;
