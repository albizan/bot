const WizardScene = require("telegraf/scenes/wizard");
const Markup = require("telegraf/markup");

const { SELL_ITEM_WIZARD } = require("../types/scenes.types");
const {
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD
} = require("../types/callbacks.types");

// Import caption helper
const { generateCaption } = require("../helper");

// Import logger
const logger = require("../logger");

// Import emojis
const { package, memo, moneyBag } = require("../emoji");

// A wizard is a special type of scene
const sellItemWizard = new WizardScene(
  // Wizard's name
  SELL_ITEM_WIZARD,
  // Step 1 of Wizard - Ask Title
  async ctx => {
    /* 
      Initialize wizard's state for current wizard operation, this will be automatically deleted when leaving the wizard with ctx.scene.leave()
      Prompt user to write title
      Wait for user's input and then go to next step
    */
    logger.info(`${ctx.from.username} entered ${SELL_ITEM_WIZARD}`);
    ctx.wizard.state = {};
    await ctx.reply("<b>Inserisci il titolo dell'annuncio</b>", {
      parse_mode: "HTML"
    });
    return ctx.wizard.next();
  },
  // Step 2 of Wizard - Title Validation
  async ctx => {
    /*
      Validate user's response (only text messages are accepted)
      Update wizard's state with given title
      Show Title and prompt user for confirmation
    */
    logger.info(`${ctx.from.username} entered step 2 of ${SELL_ITEM_WIZARD}`);
    // Check if user sent a message and not a callback_query, if it is a message check if it is a text and not a GIF/Sticker
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply("<b>Inserisci il titolo dell'annuncio</b>", {
        parse_mode: "HTML"
      });
      return;
    }
    // If I get here, text is defined
    const { text } = ctx.message;
    // Check if text is a bot command, commands are not accepted
    if (text.startsWith("/")) {
      await ctx.reply("<b>Inserisci il titolo dell'annuncio</b>", {
        parse_mode: "HTML"
      });
      return;
    }
    // Update wizard state with given validated title
    ctx.wizard.state.title = text;

    logger.info(`${ctx.from.username} inserted title:`, text);
    await ctx.reply(`${package} Titolo: ${text}`, prompt);
    return ctx.wizard.next();
  },
  // Step 3 of Wizard - Title Confirmation and Ask For Description
  async ctx => {
    /*
      Validate user's response (only text callback_queries are accepted)
      Based on callback_query make decisions:
      If user confirms, ask for description, wait for user's input and then go to next step
      If user wants to edit title, show prompt and repeat this step
      If user wants to leave, exit current scene
    */
    logger.info(`${ctx.from.username} entered step 3 of ${SELL_ITEM_WIZARD}`);
    if (!ctx.callbackQuery) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    const { data } = ctx.callbackQuery;
    switch (data) {
      case CLOSE_WIZARD:
        logger.info(
          `${ctx.from.username} exited ${SELL_ITEM_WIZARD} in step 3`
        );
        return ctx.scene.leave();
      case NEXT_STEP:
        logger.info(`${ctx.from.username} confirmed title`);
        await ctx.reply("<b>Inserisci una descrizione</b>", {
          parse_mode: "HTML"
        });
        return ctx.wizard.next();
      case PREVIOUS_STEP:
        await ctx.reply("<b>Reinserisci il titolo dell'annuncio</b>", {
          parse_mode: "HTML"
        });
        return ctx.wizard.back();
      default:
        await ctx.reply("Bzzagrakkchhabz, Bot is dead, You killed the bot");
        return ctx.scene.leave();
    }
  },
  // Step 4 of Wizard - Description Validation
  async ctx => {
    /*
      Get user input
      Check if input is a normal text message
      Update wizard's state
      Show given input to user to check if description is correct. If not, user can go back to prevoius step
      Go to next step
    */
    logger.info(`${ctx.from.username} entered step 4 of ${SELL_ITEM_WIZARD}`);

    // Check if user sent a message and not a callback_query, if it is a message check if it is a text and not a GIF/Sticker
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply("<b>Inserisci la descrizione dell'annuncio</b>", {
        parse_mode: "HTML"
      });
      return;
    }
    // If I get here, text is defined
    const { text } = ctx.message;

    // Check if text is a bot command, commands are not accepted
    if (text.startsWith("/")) {
      await ctx.reply("<b>Inserisci la descrizione dell'annuncio</b>", {
        parse_mode: "HTML"
      });
      return;
    }

    // Update wizard state with given validated description
    ctx.wizard.state.description = text;

    logger.info(`${ctx.from.username} inserted description:`, text);
    await ctx.reply(`${memo} Descrizione: ${text}`, prompt);
    return ctx.wizard.next();
  },
  // Step 5 of Wizard - Description Confirmation and Ask For Product's Image
  async ctx => {
    /*
      Validate user's response (only text callback_queries are accepted)
      Based on callback_query make decisions:
      If user confirms, ask for description, wait for user's input and then go to next step
      If user wants to edit title, show prompt and repeat this step
      If user wants to leave, exit current scene
    */

    logger.info(`${ctx.from.username} entered step 5 of ${SELL_ITEM_WIZARD}`);

    if (!ctx.callbackQuery) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    const { data } = ctx.callbackQuery;
    switch (data) {
      case CLOSE_WIZARD:
        logger.info(
          `${ctx.from.username} exited ${SELL_ITEM_WIZARD} in step 5`
        );
        return ctx.scene.leave();
      case NEXT_STEP:
        logger.info(`${ctx.from.username} confirmed description`);
        await ctx.reply("<b>Invia una immagine dettagliata del prodotto</b>", {
          parse_mode: "HTML"
        });
        return ctx.wizard.next();
      case PREVIOUS_STEP:
        await ctx.reply("<b>Reinserisci la descrizione dell'annuncio</b>", {
          parse_mode: "HTML"
        });
        return ctx.wizard.back();
      default:
        await ctx.reply("Bzzagrakkchhabz, Bot is dead, You killed the bot");
        return ctx.scene.leave();
    }
  },
  // Step 6 of Wizard - Image Validation and Ask for product's value
  async ctx => {
    /* 
      Get user image
      Check if ctx.message has a real image
      Update wizard's state
      Go to next step
    */

    logger.info(`${ctx.from.username} entered step 6 of ${SELL_ITEM_WIZARD}`);

    if (!ctx.message || !ctx.message.photo) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    logger.info(`${ctx.from.username} uploaded an image`);
    const { file_id } = ctx.message.photo[1];
    ctx.wizard.state.image_id = file_id;

    await ctx.reply(
      "Inserisci il prezzo richiesto (scrivi solo il valore numerico, senza €)"
    );
    return ctx.wizard.next();
  },
  // Step 7 of Wizard - Value Validation
  async ctx => {
    /* 
      Get user input
      Check if input is a number
      Update wizard's state
      Show given input to user to check if value is correct. If not, user can go back to prevoius step
    */
    logger.info(`${ctx.from.username} entered step 7 of ${SELL_ITEM_WIZARD}`);
    if (!ctx.message) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    if (isNaN(ctx.message.text)) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }

    const { text } = ctx.message;
    // Convert string into a floating point number
    ctx.wizard.state.value = parseFloat(text.replace(",", "."));
    await ctx.reply(`${moneyBag} Prezzo: ${text}€`, prompt);
    return ctx.wizard.next();
  },
  // Step 8 of Wizard - Value Confirmation
  async ctx => {
    /* 
      Validate user's response (only text callback_queries are accepted)
      Based on callback_query make decisions:
      If user confirms, ask for description, wait for user's input and then go to next step
      If user wants to edit title, show prompt and repeat this step
      If user wants to leave, exit current scene
    */
    logger.info(`${ctx.from.username} entered step 8 of ${SELL_ITEM_WIZARD}`);

    if (!ctx.callbackQuery) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    const { data } = ctx.callbackQuery;

    switch (data) {
      case CLOSE_WIZARD:
        logger.info(
          `${ctx.from.username} exited ${SELL_ITEM_WIZARD} in step 8`
        );
        return ctx.scene.leave();
      case NEXT_STEP:
        logger.info(`${ctx.from.username} confirmed value`);
        await ctx.reply(
          "Il tuo annuncio è stato inviato agli amministratori. Verrai notificato qua nel bot per aggiornamenti"
        );
        const { title, description, image_id, value } = ctx.wizard.state;
        const { username, first_name, id } = ctx.from;
        await ctx.telegram.sendPhoto(process.env.SECRET_CHAT_ID, image_id, {
          caption: generateCaption(
            first_name,
            username,
            id,
            title,
            description,
            value
          )
        });
        //const imageUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${image_id}`;
        logger.info(
          `${ctx.from.username}' sale announcement was sent to administartors`
        );
        return ctx.scene.leave();
      case PREVIOUS_STEP:
        await ctx.reply("Reinserisci Il prezzo");
        return ctx.wizard.back();
      default:
        await ctx.reply("Bzzagrakkchhabz", "Bot is dead", "You killed the bot");
        return ctx.scene.leave();
    }
  }
);

const prompt = Markup.inlineKeyboard([
  [
    Markup.callbackButton("Edit", PREVIOUS_STEP),
    Markup.callbackButton("Home", CLOSE_WIZARD),
    Markup.callbackButton("Avanti", NEXT_STEP)
  ]
])
  .oneTime()
  .resize()
  .extra();

sellItemWizard.leave(ctx =>
  ctx.reply(
    "Alla prossima, ricorda di scrivere /start se vuoi iniziare da capo la procedura"
  )
);
module.exports = sellItemWizard;
