const WizardScene = require("telegraf/scenes/wizard");
const Markup = require("telegraf/markup");

const { SELL_ITEM_WIZARD } = require("../types/scenes.types");
const {
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD,
  PAYPAL,
  HYPE,
  CASH,
  TRANSFER
} = require("../types/callbacks.types");

// Import caption helper
const { generateCaption } = require("../helper");

// Import logger
const logger = require("../logger");

// Import emojis
const {
  package,
  memo,
  moneyBag,
  checkMark,
  back,
  forward
} = require("../emoji");

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
    ctx.wizard.state.paymentMethods = [];
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
    if (!ctx.message) {
      return;
    }
    if (!ctx.message.text) {
      const { message_id } = ctx.message;
      // If user sends random non-text message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    // If I get here, text is defined
    const { text } = ctx.message;
    // Check if text is a bot command, commands are not accepted
    if (text.startsWith("/")) {
      const { message_id } = ctx.message;
      // If user sends a text containing a bot command, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    // Update wizard state with given validated title
    ctx.wizard.state.title = text;

    logger.info(`${ctx.from.username} inserted title:`, text);
    try {
      await ctx.reply(`${package} Titolo: ${text}`, prompt);
      return ctx.wizard.next();
    } catch (error) {
      logger.error({ error });
      return;
    }
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
    if (!ctx.message) {
      return;
    }
    if (!ctx.message.text) {
      const { message_id } = ctx.message;
      // If user sends random non-text message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }
    // If I get here, text is defined
    const { text } = ctx.message;
    // Check if text is a bot command, commands are not accepted
    if (text.startsWith("/")) {
      const { message_id } = ctx.message;
      // If user sends a text containing a bot command, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }

    // Update wizard state with given validated description
    ctx.wizard.state.description = text;

    try {
      await ctx.reply(`${memo} Descrizione: ${text}`, prompt);
      return ctx.wizard.next();
    } catch (error) {
      logger.error({ error });
      return;
    }
  },
  // Step 5 of Wizard - Description Confirmation and Ask For Product's Images
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
      if (ctx.message) {
        const { message_id } = ctx.message;
        // If user sends random message, delete it in order to avoid chat cluttering
        ctx.deleteMessage(message_id);
      }
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
        await ctx.reply(
          "Invia una o piu foto del prodotto, quando hai finito premi sul pulsante 'Avanti'",
          Markup.keyboard(["Avanti"])
            .resize()
            .extra()
        );
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

    if (!ctx.message) {
      return;
    }

    if (ctx.message.text === "Avanti") {
      if (!ctx.wizard.state.images) {
        ctx.reply("Inserisci almeno un immagine");
        return;
      }
      await ctx.reply(
        "Inserisci il prezzo richiesto (scrivi solo il valore numerico, senza €)"
      );
      return ctx.wizard.next();
    }

    if (!ctx.message.photo) {
      const { message_id } = ctx.message;
      // If user sends random message that is not a photo, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }

    const { file_id } = ctx.message.photo[ctx.message.photo.length - 1]; // photo[max] is the max resolution image
    ctx.wizard.state.images =
      ctx.wizard.state.images === undefined
        ? [file_id]
        : [...ctx.wizard.state.images, file_id];
    logger.info(`${ctx.from.username} uploaded an image`);
    return;
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
      return;
    }
    if (!ctx.message.text || isNaN(ctx.message.text.replace(",", "."))) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
      return;
    }

    const { text } = ctx.message;
    // Convert string into a floating point number
    ctx.wizard.state.value = parseFloat(text.replace(",", "."));
    try {
      await ctx.reply(`${moneyBag} Prezzo: ${ctx.wizard.state.value}€`, prompt);
      return ctx.wizard.next();
    } catch (error) {
      logger.error({ error });
      ctx.reply(
        "Qualcosa è andato storto, messagio non inviato. Riprova piu tardi"
      );
      return ctx.scene.leave();
    }
  },
  // Step 8 of Wizard - Value Confirmation and show payments inline keyboard
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
    const { paymentMethods } = ctx.wizard.state;
    const paymentMethodsPrompt = generatePaymentsInlineKeyboardMarkup(
      paymentMethods
    );
    switch (data) {
      case CLOSE_WIZARD:
        logger.info(
          `${ctx.from.username} exited ${SELL_ITEM_WIZARD} in step 8`
        );
        return ctx.scene.leave();
      case NEXT_STEP:
        logger.info(`${ctx.from.username} confirmed value`);
        ctx.reply("Seleziona i metodi di pagamento", paymentMethodsPrompt);
        return ctx.wizard.next();
      case PREVIOUS_STEP:
        await ctx.reply("Reinserisci Il prezzo");
        return ctx.wizard.back();
      default:
        await ctx.reply("Bzzagrakkchhabz", "Bot is dead", "You killed the bot");
        return ctx.scene.leave();
    }
  },
  // Step 9 of Wizard - Add Payment methods or Complete
  async ctx => {
    if (!ctx.callbackQuery) {
      if (ctx.message) {
        const { message_id } = ctx.message;
        // If user sends random message, delete it in order to avoid chat cluttering
        ctx.deleteMessage(message_id);
      }
      return;
    }
    const { data } = ctx.callbackQuery;

    switch (data) {
      case NEXT_STEP:
        if (ctx.wizard.state.paymentMethods.length <= 0) {
          ctx.reply("Seleziona almeno un metodo di pagamento");
          return;
        }
        const {
          title,
          description,
          images,
          value,
          paymentMethods
        } = ctx.wizard.state;
        const { username, first_name, id } = ctx.from;
        try {
          // generate array of inputMediaPhoto to be sent with sendMediaGroup
          const media = images.map(file_id => {
            return {
              type: "photo",
              media: file_id
            };
          });
          // Append caption to first image of media array, telegram client will display it as caption for the whole album
          media[0].caption = generateCaption(
            first_name,
            username,
            id,
            title,
            description,
            value,
            paymentMethods
          );
          await ctx.telegram.sendMediaGroup(process.env.SECRET_CHAT_ID, media);
          logger.info(`${ctx.from.username} completed ${SELL_ITEM_WIZARD}`);
          ctx.reply(
            "Grazie, il tuo messaggio è stato inviato agli amministratori che provvederanno alla convalida del tuo annuncio. In caso di problemi verrai ricontattato"
          );
          return ctx.scene.leave();
        } catch (error) {
          logger.error(error);
          ctx.reply(
            "Errore, impossibile inviare il tuo messaggio. Riprova piu tardi"
          );
          return ctx.scene.leave();
        }
      case PAYPAL:
        // If paypal is already present
        if (ctx.wizard.state.paymentMethods.includes("Paypal")) {
          // Remove it
          ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
            method => {
              return method !== "Paypal";
            }
          );
          logger.info(
            `${ctx.from.username} removed Paypal as a payment method`
          );
        } else {
          ctx.wizard.state.paymentMethods =
            ctx.wizard.state.paymentMethods === undefined
              ? ["Paypal"]
              : [...ctx.wizard.state.paymentMethods, "Paypal"];
          logger.info(`${ctx.from.username} added Paypal as a payment method`);
        }
        try {
          await ctx.telegram.editMessageReplyMarkup(
            ctx.callbackQuery.message.chat.id,
            ctx.callbackQuery.message.message_id,
            ctx.callbackQuery.inline_message_id,
            {
              inline_keyboard: generatePaymentsInlineKeyboard(
                ctx.wizard.state.paymentMethods
              )
            }
          );
          return;
        } catch (error) {
          logger.error(error);
          ctx.reply("Si è verificato un errore, ctxiprova piu tardi");
          ctx.scene.leave();
        }
        return;
      case HYPE:
        // If hype is already present
        if (ctx.wizard.state.paymentMethods.includes("Hype")) {
          // Remove it
          ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
            method => {
              return method !== "Hype";
            }
          );
          logger.info(`${ctx.from.username} removed Hype as a payment method`);
        } else {
          ctx.wizard.state.paymentMethods =
            ctx.wizard.state.paymentMethods === undefined
              ? ["Hype"]
              : [...ctx.wizard.state.paymentMethods, "Hype"];
          logger.info(`${ctx.from.username} added Hype as a payment method`);
        }
        try {
          await ctx.telegram.editMessageReplyMarkup(
            ctx.callbackQuery.message.chat.id,
            ctx.callbackQuery.message.message_id,
            ctx.callbackQuery.inline_message_id,
            {
              inline_keyboard: generatePaymentsInlineKeyboard(
                ctx.wizard.state.paymentMethods
              )
            }
          );
          return;
        } catch (error) {
          logger.error(error);
          ctx.reply("Si è verificato un errore, ctxiprova piu tardi");
          ctx.scene.leave();
        }
        return;
      case CASH:
        // If cash is already present
        if (ctx.wizard.state.paymentMethods.includes("Contante")) {
          // Remove it
          ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
            method => {
              return method !== "Contante";
            }
          );
          logger.info(`${ctx.from.username} removed Cash as a payment method`);
        } else {
          ctx.wizard.state.paymentMethods =
            ctx.wizard.state.paymentMethods === undefined
              ? ["Contante"]
              : [...ctx.wizard.state.paymentMethods, "Contante"];
          logger.info(`${ctx.from.username} added Cash as a payment method`);
        }
        try {
          await ctx.telegram.editMessageReplyMarkup(
            ctx.callbackQuery.message.chat.id,
            ctx.callbackQuery.message.message_id,
            ctx.callbackQuery.inline_message_id,
            {
              inline_keyboard: generatePaymentsInlineKeyboard(
                ctx.wizard.state.paymentMethods
              )
            }
          );
          return;
        } catch (error) {
          logger.error(error);
          ctx.reply("Si è verificato un errore, ctxiprova piu tardi");
          ctx.scene.leave();
        }
        return;
      case TRANSFER:
        // If transfer is already present
        if (ctx.wizard.state.paymentMethods.includes("Bonifico")) {
          // Remove it
          ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
            method => {
              return method !== "Bonifico";
            }
          );
          logger.info(
            `${ctx.from.username} removed Transfer as a payment method`
          );
        } else {
          ctx.wizard.state.paymentMethods =
            ctx.wizard.state.paymentMethods === undefined
              ? ["Bonifico"]
              : [...ctx.wizard.state.paymentMethods, "Bonifico"];
          logger.info(
            `${ctx.from.username} added Transfer as a payment method`
          );
        }
        try {
          await ctx.telegram.editMessageReplyMarkup(
            ctx.callbackQuery.message.chat.id,
            ctx.callbackQuery.message.message_id,
            ctx.callbackQuery.inline_message_id,
            {
              inline_keyboard: generatePaymentsInlineKeyboard(
                ctx.wizard.state.paymentMethods
              )
            }
          );
          return;
        } catch (error) {
          logger.error(error);
          ctx.reply("Si è verificato un errore, riprova piu tardi");
          ctx.scene.leave();
        }
        return;
      case CLOSE_WIZARD:
        ctx.scene.leave();
      default:
        return;
    }
  }
);

