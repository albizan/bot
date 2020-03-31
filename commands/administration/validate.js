const knex = require('../../db');
const { saveImagesIds, retreiveInsertionById } = require('../../db/helper');

function setupValidateCommand(bot) {
  bot.command('validate', async ctx => {
    const { id } = ctx.from;
    if (!process.env.ADMINS.includes(id)) {
      ctx.reply('Non sei admin');
      return;
    }

    let [insertion_id] = ctx.state.command.args;
    if (!insertion_id) {
      ctx.reply('Argomento AVX non trovato');
      return;
    }
    if (insertion_id.startsWith('#')) {
      insertion_id = insertion_id.slice(1);
    }
    // This removes av and gives only the id
    insertion_id = parseInt(insertion_id.slice(2));

    // Retieve insertion's images from db
    let image_ids, insertion;
    try {
      image_ids = await knex('images')
        .select('file_id')
        .where({ insertion_id });
    } catch (error) {
      console.log(error);
      console.log('Cannot retreive images for current insertion');
    }

    insertion = await retreiveInsertionById(insertion_id);

    try {
      // generate again array of inputMediaPhoto to be sent with sendMediaGroup to channel
      const media = image_ids.map(({ file_id }) => {
        return {
          type: 'photo',
          media: file_id,
        };
      });
      if (media[0]) {
        media[0].caption = insertion.caption;
      }

      // Insertion is a list of messages
      insertion = await ctx.telegram.sendMediaGroup(process.env.CHANNEL_USERNAME, media);
      // generate url of first message in media group
      const url = `https://t.me/${process.env.CHANNEL_USERNAME.slice(1)}/${insertion[0].message_id}`;

      // Save all images_id composing media group
      try {
        saveImagesIds(insertion, insertion_id);
      } catch (error) {
        console.log(error);
      }

      // Update dabase with newly created url
      await knex('insertions')
        .where({ id: insertion_id })
        .update({ url });

      ctx.reply(url);
    } catch (error) {
      console.log(error);
      ctx.reply('Errore, impossibile inviare il tuo messaggio. Riprova piu tardi');
    }
  });
}

module.exports = setupValidateCommand;
