// Import types
const { HOME } = require('../../types/callbacks.types');

// Import Markup
const { startMenuMarkup } = require('../../helper');

function setupHome(bot) {
  bot.action(HOME, ctx => {
    ctx.answerCbQuery();
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    const { id, first_name } = ctx.from;
    try {
      ctx.telegram.sendMessage(
        id,
        `Ciao <b>${first_name}</b>\n\nBenvenuto nel mercatino del gruppo <i>"PC Building Italia"</i>`,
        {
          reply_markup: startMenuMarkup,
          parse_mode: 'HTML',
        }
      );
    } catch (error) {
      console.log(error);
      ctx.reply(
        'Sono un BOT, non posso contattarti in privato se prima non vai su @nas_bot_test e clicchi su avvia'
      );
      return;
    }
  });
}

module.exports = setupHome;
