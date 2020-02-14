const Telegraf = require('telegraf');
const knex = require('./db');
// Import types
const {
  SELL_ITEM,
  SEEK_ITEM,
  SUPPORT_CHAT,
} = require('./types/callbacks.types');
const {
  SELL_ITEM_WIZARD,
  SEEK_ITEM_WIZARD,
  SUPPORT_CHAT_SCENE,
} = require('./types/scenes.types');

// Import Wizards
const sellItemWizard = require('./wizards/sell');

// Imports Scenes
const supportChat = require('./scenes/chat.scene');

// Import logger
const logger = require('./logger');

const { Stage, session } = Telegraf;

// import markups
const { startMenuMarkup } = require('./helper');

// Compose stage with given scenes
const stage = new Stage([supportChat, sellItemWizard]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(stage.middleware());

bot.start(ctx => {
  const { first_name, id, username } = ctx.from;
  logger.info(`${username} started Nas BOT`);

  // Save new user to the database
  knex('users')
    .insert({ id, muted: false })
    .then(`${id} added to the database`)
    .catch(err => logger.error(err.detail));

  // When user starts bot, show welcome message in private chat and asks for type of action
  ctx.telegram.sendMessage(
    id,
    `Ciao ${first_name}\n\nBenvenuto nel mercatino del gruppo "PC Building Italia"`,
    {
      reply_markup: startMenuMarkup,
    }
  );
});

// Handle middlewares for callback_data
bot.action(SELL_ITEM, Stage.enter(SELL_ITEM_WIZARD));
bot.action(SEEK_ITEM, ctx => {
  // Delete previous inline message to avoid cluttering the chat
  ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply('Questa funzionalità non è ancora disponibile', {
    reply_markup: startMenuMarkup,
  });
});
bot.action(SUPPORT_CHAT, Stage.enter(SUPPORT_CHAT_SCENE));

bot.command('mute', ctx => {
  logger.info('Mute command');
  console.log(ctx.message);
  if (
    ctx.message.reply_to_message &&
    ctx.message.reply_to_message.forward_from
  ) {
    const { id } = ctx.message.reply_to_message.forward_from;
    logger.info('Mute command 2', id);
    knex('users')
      .where({ id })
      .update({ muted: 'true' })
      .then(rows => {
        logger.info(`${id} è stato mutato`);
        ctx.reply(`${id} è stato mutato`);
      })
      .catch(err => logger.error(err));
    try {
      ctx.telegram.sendMessage(
        id,
        '<b>Da questo momento non potrai piu inviare messaggi agli admin</b>',
        {
          parse_mode: 'HTML',
        }
      );
    } catch (error) {
      ctx.reply('Impossibile inviare messaggio');
    }
  }
});
bot.command('unmute', ctx => {
  if (
    ctx.message.reply_to_message &&
    ctx.message.reply_to_message.forward_from
  ) {
    const { id } = ctx.message.reply_to_message.forward_from;
    knex('users')
      .where({ id })
      .update({ muted: 'false' })
      .then(rows => {
        logger.info(`${id} è stato smutato`);
        ctx.reply(`${id} è stato smutato`);
      })
      .catch(err => logger.error(err));
  }
});

bot.on('message', ctx => {
  const { text, reply_to_message } = ctx.message;
  if (!reply_to_message) {
    return;
  }
  const { forward_from, caption } = reply_to_message;
  if (forward_from) {
    const { id } = forward_from;
    try {
      ctx.telegram.sendMessage(id, text);
      ctx.reply('Il tuo messaggio è stato inviato');
    } catch (error) {
      ctx.reply('Impossibile inviare messaggio');
    }
  } else if (caption) {
    const userId = caption.split('ID: ')[1];
    try {
      ctx.telegram.sendMessage(userId, text);
    } catch (error) {
      ctx.reply('Impossibile inviare messaggio');
    }
  }
});

module.exports = bot;

/* 
  Inizio -> saluti e fai scelta vendere o cercare
  In base alla scelta, guardo la callback_query e entro nella wizarScene desiderata
  Ogni wizardScene ha un suo stato -> ctx.wizard.state che si pulisce quando si esce dalla scena
  una scena e come una stanza dove il bot risponde solo ai comandi di quella determinata stanza, ignorando tutto quello che non è nel codice della stanza
  Lo stage serve solo per nettere insieme tutte le scene
  si entra in una scena con ctx.scene.enter(sceneId) questo scene viene aggiunto al ctx grazie al middleware dello stage
*/
