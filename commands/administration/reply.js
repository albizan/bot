const knex = require('../../db');

const setupReplyCommand = bot => {
  bot.command('rispondi', async ctx => {
    const { id } = ctx.from;
    if (!process.env.ADMINS.includes(id)) {
      ctx.reply('Non sei un admin');
      return;
    }
    let [username, ...rest] = ctx.state.command.args;
    const message = rest.join(' ');
    let userId;

    if (!username) {
      ctx.reply('Comando con argomenti non validi');
      return;
    }
    if (!message) {
      ctx.reply("Scrivi il messaggio dopo l'username");
      return;
    }
    try {
      console.log('DB');
      const res = await knex('users')
        .select('id')
        .where({ username })
        .first();
      if (!res) {
        ctx.reply('Utente non trovato');
        return;
      }
      userId = res.id;
    } catch (error) {
      console.log(error);
      ctx.reply(error.message);
    }
    try {
      console.log('Sending...');
      await ctx.telegram.sendMessage(userId, `<b>DA STAFF:</b>\n\n${message}`, {
        parse_mode: 'HTML',
      });
      ctx.reply('Il tuo messaggio è stato inviato');
    } catch (error) {
      console.log(error);
      ctx.reply('Messaggio NON inviato');
      ctx.reply(error.message);
      return;
    }
  });
};

module.exports = setupReplyCommand;
