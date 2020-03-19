// Import types
const { SEARCH_FEEDBACK } = require('../../types/callbacks.types');
const { SEARCH_FEEDBACK_WIZARD } = require('../../types/scenes.types');

function setupReplyToAdmins(bot) {
  bot.action(SEARCH_FEEDBACK, ctx => {
    ctx.answerCbQuery();
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.scene.enter(SEARCH_FEEDBACK_WIZARD);
  });
}

module.exports = setupReplyToAdmins;
