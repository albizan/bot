const { filterUpdates, getGoHomeMarkup } = require('../../helper');
const { getFeedbacks, getUserById } = require('../../db/helper');

function askForUsername(ctx) {
  ctx.reply("<b>Inserisci l'username dell'utente</b>", {
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
  return;
}

async function validateUsernameAndGetFeedbacks(ctx) {
  const text = filterUpdates(ctx, 'message');
  if (!text) {
    return;
  }
  const username = text.startsWith('@') ? text.slice(1) : text;
  const feedbacks = await getFeedbacks(username);
  const message = await buildMessageWithFeedbacks(feedbacks);
  ctx.reply(message, {
    reply_markup: getGoHomeMarkup(),
  });
  ctx.wizard.next();
}

function goHome(ctx) {
  filterUpdates(ctx, 'callback_query');
}

async function buildMessageWithFeedbacks(feedbacks) {
  let message = '';
  for (feedback of feedbacks) {
    const { feedback_issuer, feedback_text, feedback_rate } = feedback;
    const { username } = await getUserById(feedback_issuer);
    message = message + `Da: @${username}\nRate: ${feedback_rate}/5\nFeedback: ${feedback_text}\n\n`;
  }
  return message;
}

module.exports = {
  askForUsername,
  validateUsernameAndGetFeedbacks,
  goHome,
};
