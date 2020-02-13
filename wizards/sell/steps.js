const Markup = require('telegraf/markup');
const logger = require('../../logger');
const {
  sellItemMenuMarkup,
  getPaymentMethodsMenuMarkup,
  generateCaption,
} = require('../../helper');

// Import sell item wizard type
const { SELL_ITEM_WIZARD } = require('../../types/scenes.types');

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
  logger.info(`${ctx.from.username} entered ${SELL_ITEM_WIZARD}`);
  ctx.wizard.state = {};
  ctx.reply("<b>Inserisci il titolo dell'annuncio</b>", { parse_mode: 'HTML' });
  return ctx.wizard.next();
};

/*
  Step 2 of Wizard - Validate Title
  Validate user's response (updates othen than text messages are deleted)
  Update wizard's state with given title
  Show Title and prompt user for confirmation
*/
const validateTitle = async ctx => {
  logger.info(`${ctx.from.username} entered step 2 of ${SELL_ITEM_WIZARD}`);
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
  await ctx.reply(`${package} Titolo: ${text}`, {
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
  logger.info(`${ctx.from.username} entered step 3 of ${SELL_ITEM_WIZARD}`);

  // If not callbackQuery, delete message if possible
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
      logger.info(`${ctx.from.username} exited ${SELL_ITEM_WIZARD} in step 3`);
      return ctx.scene.leave();
    case NEXT_STEP:
      await ctx.reply('Inserisci una descrizione');
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply("Reinserisci il titolo dell'annuncio");
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
const confirmDescriptionAndAskForImages = async ctx => {
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
      logger.info(`${ctx.from.username} exited ${SELL_ITEM_WIZARD} in step 5`);
      return ctx.scene.leave();
    case NEXT_STEP:
      await ctx.reply(
        "Invia una o piu foto del prodotto, quando hai finito premi sul pulsante 'Avanti'",
        Markup.keyboard(['Avanti', 'Annulla'])
          .oneTime()
          .resize()
          .extra()
      );
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply("Reinserisci la descrizione dell'annuncio");
      return ctx.wizard.back();
    default:
      await ctx.reply('Bzzagrakkchhabz, Bot is dead, You killed the bot');
      return ctx.scene.leave();
  }
};

/*
  Step 6 of Wizard - Images Validation and Ask for product's price
  Add image ids to wizard state and proceed when user sends 'Avanti' message or click on Avanti button
*/
const validateImagesAndAskForPrice = async ctx => {
  logger.info(`${ctx.from.username} entered step 6 of ${SELL_ITEM_WIZARD}`);

  // User did not send an image
  if (!ctx.message) {
    return;
  }

  // User wants to submit all sent images
  if (ctx.message.text === 'Avanti') {
    // User did not send any image
    if (!ctx.wizard.state.images) {
      ctx.reply(
        "Inserisci almeno un'immagine",
        Markup.keyboard(['Avanti', 'Annulla'])
          .oneTime()
          .resize()
          .extra()
      );
      return;
    }

    // Prompt user to type value
    await ctx.reply(
      'Inserisci il prezzo richiesto (scrivi solo il valore numerico, senza €)',
      Markup.removeKeyboard().extra() // Ask clients to remove keyboard
    );
    return ctx.wizard.next();
  } else if (ctx.message.text === 'Annulla') {
    return ctx.scene.leave();
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
};

/* 
  Step 7 of Wizard - Price Validation
*/
const priceValidation = async ctx => {
  logger.info(`${ctx.from.username} entered step 7 of ${SELL_ITEM_WIZARD}`);

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
      logger.info(`${ctx.from.username} exited ${SELL_ITEM_WIZARD} in step 8`);
      return ctx.scene.leave();
    case NEXT_STEP:
      logger.info(`${ctx.from.username} confirmed value`);
      ctx.wizard.state.paymentMethods = [];
      const paymentMethodsPrompt = getPaymentMethodsMenuMarkup(
        ctx.wizard.state.paymentMethods
      );
      ctx.reply('Seleziona i metodi di pagamento', {
        reply_markup: paymentMethodsPrompt,
      });
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
      const {
        title,
        description,
        images,
        value,
        paymentMethods,
      } = ctx.wizard.state;
      const { username, first_name, id } = ctx.from;
      try {
        // generate array of inputMediaPhoto to be sent with sendMediaGroup
        const media = images.map(file_id => {
          return {
            type: 'photo',
            media: file_id,
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
        ctx.telegram.sendMediaGroup(ctx.from.id, media);
        await ctx.telegram.sendMediaGroup(process.env.SECRET_CHAT_ID, media);
        logger.info(`${ctx.from.username} completed ${SELL_ITEM_WIZARD}`);
        ctx.reply(
          'Grazie, il tuo messaggio è stato inviato agli amministratori che provvederanno alla convalida del tuo annuncio. In caso di problemi verrai ricontattato'
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
        logger.info(`${ctx.from.username} removed Paypal as a payment method`);
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Paypal']
            : [...ctx.wizard.state.paymentMethods, 'Paypal'];
        logger.info(`${ctx.from.username} added Paypal as a payment method`);
      }
      // Update message with dynamically generated inline keyboard of payment methods
      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
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
        logger.info(`${ctx.from.username} removed Hype as a payment method`);
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Hype']
            : [...ctx.wizard.state.paymentMethods, 'Hype'];
        logger.info(`${ctx.from.username} added Hype as a payment method`);
      }
      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
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
        logger.info(`${ctx.from.username} removed Cash as a payment method`);
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Contante']
            : [...ctx.wizard.state.paymentMethods, 'Contante'];
        logger.info(`${ctx.from.username} added Cash as a payment method`);
      }
      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
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
        logger.info(
          `${ctx.from.username} removed Transfer as a payment method`
        );
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Bonifico']
            : [...ctx.wizard.state.paymentMethods, 'Bonifico'];
        logger.info(`${ctx.from.username} added Transfer as a payment method`);
      }
      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id,
          ctx.callbackQuery.inline_message_id,
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
  confirmDescriptionAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
};
