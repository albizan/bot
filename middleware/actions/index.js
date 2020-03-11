const setupHome = require('./home');
const setupNewInsertion = require('./newInsertion');
const setupSearchInsertionByCategory = require('./searchInsertionByCategory');
const setupBotInfo = require('./botInfo');
const setupReplyToAdmins = require('./replyToAdmins');
const setupManageInsertions = require('./manageInsertions');

const setupActions = bot => {
  setupHome(bot);
  setupNewInsertion(bot);
  setupSearchInsertionByCategory(bot);
  setupBotInfo(bot);
  setupReplyToAdmins(bot);
  setupManageInsertions(bot);
};

module.exports = setupActions;
