function setupUnmuteCommand(bot) {
  bot.command('unmute', ctx => {
    const { id } = ctx.from;
    if (!process.env.ADMINS.includes(id)) {
      return;
    }

    // If admin specifies the id with command /unmute 123456789
    if (!ctx.message.reply_to_message) {
      const idToUnmute = ctx.message.text.split(' ')[1];
      if (!idToUnmute) {
        return;
      }
      knex('users')
        .where({ id: idToUnmute })
        .then(rows => {
          if (rows.length === 0) {
            ctx.reply('Non è stato trovato nessun utente');
          } else {
            knex('users')
              .where({ id: idToUnmute })
              .update({ muted: false })
              .then(() => {
                try {
                  ctx.reply(`L'utente con id ${idToUnmute} è stato smutato`);
                } catch (error) {
                  ctx.reply('Impossibile inviare messaggio');
                }
              });
          }
        });
      return;
    }
    const { forward_from } = ctx.message.reply_to_message;
    if (!forward_from) {
      ctx.reply(
        "Impossibile ottenere l'id dell'utente, smutare manualmente l'utente con il comando /unmute id_utente"
      );
    }
    if (forward_from) {
      const { id } = forward_from;
      knex('users')
        .where({ id })
        .update({ muted: 'false' })
        .then(() => {
          logger.info(`${id} è stato smutato`);
          ctx.reply(`${id} è stato smutato`);
        })
        .catch(err => logger.error(err));
    }
  });
}

module.exports = setupUnmuteCommand;
