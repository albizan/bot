// Import Markup
const Markup = require('telegraf/markup');

// Import Database
const knex = require('../../db');

// Import types
const {
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
  HOME,
  SEARCH_INSERTION,
} = require('../../types/callbacks.types');

function setupFindProductsByCategory(bot) {
  bot.action(
    // Triggers
    [CPU, GPU, RAM, MOBO, PSU, STORAGE, CASE, PERIPHERALS, COMPLETE_PC, OTHER],
    async ctx => {
      const trigger = ctx.match;
      ctx.answerCbQuery();
      ctx.deleteMessage(ctx.update.callback_query.message.message_id);
      const result = await knex('insertions')
        .select('product', 'url')
        .whereNotNull('url')
        .where({ category: trigger });

      const productsAsButtons = result.map(row => [
        Markup.urlButton(`${row.product}`, row.url),
      ]);

      if (productsAsButtons.length === 0) {
        await ctx.reply(`${trigger}: nessun prodotto attualmente in vendita`);
        ctx.reply('Seleziona una opzione', {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton('Indietro', SEARCH_INSERTION),
              Markup.callbackButton(`Home`, HOME),
            ],
          ]).resize(),
        });
      } else {
        await ctx.reply(`Prodotti attualmente in vendita`, {
          reply_markup: Markup.inlineKeyboard(productsAsButtons),
        });
        ctx.reply('Seleziona una opzione', {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton('Indietro', SEARCH_INSERTION),
              Markup.callbackButton(`Home`, HOME),
            ],
          ]).resize(),
        });
      }
    }
  );
}

module.exports = setupFindProductsByCategory;
