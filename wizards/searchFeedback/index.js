const WizardScene = require('telegraf/scenes/wizard');
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');
const { SEARCH_FEEDBACK_WIZARD } = require('../../types/scenes.types');
const { askForUsername, validateUsernameAndGetFeedbacks, goHome } = require('./steps');

const searchFeedback = new WizardScene(SEARCH_FEEDBACK_WIZARD, askForUsername, validateUsernameAndGetFeedbacks, goHome);

searchFeedback.command(['quit, home', 'start'], ctx => {
  ctx.scene.leave();
});

searchFeedback.leave(ctx => {
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

module.exports = searchFeedback;
