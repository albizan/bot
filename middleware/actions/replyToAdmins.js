// Import types
const { REPLY_TO_ADMINS } = require('../../types/callbacks.types');
const { REPLY_TO_ADMINS_WIZARD } = require('../../types/scenes.types');

function setupReplyToAdmins(bot) {
  bot.action(REPLY_TO_ADMINS, ctx => {
    ctx.answerCbQuery();
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.scene.enter(REPLY_TO_ADMINS_WIZARD);
  });
}

module.exports = setupReplyToAdmins;
