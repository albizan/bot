const Telegraf = require('telegraf');
const { Stage, session } = Telegraf;
const Markup = require('telegraf/markup');
const knex = require('./db');

// Import command setups
const setupCommands = require('./commands');
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
process.env.ADMINS = process.env.ADMINS.split(',').map(admin =>
  parseInt(admin)
);

// Compose stage with given scenes
const stage = new Stage([supportChat, sellItemWizard, seekItemWizard]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(stage.middleware());

// Handle middlewares for callback_data
bot.action(SELL_ITEM, ctx => {
  ctx.answerCbQuery();
  ctx.deleteMessage(ctx.callbackQuery.message.message_id);
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

bot.action(CPU, async ctx => {
  const result = await knex('sale_announcements')
    .select('product', 'url')
    .whereNotNull('url')
    .where({ category: CPU });

  const buttons = result.map(row => [
    Markup.urlButton(`${row.product}`, row.url),
  ]);
  if (buttons.length === 0) {
    ctx.reply('Nessun annuncio trovato');
  } else {
    ctx.reply('CPU attualmente in vendita', {
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  }
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
setupCommands(bot);

bot.on('message', async ctx => {
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
