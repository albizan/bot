const Telegraf = require('telegraf');
const knex = require('./db');

// Import command setups
const setupCommands = require('./commands');

// Import middleware setups
const setupMiddleware = require('./middleware');

// Create BOT instance
const bot = new Telegraf(process.env.BOT_TOKEN);

// Setup Commands
setupCommands(bot);

// Setup middleware
setupMiddleware(bot);

/*bot.command('reply', async ctx => {
  const { id } = ctx.from;
  if (!process.env.ADMINS.includes(id)) {
    return;
  }
  const { text, reply_to_message } = ctx.message;
  if (!reply_to_message) {
    return;
  }
  const {
    forward_from,
    forward_date,
    caption,
    caption_entities,
  } = reply_to_message;
  // If admin replies to a message that was forwarded by a user
  if (!forward_from && forward_date) {
    ctx.reply(
      "Impossibile ottenere l'id dell'utente, inviare il messaggio manualmente con il comando /reply id_utente text_message"
    );
  }
  if (forward_from) {
    const { id } = forward_from;
    try {
      ctx.telegram.sendMessage(id, text);
      ctx.reply('Il tuo messaggio è stato inviato');
    } catch (error) {
      ctx.reply('Impossibile inviare messaggio');
    }
  } else if (caption && caption_entities) {
    // Get user username from caption's entities and retreive user id from db
    const entity = caption_entities.find(e => e.type === 'mention');
    const username = caption.substring(
      // offset + 1 in order to remove '@'
      entity.offset + 1,
      entity.offset + entity.length
    );
    try {
      const { id } = await knex('users')
        .select('id')
        .first()
        .where({ username });
      if (id) {
        ctx.telegram.sendMessage(id, text);
      } else {
        ctx.reply('Utente non trovato, probabilmente ha cambiato username');
        console.log('User not found');
      }
    } catch (error) {
      console.log(error);
    }
  }
});*/

module.exports = bot;
