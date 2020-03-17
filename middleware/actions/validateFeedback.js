// Import types
const { validateFeedback } = require('../../db/helper');

function setupValidateFeedback(bot) {
  bot.action('approve_feedback', async ctx => {
    ctx.answerCbQuery();
    const id = getFeedbackId(ctx);
    const res = await validateFeedback(id);
    if (res) {
      ctx.reply('Feedback approvato');
    }
  });
}

function getFeedbackId(ctx) {
  const { text } = ctx.callbackQuery.message;
  const entities = ctx.callbackQuery.message.entities;
  const id_entity = entities[0];
  return text.slice(3, id_entity.length);
}

module.exports = setupValidateFeedback;
