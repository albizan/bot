const WizardScene = require('telegraf/scenes/wizard');
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

const {
  askForCategory,
  confirmCategoryAndAskForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForConditions,
  confirmConditionAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
} = require('./steps');

const { NEW_INSERTION_WIZARD } = require('../../types/scenes.types');

// A wizard is a special type of scene
const newInsertionWizard = new WizardScene(
  // Wizard's name
  NEW_INSERTION_WIZARD,
  // Steps
  askForCategory,
  confirmCategoryAndAskForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForConditions,
  confirmConditionAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods
);

newInsertionWizard.command(['home', 'quit', 'start'], ctx => {
  return ctx.scene.leave();
});

newInsertionWizard.leave(ctx => {
  const { id, first_name } = ctx.from;
  try {
    ctx.telegram.sendMessage(id, getWelcomeMessage(first_name), {
      reply_markup: startMenuMarkup,
      parse_mode: 'HTML',
    });
  } catch (error) {
    logger.error(error);
    return;
  }
});
module.exports = newInsertionWizard;
