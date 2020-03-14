const setupHome = require('./home');
const setupNewInsertion = require('./newInsertion');
const setupNewSearchInsertion = require('./newSearchInsertion');
const setupInsertionTypeSelector = require('./insertionTypeSelector');
const setupSearchInsertionByCategory = require('./searchInsertionByCategory');
const setupBotInfo = require('./botInfo');
const setupReplyToAdmins = require('./replyToAdmins');
const setupManageInsertions = require('./manageInsertions');

const setupActions = bot => {
  setupHome(bot);
  setupInsertionTypeSelector(bot);
  setupNewInsertion(bot);
  setupNewSearchInsertion(bot);
  setupSearchInsertionByCategory(bot);
  setupBotInfo(bot);
  setupReplyToAdmins(bot);
  setupManageInsertions(bot);
};

module.exports = setupActions;
