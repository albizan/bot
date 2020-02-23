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
} = require('../../types/callbacks.types');

function setupFindProductsByCategory(bot) {
  bot.action(
    // Triggers
    [CPU, GPU, RAM, MOBO, PSU, STORAGE, CASE, PERIPHERALS, COMPLETE_PC, OTHER],
    async ctx => {
      const trigger = ctx.match;
      ctx.answerCbQuery();
      const result = await knex('insertions')
        .select('product', 'url')
        .whereNotNull('url')
        .where({ category: trigger });

      const productsAsButtons = result.map(row => [
        Markup.urlButton(`${row.product}`, row.url),
      ]);

      if (productsAsButtons.length === 0) {
        ctx.reply(`Nessun annuncio trovato per ${trigger}`);
      } else {
        ctx.reply(`Prodotti attualmente in vendita per categoria: ${trigger}`, {
          reply_markup: Markup.inlineKeyboard(productsAsButtons),
        });
      }
    }
  );
}

module.exports = setupFindProductsByCategory;
