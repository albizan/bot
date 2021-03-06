const Markup = require('telegraf/markup');
const logger = require('../../logger');
const {
  sellItemMenuMarkup,
  getPaymentMethodsMenuMarkup,
  generateSearchAnnouncement,
} = require('../../helper');

// Import sell item wizard type
const { SEEK_ITEM_WIZARD } = require('../../types/scenes.types');

// Import callback query types
const {
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD,
  PAYPAL,
  HYPE,
  CASH,
  TRANSFER,
} = require('../../types/callbacks.types');

// Import emojis
const { package, memo, moneyBag } = require('../../emoji');

/*
  Step 1 of Wizard - Ask For Title
  Initialize wizard's state for current wizard instance.
  The state will be automatically deleted when leaving the wizard with ctx.scene.leave()
  Prompt user to write title
*/
const askForTitle = ctx => {
  logger.info(`${ctx.from.username} entered ${SEEK_ITEM_WIZARD}`);
  ctx.wizard.state = {};
  ctx.reply('<b>Che prodotto stai cercando?</b>', {
    parse_mode: 'HTML',
  });
  return ctx.wizard.next();
};

/*
  Step 2 of Wizard - Validate Title
  Validate user's response (updates othen than text messages are deleted)
  Update wizard's state with given title
  Show Title and prompt user for confirmation
*/
const validateTitle = async ctx => {
  logger.info(`${ctx.from.username} entered step 2 of ${SEEK_ITEM_WIZARD}`);
  if (!ctx.message) {
    return;
  }
  if (!ctx.message.text) {
    // this could be a gif or a sticker and needs to be deleted in order to avoid chat cluttering
    const { message_id } = ctx.message;
    ctx.deleteMessage(message_id);
    return;
  }
  const { text, message_id } = ctx.message;

  // Check if text is a bot command, commands are not accepted and need to be deleted
  if (text.startsWith('/')) {
    ctx.deleteMessage(message_id);
    return;
  }

  // Update wizard state with given validated title
  ctx.wizard.state.title = text;

  // Ask for confirmation
  await ctx.reply(`${package} Prodotto: ${text}`, {
    reply_markup: sellItemMenuMarkup,
  });
  return ctx.wizard.next();
};

/*
  Step 3 of Wizard - Ask For Description
  Validate user's response (only callback_queries are accepted)
  Based on callback_query make decisions:
    If user confirms, ask for description, wait for user's input and then go to next step
    If user wants to edit title, re-show title prompt and repeat this step
    If user wants to leave, exit current scene
*/
const confirmTitleAndAskForDescription = async ctx => {
  logger.info(`${ctx.from.username} entered step 3 of ${SEEK_ITEM_WIZARD}`);

  // If not callbackQuery, delete message if possible
  if (!ctx.callbackQuery) {
    if (ctx.message) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
    }
    return;
  }
  ctx.answerCbQuery();
  const { data } = ctx.callbackQuery;
  switch (data) {
    case CLOSE_WIZARD:
      logger.info(`${ctx.from.username} exited ${SEEK_ITEM_WIZARD} in step 3`);
      return ctx.scene.leave();
    case NEXT_STEP:
      await ctx.reply("Inserisci il testo dell'annuncio di ricerca");
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply('Reinserisci il prodotto che stai cercando');
      return ctx.wizard.back();
    default:
      await ctx.reply('Bzzagrakkchhabz, Bot is dead, You killed the bot');
      return ctx.scene.leave();
  }
};

/*
  Step 4 of Wizard - Validate description
  Validate user's response (updates othen than text messages are deleted)
  Update wizard's state with given description
  Show description and prompt user for confirmation
*/
const validateDescription = async ctx => {
  logger.info(`${ctx.from.username} entered step 4 of ${SEEK_ITEM_WIZARD}`);

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
  const { text, message_id } = ctx.message;
  // Check if text is a bot command, commands are not accepted
  if (text.startsWith('/')) {
    ctx.deleteMessage(message_id);
    return;
  }

  // Update wizard state with given validated description
  ctx.wizard.state.description = text;

  // Ask for confirmation
  await ctx.reply(`${memo} Descrizione: ${text}`, {
    reply_markup: sellItemMenuMarkup,
  });
  return ctx.wizard.next();
};

