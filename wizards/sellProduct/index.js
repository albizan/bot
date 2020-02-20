const WizardScene = require('telegraf/scenes/wizard');
const { startMenuMarkup } = require('../../helper');

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

sellProductWizard.leave(ctx =>
  ctx.reply('Benvenuto nel mercatino', { reply_markup: startMenuMarkup })
);
module.exports = sellProductWizard;
