// Import types
const { BOT_INFO } = require('../../types/callbacks.types');

function setupBotInfo(bot) {
  bot.action(BOT_INFO, ctx => {
    ctx.answerCbQuery();
    ctx.telegram.sendMessage(
      ctx.from.id,
      '<b>Bot written in Javascript - runtime nodejs 12.16.1. Hosted on Docker container on Scaleway VPS</b>\n\n<code>Coded by @Angry_Weasel\nTested by @AlexUpdating</code>',
      {
        parse_mode: 'HTML',
      }
    );
  });
}

module.exports = setupBotInfo;
