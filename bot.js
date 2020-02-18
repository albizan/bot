const Telegraf = require('telegraf');
const { Stage, session } = Telegraf;
const Markup = require('telegraf/markup');
const knex = require('./db');
// Import types
const {
  SELL_ITEM,
  SEEK_ITEM,
  SEARCH,
  SUPPORT_CHAT,
  CPU,
  GPU,
  RAM,
  MOBO,
  PSU,
  STORAGE,
  CASE,
  PERIPHERALS,
  COMPLETE_PC,
  OTHER,
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

// import markups
const { startMenuMarkup } = require('./helper');

// Define administrators, id must be numbers and not strings
const admins = process.env.ADMINS.split(',').map(admin => parseInt(admin));

// Compose stage with given scenes
const stage = new Stage([supportChat, sellItemWizard, seekItemWizard]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(stage.middleware());

bot.start(async ctx => {
  const { id, username, first_name } = ctx.from;
  try {
    // When user starts bot, show welcome message in private chat and show menu
    ctx.telegram.sendMessage(
      id,
      `Ciao <b>${first_name}</b>\n\nBenvenuto nel mercatino del gruppo <i>"PC Building Italia"</i>`,
      {
        reply_markup: startMenuMarkup,
        parse_mode: 'HTML',
      }
    );
  } catch (err) {
    ctx.reply(
      'Sono un BOT, non posso contattarti in privato se prima non vai su @nas_bot_test e clicchi su avvia'
    );
    console.log(err);
  }
  logger.info(`${username} started the Bot`);

  // Retrieve user id from id
  let users = [];
  try {
    users = await knex('users').where({ id });
  } catch (err) {
    logger.error('Cannot retrieve users from database');
    console.log(err);
  }
  // If user is not in the database, save it
  if (users.length === 0) {
    try {
      const insertedUserId = await knex('users')
        .returning('id')
        .insert({
          id,
          username,
          first_name,
        });
      logger.info(`${insertedUserId} saved to the database`);
    } catch (err) {
      logger.error('Cannot insert in db');
      console.log(err);
    }
  } else {
    logger.info(`${users[0].id} is already present in the database`);
  }
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

bot.action(SEARCH, ctx => {
  ctx.answerCbQuery();
  ctx.reply('Seleziona la Categoria', {
    reply_markup: Markup.inlineKeyboard([
      [Markup.callbackButton(CPU, CPU), Markup.callbackButton(GPU, GPU)],
      [Markup.callbackButton(RAM, RAM), Markup.callbackButton(MOBO, MOBO)],
      [
        Markup.callbackButton(PSU, PSU),
        Markup.callbackButton(STORAGE, STORAGE),
      ],
      [
        Markup.callbackButton(CASE, CASE),
        Markup.callbackButton(PERIPHERALS, PERIPHERALS),
      ],
      [Markup.callbackButton(COMPLETE_PC, COMPLETE_PC)],
      [Markup.callbackButton(OTHER, OTHER)],
    ])
      .oneTime()
      .resize(),
  });
});

bot.action(CPU, ctx => {
  knex('sale_announcements')
    .where({ category: CPU })
    .whereNotNull('url')
    .then(rows => {
      const items = rows.map(row => [Markup.urlButton(`${row.id}`, row.url)]);
      if (items.length === 0) {
        ctx.reply('Nessun annuncio trovato');
      } else {
        ctx.reply('CPU attualmente in vendita', {
          reply_markup: Markup.inlineKeyboard(items),
        });
      }
    })
    .catch(err => console.log(err));
});

bot.action(RAM, ctx => {
  knex('sale_announcements')
    .where({ category: RAM })
    .whereNotNull('url')
    .then(rows => {
      const items = rows.map(row => [
        Markup.urlButton(`${row.title}`, row.url),
      ]);
      if (items.length === 0) {
        ctx.reply('Nessun annuncio trovato');
      } else {
        ctx.reply('RAM attualmente in vendita', {
          reply_markup: Markup.inlineKeyboard(items),
        });
      }
    })
    .catch(err => console.log(err));
});

bot.action(SUPPORT_CHAT, ctx => {
  ctx.answerCbQuery();
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

bot.command('url', ctx => {
  const { id } = ctx.from;
  if (!admins.includes(id)) {
    return;
  }

  const { text, reply_to_message } = ctx.message;
  if (!reply_to_message) {
    return;
  }

  if (!reply_to_message.caption) {
    return;
  }

  const announceUrl = text.split(' ')[1];
  if (!announceUrl) {
    return;
  }

  const announceId = reply_to_message.caption.split('ID annuncio: ')[1];

  knex('sale_announcements')
    .where({ id: announceId })
    .update({ url: announceUrl })
    .then(() => {
      ctx.reply('URL salvata');
    })
    .catch(err => console.log(err));
});

bot.command('approve', async ctx => {
  const { id } = ctx.from;
  if (!admins.includes(id)) {
    return;
  }
  try {
    console.log(ctx.update);
  } catch (error) {
    ctx.reply(error.message);
  }

  const { reply_to_message } = ctx.message;
  if (!reply_to_message) {
    ctx.reply('Questo comando deve essere usato come risposta ad un annuncio');
    return;
  }

  if (!reply_to_message.caption) {
    return;
  }

  // generate again array of inputMediaPhoto to be sent with sendMediaGroup to channel
  const media = reply_to_message.photo.map(photo => {
    return {
      type: 'photo',
      media: photo.file_id,
    };
  });

  // Append caption
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

bot.on('message', async ctx => {
  const { id } = ctx.from;
  if (!admins.includes(id)) {
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
    console.log(reply_to_message);
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
});

module.exports = bot;
