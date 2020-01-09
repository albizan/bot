const dotenv = require("dotenv");
dotenv.config();

const Telegraf = require("telegraf");
// Import types
const { SELL_ITEM, SEEK_ITEM } = require("./types/callbacks.types");
const { SELL_ITEM_WIZARD, SEEK_ITEM_WIZARD } = require("./types/scenes.types");

// Import Wizards
const sellItemWizard = require("./wizards/sellItem.wizard");

// Import logger
const logger = require("./logger");

// Import Emojis
const { package } = require("./emoji");

const { Markup, Stage, session } = Telegraf;

// Compose stage with given scenes
const stage = new Stage([sellItemWizard]);
const bot = new Telegraf(process.env.BOT_TOKEN);
const startMessage = Markup.inlineKeyboard([
  [
    Markup.callbackButton("Ricerca", SEEK_ITEM),
    Markup.callbackButton("Vendita", SELL_ITEM)
  ]
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
    `Benvenuto nel mercatino, ${first_name}`,
    startMessage
  );
});

bot.action(SELL_ITEM, Stage.enter(SELL_ITEM_WIZARD));

bot.action(SEEK_ITEM, ctx => {
  ctx.reply("Questa funzionalità non è ancora disponibile", startMessage);
});

bot.command("s", ctx => {
  ctx.telegram.sendMessage(
    process.env.SECRET_CHAT_ID,
    ctx.message.text.replace("/s", "")
  );
});

bot.help(ctx => {
  ctx.reply("Premi /start per iniziare la procedura");
});
bot.launch();

/* 
  Inizio -> saluti e fai scelta vendere o cercare
  In base alla scelta, guardo la callback_query e entro nella wizarScene desiderata
  Ogni wizardScene ha un suo stato -> ctx.wizard.state che si pulisce quando si esce dalla scena
  una scena e come una stanza dove il bot risponde solo ai comandi di quella determinata stanza, ignorando tutto quello che non è nel codice della stanza
  Lo stage serve solo per nettere insieme tutte le scene
  si entra in una scena con ctx.scene.enter(sceneId) questo scene viene aggiunto al ctx grazie al middleware dello stage
*/
