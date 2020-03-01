// Import types
const { BOT_INFO } = require('../../types/callbacks.types');

function setupBotInfo(bot) {
  bot.action(BOT_INFO, ctx => {
    ctx.answerCbQuery();
    ctx.telegram.sendMessage(
      ctx.from.id,
      '<b>Bot written in Ecmascript 2017 (ES8) - runtime nodejs 12.16.1. Hosted on Docker container on Scaleway VPS</b>\n\n<i>Coded bt <b>@Angry_Weasel</b>\nTested by @AlexUpdating</i>',
      {
        parse_mode: 'HTML',
      }
    );
  });
}

module.exports = setupBotInfo;
