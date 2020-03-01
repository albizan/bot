const Markup = require('telegraf/markup');
const {
  SEARCH_INSERTION_BY_CATEGORY_WIZARD,
} = require('../../types/scenes.types');

const logger = require('../../logger');

// Import types
const {
  SEARCH_INSERTION_BY_CATEGORY,
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

function setupSearchInsertionByCategory(bot) {
  bot.action(SEARCH_INSERTION_BY_CATEGORY, ctx => {
    logger.info(`${SEARCH_INSERTION_BY_CATEGORY} CallbackQuery Button Pressed`);
    ctx.answerCbQuery();
    ctx.scene.enter(SEARCH_INSERTION_BY_CATEGORY_WIZARD);

    /*ctx.reply('Seleziona la Categoria', {
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
    });*/
  });
}

module.exports = setupSearchInsertionByCategory;
