function setupMuteCommand(bot) {
  bot.command('mute', ctx => {
    const { id } = ctx.from;
    if (!admins.includes(id)) {
      return;
    }
    // If admin specifies the id with command /mute 123456789
    if (!ctx.message.reply_to_message) {
      const idToMute = ctx.message.text.split(' ')[1];
      if (!idToMute) {
        return;
      }
      knex('users')
        .where({ id: idToMute })
        .then(rows => {
          if (rows.length === 0) {
            ctx.reply('Non è stato trovato nessun utente');
          } else {
            knex('users')
              .where({ id: idToMute })
              .update({ muted: true })
              .then(() => {
                logger.info(`${id} is now muted`);
                try {
                  ctx.reply(`L'utente con id ${idToMute} è stato mutato`);
                  ctx.telegram.sendMessage(
                    idToMute,
                    '<b>Da questo momento non potrai piu inviare messaggi agli admin</b>',
                    {
                      parse_mode: 'HTML',
                      reply_markup: startMenuMarkup,
                    }
                  );
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
        "Impossibile ottenere l'id dell'utente, mutare manualmente l'utente con il comando /mute id_utente"
      );
    }
    if (forward_from) {
      const { id } = forward_from;
      knex('users')
        .where({ id })
        .update({ muted: 'true' })
        .then(() => {
          logger.info(`${id} is now muted`);
          try {
            ctx.reply(`${id} è stato mutato`);
            ctx.telegram.sendMessage(
              id,
              '<b>Da questo momento non potrai piu inviare messaggi agli admin</b>',
              {
                parse_mode: 'HTML',
                reply_markup: startMenuMarkup,
              }
            );
          } catch (error) {
            ctx.reply('Impossibile inviare messaggio');
          }
        })
        .catch(err => logger.error(err));
    }
  });
}

module.exports = setupMuteCommand;
