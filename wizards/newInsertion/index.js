const WizardScene = require('telegraf/scenes/wizard');
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

const {
  askForCategory,
  validateCategoryAndAskForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForConditions,
  confirmConditionAndAskForLocation,
  validateLocation,
  confirmLocationAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndSelectShippingCosts,
  shippingCostsConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
  goHome,
} = require('./steps');

const { NEW_INSERTION_WIZARD } = require('../../types/scenes.types');

// A wizard is a special type of scene
const newInsertion = new WizardScene(
  // Wizard's name
  NEW_INSERTION_WIZARD,
  // Steps
  askForCategory,
  validateCategoryAndAskForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForConditions,
  confirmConditionAndAskForLocation,
  validateLocation,
  confirmLocationAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndSelectShippingCosts,
  shippingCostsConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
  goHome
);

newInsertion.command(['home', 'quit', 'start'], ctx => {
  return ctx.scene.leave();
});

newInsertion.leave(ctx => {
  const { id, first_name } = ctx.from;
  try {
    ctx.telegram.sendMessage(id, getWelcomeMessage(first_name), {
      reply_markup: startMenuMarkup,
      parse_mode: 'HTML',
    });
  } catch (error) {
    logger.error(error);
  }
});

module.exports = newInsertion;
