const WizardScene = require('telegraf/scenes/wizard');
const {
  SEARCH_INSERTION_BY_CATEGORY_WIZARD,
} = require('../../types/scenes.types');

const searchInsertionByCategoryWizard = new WizardScene(
  SEARCH_INSERTION_BY_CATEGORY_WIZARD,
  ctx => {
    ctx.reply(SEARCH_INSERTION_BY_CATEGORY_WIZARD);
    ctx.scene.leave();
  }
);

module.exports = searchInsertionByCategoryWizard;
