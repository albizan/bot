const { getUserFromUsername, getValidatedFeedbacksByUser, getUserById, upsert } = require('../../db/helper');
const Markup = require('telegraf/markup');

function setupFeedbackCommand(bot) {
  bot.command('feedback', async ctx => {
    // Get user
    const issuers = await getUserById(ctx.from.id);
    if (issuers.length === 0) {
      ctx.reply(`@${ctx.from.username} non trovato nel database`);
      return;
    }
    const { args } = ctx.state.command;
    let [username, rate, ...text] = args;
    if (!username) {
      console.log('Username not found');
      ctx.reply(
        'Per lasciare un feedback:\n<code>/feedback @nomeutente rating testo_del_feedback</code>\n\nPer vedere i feedback:\n<code>/feedback @nomeutente</code>',
        {
          parse_mode: 'HTML',
        }
      );
      return;
    }
    username = username.startsWith('@') ? username.slice(1) : username;
    const user = await getUserFromUsername(username);
    if (!user) {
      ctx.reply('Utente non trovato');
      return;
    }
    if (args.length === 1) {
      const res = await getValidatedFeedbacksByUser(user.id);
      console.log(res);
      const avg = parseFloat(res[0].avg).toFixed(1);
      const { count } = res[0];
      if (count === 0) {
        ctx.reply(`Utente: @${username}\nNumero di feedback: ${count}`);
        return;
      }
      ctx.reply(`Utente: @${username}\nNumero di feedback: ${count}\nRating:${avg}/5`);
    } else if (args.length === 2) {
    } else {
      rate = parseInt(rate);
      if (isNaN(rate)) {
        console.log('Rate is not a number');
        ctx.reply("Inserisci un voto da 1 a 5 dopo l'username");
        return;
      }
      if (rate > 5 || rate < 0) {
        ctx.reply('Il voto deve essere compreso tra 0 e 5');
        return;
      }
      text = text.join(' ');
      if (!text) {
        ctx.reply('Inserisci un testo');
        return;
      }
      const issuer_id = ctx.from.id;
      let receiver_id;
      try {
        const user = await getUserFromUsername(username);
        if (!user) {
          ctx.reply(`@${username} non trovato nel database`);
          return;
        }
        receiver_id = user.id;
      } catch (error) {
        console.log(error);
        ctx.reply('Errore');
      }

      try {
        const { id, feedback_issuer, feedback_receiver, feedback_rate, feedback_text } = await upsert({
          table: 'feedbacks',
          object: { feedback_receiver: receiver_id, feedback_issuer: issuer_id, feedback_rate: rate, feedback_text: text },
          constraint: '(id)',
        });
        const message = `#FB${id}\nDa: @${ctx.from.username} - ${feedback_issuer}\nA: @${username} - ${feedback_receiver}\nRating: ${feedback_rate}/5\nFeedback: ${feedback_text}`;
        try {
          ctx.telegram.sendMessage(process.env.SECRET_CHAT_ID, message, {
            reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('Approva Feedback', 'approve_feedback')]]),
          });
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
}

module.exports = setupFeedbackCommand;
