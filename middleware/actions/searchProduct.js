const Markup = require('telegraf/markup');

// Import types
const {
  SEARCH_PRODUCT,
  CPU,
  GPU,
  RAM,
  MOBO,
  PSU,
  STORAGE,
  CASE,
  PERIPHERALS,
  COMPLETE_PC,
  OTHER,
} = require('../../types/callbacks.types');

function setupSearchProduct(bot) {
  bot.action(SEARCH_PRODUCT, ctx => {
    ctx.answerCbQuery();
    ctx.reply('Seleziona la Categoria', {
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton(CPU, CPU), Markup.callbackButton(GPU, GPU)],
        [Markup.callbackButton(RAM, RAM), Markup.callbackButton(MOBO, MOBO)],
        [
          Markup.callbackButton(PSU, PSU),
          Markup.callbackButton(STORAGE, STORAGE),
        ],
        [
          Markup.callbackButton(CASE, CASE),
          Markup.callbackButton(PERIPHERALS, PERIPHERALS),
        ],
        [Markup.callbackButton(COMPLETE_PC, COMPLETE_PC)],
        [Markup.callbackButton(OTHER, OTHER)],
      ])
        .oneTime()
        .resize(),
    });
  });
}

module.exports = setupSearchProduct;
