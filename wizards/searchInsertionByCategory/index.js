const WizardScene = require('telegraf/scenes/wizard');
const { SEARCH_INSERTION_BY_CATEGORY_WIZARD } = require('../../types/scenes.types');
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

// Import Steps
const { askForCategory, showInsertions } = require('./steps');

const searchInsertionByCategoryWizard = new WizardScene(
  SEARCH_INSERTION_BY_CATEGORY_WIZARD,
  askForCategory,
  showInsertions
);

searchInsertionByCategoryWizard.command(['quit, home'], ctx => {
  ctx.scene.leave();
});

searchInsertionByCategoryWizard.leave(ctx => {
  const { id, first_name } = ctx.from;
  try {
    ctx.telegram.sendMessage(id, getWelcomeMessage(first_name), {
      reply_markup: startMenuMarkup,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = searchInsertionByCategoryWizard;
