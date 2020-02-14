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

// Define administrators, id must be numbers and not strings
const admins = process.env.ADMINS.split(',').map(admin => parseInt(admin));

// Compose stage with given scenes
const stage = new Stage([supportChat, sellItemWizard]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(stage.middleware());

bot.start(ctx => {
  console.log(admins);
  const { first_name, id, username } = ctx.from;
  logger.info(`${username} started the Bot`);

  // Save new user to the database
  knex('users')
    .insert({ id, username, name: first_name, muted: false })
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

// Administration Commands
bot.command('mute', ctx => {
  const { id } = ctx.from;
  if (!admins.includes(id)) {
    return;
  }
  if (!ctx.message.reply_to_message) {
    return;
  }
  const { forward_from } = ctx.message.reply_to_message;
  if (forward_from) {
    const { id } = forward_from;
    knex('users')
      .where({ id })
      .update({ muted: 'true' })
      .then(rows => {
        logger.info(`${id} is now muted`);
        ctx.reply(`${id} è stato mutato`);
      })
      .catch(err => logger.error(err));
    try {
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
  }
});
bot.command('unmute', ctx => {
  const { id } = ctx.from;
  if (!admins.includes(id)) {
    return;
  }
  if (!ctx.message.reply_to_message) {
    return;
  }
  const { forward_from } = ctx.message.reply_to_message;
  if (forward_from) {
    const { id } = forward_from;
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
bot.command('users', ctx => {
  const { id } = ctx.from;
  if (!admins.includes(id)) {
    return;
  }
  knex('users').then(rows => {
    rows.map(row => {
      const { id } = row;
      ctx.reply(id);
    });
  });
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
    // Get user id from caption
    const userId = caption.split('ID: ')[1];
    try {
      ctx.telegram.sendMessage(userId, text);
    } catch (error) {
      ctx.reply('Impossibile inviare messaggio');
    }
  }
});

module.exports = bot;
