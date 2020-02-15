const WizardScene = require('telegraf/scenes/wizard');

const {
  askForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
} = require('./steps');

const { SELL_ITEM_WIZARD } = require('../../types/scenes.types');

// A wizard is a special type of scene
const sellItemWizard = new WizardScene(
  // Wizard's name
  SELL_ITEM_WIZARD,
  askForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods
);

sellItemWizard.leave(ctx =>
  ctx.reply(
    'Alla prossima, ricorda di scrivere /start se vuoi iniziare da capo la procedura'
  )
);
module.exports = sellItemWizard;
