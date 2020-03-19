const setupHome = require('./home');
const setupNewInsertion = require('./newInsertion');
const setupNewSearchInsertion = require('./newSearchInsertion');
const setupInsertionTypeSelector = require('./insertionTypeSelector');
const setupSearchInsertionByCategory = require('./searchInsertionByCategory');
const setupBotInfo = require('./botInfo');
const setupReplyToAdmins = require('./replyToAdmins');
const setupManageInsertions = require('./manageInsertions');
const setupValidateFeedback = require('./validateFeedback');
const setupSearchFeedback = require('./searchFeedback');

const setupActions = bot => {
  setupHome(bot);
  setupInsertionTypeSelector(bot);
  setupNewInsertion(bot);
  setupNewSearchInsertion(bot);
  setupSearchInsertionByCategory(bot);
  setupBotInfo(bot);
  setupReplyToAdmins(bot);
  setupManageInsertions(bot);
  setupValidateFeedback(bot);
  setupSearchFeedback(bot);
};

module.exports = setupActions;
