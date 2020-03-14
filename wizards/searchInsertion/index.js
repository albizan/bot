const WizardScene = require('telegraf/scenes/wizard');

const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

const {
  askForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForPrice,
  priceValidation,
  priceConfirmationAndHandleSending,
  goHome,
} = require('./steps');

const { SEARCH_ITEM_WIZARD } = require('../../types/scenes.types');

// A wizard is a special type of scene
const searchInsertion = new WizardScene(
  // Wizard's name
  SEARCH_ITEM_WIZARD,
  askForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForPrice,
  priceValidation,
  priceConfirmationAndHandleSending,
  goHome
);

searchInsertion.command(['home', 'quit', 'start'], ctx => {
  return ctx.scene.leave();
});

searchInsertion.leave(ctx => {
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
module.exports = searchInsertion;