const prompt = Markup.inlineKeyboard([
  [
    Markup.callbackButton(`${back} Modifica`, PREVIOUS_STEP),
    Markup.callbackButton("Home", CLOSE_WIZARD),
    Markup.callbackButton(`Avanti ${forward}`, NEXT_STEP)
  ]
])
  .oneTime()
  .resize()
  .extra();

// This is the prompt when payment methods are requested
const generatePaymentsInlineKeyboardMarkup = paymentMethods => {
  const paymentMethodsPrompt = Markup.inlineKeyboard(
    generatePaymentsInlineKeyboard(paymentMethods)
  )
    .oneTime()
    .resize()
    .extra();
  return paymentMethodsPrompt;
};

// This is just the markup of the payment inline keyboard
const generatePaymentsInlineKeyboard = paymentMethods => {
  return [
    [
      Markup.callbackButton(
        `${paymentMethods.includes("Paypal") ? checkMark : ""} Paypal`,
        PAYPAL
      ),
      Markup.callbackButton(
        `${paymentMethods.includes("Hype") ? checkMark : ""} Hype`,
        HYPE
      )
    ],
    [
      Markup.callbackButton(
        `${paymentMethods.includes("Contante") ? checkMark : ""} Contante`,
        CASH
      ),
      Markup.callbackButton(
        `${paymentMethods.includes("Bonifico") ? checkMark : ""} Bonifico`,
        TRANSFER
      )
    ],
    [
      Markup.callbackButton("Annulla", CLOSE_WIZARD),
      Markup.callbackButton("Avanti", NEXT_STEP)
    ]
  ];
};

sellItemWizard.leave(ctx =>
  ctx.reply(
    "Alla prossima, ricorda di scrivere /start se vuoi iniziare da capo la procedura"
  )
);
module.exports = sellItemWizard;
