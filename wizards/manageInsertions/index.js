const WizardScene = require('telegraf/scenes/wizard');
const { MANAGE_INSERTIONS_WIZARD } = require('../../types/scenes.types');
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

// Import Steps
const { showInsertions, manageInsertion } = require('./steps');

const manageInsertionsWizard = new WizardScene(MANAGE_INSERTIONS_WIZARD, showInsertions, manageInsertion);

manageInsertionsWizard.command(['quit, home', 'start'], ctx => {
  ctx.scene.leave();
});

manageInsertionsWizard.leave(ctx => {
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
module.exports = manageInsertionsWizard;
