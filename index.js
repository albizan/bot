const dotenv = require('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}

const Telegraf = require('telegraf');
// Import types
const { SELL_ITEM, SEEK_ITEM } = require('./types/callbacks.types');
const { SELL_ITEM_WIZARD, SEEK_ITEM_WIZARD } = require('./types/scenes.types');

// Import Wizards
const sellItemWizard = require('./wizards/sell');

const chat = require('./scenes/chat.scene');

// Import logger
const logger = require('./logger');

const { Markup, Stage, session } = Telegraf;

// Compose stage with given scenes
const stage = new Stage([chat, sellItemWizard]);

const bot = new Telegraf(process.env.BOT_TOKEN);

const startMessage = Markup.inlineKeyboard([
  [
    Markup.callbackButton('Ricerca', SEEK_ITEM),
    Markup.callbackButton('Vendita', SELL_ITEM),
  ],
  [Markup.callbackButton('Chatta con gli admin', 'admin')],
])
  .oneTime()
  .resize()
  .extra();

bot.use(session());
bot.use(stage.middleware());

bot.start(ctx => {
  const { first_name, id, username } = ctx.from;
  logger.info(`${username} started Nas BOT`);

  // When user starts bot, show welcome message in private chat and asks for type of action
  ctx.telegram.sendMessage(
    id,
    `Ciao ${first_name}\nBenvenuto nel mercatino del gruppo "PC Building Italia"`,
    startMessage
  );
});

bot.action(SELL_ITEM, Stage.enter(SELL_ITEM_WIZARD));

bot.action(SEEK_ITEM, ctx => {
  // Delete previous inline message to avoid cluttering the chat
  ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply('Questa funzionalità non è ancora disponibile', startMessage);
});

bot.action('admin', Stage.enter('chat'));

bot.help(ctx => {
  ctx.reply('Premi /start per iniziare la procedura');
});
bot.on('message', ctx => {
  // If admin replies to a user's forwarded message, bot sends reply to that user
  if (ctx.message.reply_to_message && ctx.message.reply_to_message.text) {
    const id = ctx.message.reply_to_message.text.split('\n')[0];
    if (parseInt(id)) {
      try {
        ctx.telegram.sendMessage(id, ctx.message.text);
      } catch (error) {
        logger.error(error);
      }
    }
  }
});
bot.launch();
logger.info('Bot started');

/* 
  Inizio -> saluti e fai scelta vendere o cercare
  In base alla scelta, guardo la callback_query e entro nella wizarScene desiderata
  Ogni wizardScene ha un suo stato -> ctx.wizard.state che si pulisce quando si esce dalla scena
  una scena e come una stanza dove il bot risponde solo ai comandi di quella determinata stanza, ignorando tutto quello che non è nel codice della stanza
  Lo stage serve solo per nettere insieme tutte le scene
  si entra in una scena con ctx.scene.enter(sceneId) questo scene viene aggiunto al ctx grazie al middleware dello stage
*/
