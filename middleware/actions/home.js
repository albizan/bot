// Import types
const { HOME } = require('../../types/callbacks.types');

// Import Markup
const { startMenuMarkup, getWelcomeMessage } = require('../../helper');

function setupHome(bot) {
  bot.action(HOME, ctx => {
    ctx.answerCbQuery();
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    const { id, first_name } = ctx.from;
    try {
      ctx.telegram.sendMessage(id, getWelcomeMessage(first_name), {
        reply_markup: startMenuMarkup,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.log(error);
      ctx.reply('Si è verificato un errore improvviso');
      return;
    }
  });
}

module.exports = setupHome;
