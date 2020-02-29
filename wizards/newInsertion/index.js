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

sellProductWizard.leave(ctx => {
  try {
    ctx.telegram.sendMessage(
      ctx.from.id,
      `Ciao <b>${ctx.from.first_name}</b>\n\nBenvenuto nel BOT ufficiale del gruppo <a href="https://t.me/joinchat/BUc_2U-1GRQClo4MllBuFA">MIT - Mercatino Informatica e Tecnologia</a>\n\nTi ricordo che in qualunque momento puoi inviare il comando /home per aprire il <i>Menu Principale</i>\nQuesto bot ti permette di creare annunci di vendita per le tue componenti informatiche e non solo. Tutti gli annunci, prima di essere pubblicati sul canale ufficiale @mitvendita, verranno valutati ed eventualmente approvati dallo <b>STAFF</b>`,
      {
        reply_markup: startMenuMarkup,
        parse_mode: 'HTML',
      }
    );
  } catch (error) {
    ctx.reply(error.message);
    return;
  }
});
module.exports = sellProductWizard;
