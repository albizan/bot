const knex = require('../../db');

function setupApproveCommand(bot) {
  bot.command('approve', async ctx => {
    const { id } = ctx.from;
    if (!process.env.ADMINS.includes(id)) {
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
    const insertionId = reply_to_message.caption.substring(
      // offset + 3 in order to remove '#av'
      entity.offset + 3,
      entity.offset + entity.length
    );

    // Retieve insertion's images from db
    let image_ids, insertion;
    try {
      image_ids = await knex('images')
        .select('file_id')
        .where({ insertion_id: insertionId });
    } catch (error) {
      console.log(error);
      console.log('Cannot retreive images for current insertion');
    }
    // generate again array of inputMediaPhoto to be sent with sendMediaGroup to channel
    const media = image_ids.map(({ file_id }) => {
      return {
        type: 'photo',
        media: file_id,
      };
    });
    media[0].caption = reply_to_message.caption;
    try {
      insertion = await ctx.telegram.sendMediaGroup(
        process.env.CHANNEL_USERNAME,
        media
      );
      // generate url
      const url = `https://t.me/${process.env.CHANNEL_USERNAME.slice(1)}/${
        insertion[0].message_id
      }`;

      // Update dabase with newly created url
      await knex('insertions')
        .where({ id: insertionId })
        .update({ url });

      ctx.reply(url);
    } catch (error) {
      console.log(error);
      ctx.reply(
        'Errore, impossibile inviare il tuo messaggio. Riprova piu tardi'
      );
    }
  });
}

module.exports = setupApproveCommand;
