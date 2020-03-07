const knex = require('../../db');
const { saveImagesIds } = require('../../db/helper');

function setupApproveCommand(bot) {
  bot.command('approve', async ctx => {
    const { id } = ctx.from;
    if (!process.env.ADMINS.includes(id)) {
      ctx.reply('Non sei admin');
      return;
    }

    const { reply_to_message } = ctx.message;
    if (!reply_to_message) {
      ctx.reply('Questo comando deve essere usato come risposta ad un annuncio');
      return;
    }

    if (!reply_to_message.caption) {
      ctx.reply('Questo comando deve essere usato come risposta ad un annuncio');
      return;
    }
    // Get announce id from caption's entities
    let entities = reply_to_message.caption_entities;

    //Filter hashtag
    entities = entities.filter(entity => entity.type === 'hashtag');
    const insertionIdEntity = entities[1];
    const insertionId = reply_to_message.caption.substring(
      // offset + 3 in order to remove '#av'
      insertionIdEntity.offset + 3,
      insertionIdEntity.offset + insertionIdEntity.length
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

    try {
      // generate again array of inputMediaPhoto to be sent with sendMediaGroup to channel
      const media = image_ids.map(({ file_id }) => {
        return {
          type: 'photo',
          media: file_id,
        };
      });
      if (media[0]) {
        media[0].caption = reply_to_message.caption;
      }

      // Insertion is a list of messages
      insertion = await ctx.telegram.sendMediaGroup(process.env.CHANNEL_USERNAME, media);
      // generate url of first message in media group
      const url = `https://t.me/${process.env.CHANNEL_USERNAME.slice(1)}/${insertion[0].message_id}`;

      // Save all images_id composing media group
      try {
        saveImagesIds(insertion, insertionId);
      } catch (error) {
        console.log(error);
      }

      // Update dabase with newly created url
      await knex('insertions')
        .where({ id: insertionId })
        .update({ url });

      ctx.reply(url);
    } catch (error) {
      console.log(error);
      ctx.reply('Errore, impossibile inviare il tuo messaggio. Riprova piu tardi');
    }
  });
}

module.exports = setupApproveCommand;
