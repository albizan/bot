const Markup = require('telegraf/markup');
const { INSERTION_TYPE_SELECTOR, NEW_INSERTION, SEARCH_INSERTION } = require('../../types/callbacks.types');

function setupInsertionTypeSelector(bot) {
  bot.action(INSERTION_TYPE_SELECTOR, ctx => {
    ctx.reply('<b>Quale tipo di annuncio vuoi fare?</b>', {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton('Annuncio di Vendita', NEW_INSERTION), Markup.callbackButton('Annuncio di Ricerca', SEARCH_INSERTION)],
      ]),
    });
    ctx.answerCbQuery();
  });
}

module.exports = setupInsertionTypeSelector;
