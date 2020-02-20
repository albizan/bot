function setupApproveCommand(bot) {
  bot.command('approve', async ctx => {
    const { id } = ctx.from;
    if (!admins.includes(id)) {
      return;
    }

    const { reply_to_message } = ctx.message;
    if (!reply_to_message) {
      ctx.reply(
        'Questo comando deve essere usato come risposta ad un annuncio'
      );
      return;
    }

    if (!reply_to_message.caption) {
      return;
    }
    // Get announce id from caption's entities
    const entity = reply_to_message.caption_entities[2];
    const announceId = reply_to_message.caption.substring(
      // offset + 2 in order to remove '#av'
      entity.offset + 3,
      entity.offset + entity.length
    );

    // Retieve images of the sale announce from the database
    let image_ids, saleAnnounce;
    try {
      const result = await knex('sale_announcements')
        .select('images')
        .first()
        .where({ id: announceId });
      image_ids = result.images.split(',');
    } catch (error) {
      console.log('Cannot retreive images for current announce');
    }
    // generate again array of inputMediaPhoto to be sent with sendMediaGroup to channel
    const media = image_ids.map(file_id => {
      return {
        type: 'photo',
        media: file_id,
      };
    });
    media[0].caption = reply_to_message.caption;
    try {
      saleAnnounce = await ctx.telegram.sendMediaGroup(
        process.env.CHANNEL_USERNAME,
        media
      );
      // generate url
      const url = `https://t.me/${process.env.CHANNEL_USERNAME.slice(1)}/${
        saleAnnounce[0].message_id
      }`;

      await knex('sale_announcements')
        .where({ id: announceId })
        .update({ url });

      // Update dabase with newly created url
      ctx.reply(url);
    } catch (error) {
      console.log(error);
      ctx.reply(
        'Errore, impossibile inviare il tuo messaggio. Riprova piu tardi'
      );
      ctx.reply(error.message);
      return ctx.scene.leave();
    }
  });
}

module.exports = setupApproveCommand;