/*
  Step 5 of Wizard - Ask For Images
  Validate user's response (only callback_queries are accepted)
  Based on callback_query make decisions:
    If user confirms, ask for images, wait for user's input and then go to next step
    If user wants to edit description, re-show description prompt and repeat this step
    If user wants to leave, exit current scene
*/
const confirmDescriptionAndAskForPrice = async ctx => {
  logger.info(`${ctx.from.username} entered step 5 of ${SEEK_ITEM_WIZARD}`);

  if (!ctx.callbackQuery) {
    if (ctx.message) {
      const { message_id } = ctx.message;
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(message_id);
    }
    return;
  }
  ctx.answerCbQuery('Testo Confermato');
  const { data } = ctx.callbackQuery;
  switch (data) {
    case CLOSE_WIZARD:
      logger.info(`${ctx.from.username} exited ${SEEK_ITEM_WIZARD} in step 5`);
      return ctx.scene.leave();
    case NEXT_STEP:
      await ctx.reply('Inserisci il prezzo che sei disposto a pagare');
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply("Reinserisci il testo dell'annuncio");
      return ctx.wizard.back();
    default:
      await ctx.reply('Bzzagrakkchhabz, Bot is dead, You killed the bot');
      return ctx.scene.leave();
  }
};

/* 
  Step 6 of Wizard - Price Validation
*/
const priceValidation = async ctx => {
  logger.info(`${ctx.from.username} entered step 7 of ${SEEK_ITEM_WIZARD}`);

  if (!ctx.message) {
    return;
  }
  if (!ctx.message.text || isNaN(ctx.message.text.replace(',', '.'))) {
    const { message_id } = ctx.message;
    // If user sends random message, delete it in order to avoid chat cluttering
    ctx.deleteMessage(message_id);
    return;
  }

  const { text } = ctx.message;
  // Convert string into a floating point number
  ctx.wizard.state.value = parseFloat(text.replace(',', '.'));
  await ctx.reply(`${moneyBag} Prezzo: ${ctx.wizard.state.value}€`, {
    reply_markup: sellItemMenuMarkup,
  });
  return ctx.wizard.next();
};

/* 
  Step 8 of Wizard - Price Confirmation and Show Payment Methods Keyboard
  Validate user's response (only text callback_queries are accepted)
  Based on callback_query make decisions:
    If user confirms, ask for description, wait for user's input and then go to next step
    If user wants to edit title, show prompt and repeat this step
    If user wants to leave, exit current scene
*/
const priceConfirmationAndShowPaymentsKeyboard = async ctx => {
  logger.info(`${ctx.from.username} entered step 8 of ${SEEK_ITEM_WIZARD}`);

  if (!ctx.callbackQuery) {
    const { message_id } = ctx.message;
    // If user sends random message, delete it in order to avoid chat cluttering
    ctx.deleteMessage(message_id);
    return;
  }
  ctx.answerCbQuery('Prezzo Confermato');
  const { data } = ctx.callbackQuery;
  switch (data) {
    case CLOSE_WIZARD:
      logger.info(`${ctx.from.username} exited ${SEEK_ITEM_WIZARD} in step 8`);
      return ctx.scene.leave();
    case NEXT_STEP:
      logger.info(`${ctx.from.username} confirmed value`);
      ctx.wizard.state.paymentMethods = [];
      const paymentMethodsPrompt = getPaymentMethodsMenuMarkup(
        ctx.wizard.state.paymentMethods
      );
      ctx.reply(
        'Seleziona i metodi di pagamento con cui sei disposto a pagare',
        {
          reply_markup: paymentMethodsPrompt,
        }
      );
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply('Reinserisci Il prezzo');
      return ctx.wizard.back();
    default:
      await ctx.reply('Bzzagrakkchhabz', 'Bot is dead', 'You killed the bot');
      return ctx.scene.leave();
  }
};

