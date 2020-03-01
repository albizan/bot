const WizardScene = require('telegraf/scenes/wizard');
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

const {
  askForCategory,
  confirmCategoryAndAskForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
} = require('./steps');

const { SELL_PRODUCT_WIZARD } = require('../../types/scenes.types');

// A wizard is a special type of scene
const sellProductWizard = new WizardScene(
  // Wizard's name
  SELL_PRODUCT_WIZARD,
  // Steps
  askForCategory,
  confirmCategoryAndAskForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods
);

sellProductWizard.command(['home', 'quit', 'start'], ctx => {
  return ctx.scene.leave();
});

sellProductWizard.leave(ctx => {
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
module.exports = sellProductWizard;
