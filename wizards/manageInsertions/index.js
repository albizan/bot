const WizardScene = require('telegraf/scenes/wizard');
const { MANAGE_INSERTIONS_WIZARD } = require('../../types/scenes.types');
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

// Import Steps
const { showInsertions, manageInsertion } = require('./steps');

const manageInsertions = new WizardScene(MANAGE_INSERTIONS_WIZARD, showInsertions, manageInsertion);

manageInsertions.command(['quit, home', 'start'], ctx => {
  ctx.scene.leave();
});

manageInsertions.leave(ctx => {
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
module.exports = manageInsertions;