/* Listen for callbackqueries, update payment methods and send message when a certain button is clicked */
const updatePaymentMethods = async ctx => {
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
        ctx.reply('Seleziona almeno un metodo di pagamento');
        return;
      }
      const { title, description, value, paymentMethods } = ctx.wizard.state;
      const { username, first_name, id } = ctx.from;
      try {
        // Append caption to first image of media array, telegram client will display it as caption for the whole album
        const message = generateSearchAnnouncement(
          first_name,
          username,
          id,
          title,
          description,
          value,
          paymentMethods
        );
        ctx.reply(message, {
          parse_mode: 'HTML',
        });
        ctx.telegram.sendMessage(process.env.SECRET_CHAT_ID, message, {
          parse_mode: 'HTML',
        });
        logger.info(`${ctx.from.username} completed ${SEEK_ITEM_WIZARD}`);
        ctx.reply(
          'Grazie, il tuo annuncio è stato inviato agli amministratori che provvederanno alla convalida del tuo annuncio. In caso di problemi verrai ricontattato'
        );
        return ctx.scene.leave();
      } catch (error) {
        logger.error(error);
        ctx.reply(
          'Errore, impossibile inviare il tuo messaggio. Riprova piu tardi'
        );
        return ctx.scene.leave();
      }
    case PAYPAL:
      // If paypal is already present
      if (ctx.wizard.state.paymentMethods.includes('Paypal')) {
        // Remove it
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
          method => {
            return method !== 'Paypal';
          }
        );
        ctx.answerCbQuery('Paypal rimosso');
        logger.info(`${ctx.from.username} removed Paypal as a payment method`);
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Paypal']
            : [...ctx.wizard.state.paymentMethods, 'Paypal'];
        ctx.answerCbQuery('Paypal aggiunto');
        logger.info(`${ctx.from.username} added Paypal as a payment method`);
      }
      // Update message with dynamically generated inline keyboard of payment methods
      try {
        await ctx.editMessageReplyMarkup(
          getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods)
        );
        return;
      } catch (error) {
        logger.error(error);
        ctx.reply('Si è verificato un errore, riprova piu tardi');
        ctx.scene.leave();
      }
      return;
    case HYPE:
      // If hype is already present
      if (ctx.wizard.state.paymentMethods.includes('Hype')) {
        // Remove it
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
          method => {
            return method !== 'Hype';
          }
        );
        ctx.answerCbQuery('Hype rimosso');
        logger.info(`${ctx.from.username} removed Hype as a payment method`);
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Hype']
            : [...ctx.wizard.state.paymentMethods, 'Hype'];
        ctx.answerCbQuery('Hype aggiunto');
        logger.info(`${ctx.from.username} added Hype as a payment method`);
      }
      try {
        await ctx.editMessageReplyMarkup(
          getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods)
        );
        return;
      } catch (error) {
        logger.error(error);
        ctx.reply('Si è verificato un errore, ctxiprova piu tardi');
        ctx.scene.leave();
      }
      return;
    case CASH:
      // If cash is already present
      if (ctx.wizard.state.paymentMethods.includes('Contante')) {
        // Remove it
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
          method => {
            return method !== 'Contante';
          }
        );
        ctx.answerCbQuery('Contante rimosso');
        logger.info(`${ctx.from.username} removed Cash as a payment method`);
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Contante']
            : [...ctx.wizard.state.paymentMethods, 'Contante'];
        ctx.answerCbQuery('Contante aggiunto');
        logger.info(`${ctx.from.username} added Cash as a payment method`);
      }
      try {
        await ctx.editMessageReplyMarkup(
          getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods)
        );
        return;
      } catch (error) {
        logger.error(error);
        ctx.reply('Si è verificato un errore, ctxiprova piu tardi');
        ctx.scene.leave();
      }
      return;
    case TRANSFER:
      // If transfer is already present
      if (ctx.wizard.state.paymentMethods.includes('Bonifico')) {
        // Remove it
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(
          method => {
            return method !== 'Bonifico';
          }
        );
        ctx.answerCbQuery('Bonifico Rimosso');
        logger.info(
          `${ctx.from.username} removed Transfer as a payment method`
        );
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Bonifico']
            : [...ctx.wizard.state.paymentMethods, 'Bonifico'];

        ctx.answerCbQuery('Bonifico aggiunto');
        logger.info(`${ctx.from.username} added Transfer as a payment method`);
      }
      try {
        await ctx.editMessageReplyMarkup(
          getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods)
        );
        return;
      } catch (error) {
        logger.error(error);
        ctx.reply('Si è verificato un errore, riprova piu tardi');
        ctx.scene.leave();
      }
      return;
    case CLOSE_WIZARD:
      ctx.scene.leave();
    default:
      return;
  }
};

module.exports = {
  askForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
};
