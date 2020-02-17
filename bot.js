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
const seekItemWizard = require('./wizards/seek');

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
const stage = new Stage([supportChat, sellItemWizard, seekItemWizard]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(stage.middleware());

bot.start(ctx => {
  const { first_name, id, username } = ctx.from;
  logger.info(`${username} started the Bot`);

  // Save new user to the database if does not exist
  knex('users')
    .where({ id })
    .then(rows => {
      if (rows.length === 0) {
        knex('users')
          .insert({ id, username, name: first_name, muted: false })
          .then(logger.info(`${id} added to the database`))
          .catch(err => logger.error(err.detail));
      } else {
        logger.info(`${rows[0].id} is already present in the database`);
      }
    });

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
bot.action(SELL_ITEM, ctx => {
  ctx.answerCbQuery();
  ctx.scene.enter(SELL_ITEM_WIZARD);
});
bot.action(SEEK_ITEM, ctx => {
  ctx.answerCbQuery();
  ctx.scene.enter(SEEK_ITEM_WIZARD);
});
bot.action(SUPPORT_CHAT, ctx => {
  ctx.answerCbQuery('Ora puoi parlare con gli admin');
  ctx.scene.enter(SUPPORT_CHAT_SCENE);
});

// Administration Commands
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

bot.command('unmute', ctx => {
  const { id } = ctx.from;
  if (!admins.includes(id)) {
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
