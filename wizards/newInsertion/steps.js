const Markup = require('telegraf/markup');
const knex = require('../../db');
const logger = require('../../logger');
const {
  sellItemMenuMarkup,
  categoryMenuMarkup,
  getPaymentMethodsMenuMarkup,
  generateCaption,
  upsert,
} = require('../../helper');

// Import callback query types
const {
  HOME,
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD,
  PAYPAL,
  HYPE,
  CASH,
  TRANSFER,
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
  conditions,
} = require('../../types/callbacks.types');

const askForCategory = ctx => {
  ctx.wizard.state = {};
  ctx.reply('<b>Seleziona una categoria</b>', {
    parse_mode: 'HTML',
    reply_markup: categoryMenuMarkup,
  });
  return ctx.wizard.next();
};

const confirmCategoryAndAskForTitle = ctx => {
  if (!ctx.callbackQuery) {
    if (ctx.message) {
      // If user sends a message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(ctx.message.message_id);
    }
    return;
  }
  // Remove previous message to clean chat from useless old messages
  // ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const { data } = ctx.callbackQuery;
  if (data === HOME) {
    return ctx.scene.leave();
  }

  if (![CPU, GPU, RAM, MOBO, PSU, STORAGE, CASE, PERIPHERALS, COMPLETE_PC, OTHER].includes(data)) {
    return;
  }
  ctx.wizard.state.category = data;
  ctx.answerCbQuery();
  ctx.reply('<b>Quale prodotto vuoi vendere?</b>\n<i>Inserisci minimo 10 e massimo 50 caratteri</i>', {
    parse_mode: 'HTML',
  });
  return ctx.wizard.next();
};

const validateTitle = async ctx => {
  if (!ctx.message) {
    return;
  }
  if (!ctx.message.text) {
    // this could be a gif or a sticker and needs to be deleted in order to avoid chat cluttering
    ctx.deleteMessage(ctx.message.message_id);
    return;
  }
  const { text, message_id } = ctx.message;

  // Check if text is a bot command, commands are not accepted and need to be deleted
  if (text.startsWith('/')) {
    ctx.deleteMessage(message_id);
    return;
  }

  if (text.length > 50) {
    ctx.reply('Il testo inserito è troppo lungo');
    ctx.deleteMessage(message_id);
    return;
  }

  if (text.length < 10) {
    ctx.reply('Il testo inserito è troppo corto');
    ctx.deleteMessage(message_id);
    return;
  }

  // Update wizard state with given validated title
  ctx.wizard.state.title = text;

  // Ask for confirmation
  ctx.reply(`<b>Prodotto</b>: ${text}`, {
    reply_markup: sellItemMenuMarkup,
    parse_mode: 'HTML',
  });
  return ctx.wizard.next();
};

const confirmTitleAndAskForDescription = async ctx => {
  // If not callbackQuery, delete message if possible
  if (!ctx.callbackQuery) {
    if (ctx.message) {
      // If user sends random message, delete it in order to avoid chat cluttering
      ctx.deleteMessage(ctx.message.message_id);
    }
    return;
  }
  ctx.answerCbQuery();
  // ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const { data } = ctx.callbackQuery;
  switch (data) {
    case CLOSE_WIZARD:
      return ctx.scene.leave();
    case NEXT_STEP:
      await ctx.reply('<b>Aggiungi una breve descrizione</b>\n<i>Inserisci minimo 20 e  massimo 500 caratteri</i>', {
        parse_mode: 'HTML',
      });
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply('<b>Quale prodotto vuoi vendere?</b>\n<i>Inserisci massimo 50 caratteri</i>', {
        parse_mode: 'HTML',
      });
      return ctx.wizard.back();
    default:
      await ctx.reply('Bzzagrakkchhabz, Bot is dead, You killed the bot');
      return ctx.scene.leave();
  }
};

const validateDescription = async ctx => {
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

  if (text.length > 500) {
    ctx.reply('Il testo inserito è troppo lungo');
    ctx.deleteMessage(message_id);
    return;
  }

  if (text.length < 20) {
    ctx.reply('Il testo inserito è troppo corto');
    ctx.deleteMessage(message_id);
    return;
  }

  // Update wizard state with given validated description
  ctx.wizard.state.description = text;

  // Ask for confirmation
  await ctx.reply(`<b>Descrizione:</b> ${text}`, {
    reply_markup: sellItemMenuMarkup,
    parse_mode: 'HTML',
  });
  return ctx.wizard.next();
};

const confirmDescriptionAndAskForConditions = async ctx => {
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
      return ctx.scene.leave();
    case NEXT_STEP:
      await ctx.reply('<b>Seleziona la condizione estetica/funzionale del prodotto</b>', {
        parse_mode: 'HTML',
        reply_markup: getConditionsMarkup(),
      });
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      ctx.reply('<b>Aggiungi una breve descrizione</b>\n<i>Inserisci massimo 500 caratteri</i>', {
        parse_mode: 'HTML',
      });
      return ctx.wizard.back();
    default:
      await ctx.reply('Bzzagrakkchhabz, Bot is dead, You killed the bot');
      return ctx.scene.leave();
  }
};

const confirmConditionAndAskForLocation = async ctx => {
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
  if (!Object.values(conditions).includes(data)) {
    return;
  }
  ctx.wizard.state.condition = data;
  await ctx.reply('<b>Inserisci la località di vendita</b>\nPer favore digita massimo 40 caratteri', {
    parse_mode: 'HTML',
  });
  return ctx.wizard.next();
};

const validateLocation = async ctx => {
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

  if (text.length > 40) {
    ctx.reply('Il testo inserito è troppo lungo');
    ctx.deleteMessage(message_id);
    return;
  }

  // Update wizard state with given validated description
  ctx.wizard.state.location = text;

  // Ask for confirmation
  await ctx.reply(`<b>Località:</b> ${text}`, {
    reply_markup: sellItemMenuMarkup,
    parse_mode: 'HTML',
  });
  return ctx.wizard.next();
};

const confirmLocationAndAskForImages = async ctx => {
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
      return ctx.scene.leave();
    case NEXT_STEP:
      await ctx.reply(
        "<b>Invia una o piu foto del prodotto\nPuoi utilizzare esclusivamente immagini reali da te scattate che mostrino chiaramente il tuo tag telegram.\nGli annunci che non soddifano questi requisiti saranno scartati</b>\n<em>Quando hai finito premi sul pulsante 'Avanti'</em>",
        {
          parse_mode: 'HTML',
          reply_markup: Markup.keyboard(['Avanti', 'Annulla']).resize(),
        }
      );
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply('<b>Inserisci la località di vendita</b>\nPer favore digita massimo 40 caratteri', {
        parse_mode: 'HTML',
      });
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

    // Delete 'Avanti' message to avoid chat cluttering
    ctx.deleteMessage(ctx.message.message_id);

    // Prompt user to type value
    await ctx.reply(
      '<b>Inserisci il prezzo richiesto</b>\n<em>Scrivi solo il valore numerico, senza €\nIl valore massimo è 10.000€</em>',
      {
        parse_mode: 'HTML',
        reply_markup: Markup.removeKeyboard(), // Ask clients to remove keyboard
      }
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
  ctx.wizard.state.images = ctx.wizard.state.images === undefined ? [file_id] : [...ctx.wizard.state.images, file_id];
  return;
};

/* 
  Step 7 of Wizard - Price Validation
*/
const priceValidation = async ctx => {
  if (!ctx.message) {
    return;
  }
  if (!ctx.message.text || isNaN(parseFloat(ctx.message.text.replace(',', '.')))) {
    const { message_id } = ctx.message;
    // If user sends random message, delete it in order to avoid chat cluttering
    ctx.deleteMessage(message_id);
    return;
  }

  const { text } = ctx.message;
  // Convert string into a floating point number
  const receivedValue = parseFloat(text.replace(',', '.'));
  if (receivedValue > 10000) {
    ctx.reply('Il prezzo non deve superare 10000€\n<b>Inserisci il prezzo richiesto</b>');
    return;
  }
  ctx.wizard.state.value = receivedValue;
  await ctx.reply(`<b>Prezzo:</b> ${ctx.wizard.state.value}€`, {
    reply_markup: sellItemMenuMarkup,
    parse_mode: 'HTML',
  });
  return ctx.wizard.next();
};

const priceConfirmationAndSelectShippingCosts = async ctx => {
  if (!ctx.callbackQuery) {
    const { message_id } = ctx.message;
    // If user sends random message, delete it in order to avoid chat cluttering
    ctx.deleteMessage(message_id);
    return;
  }
  ctx.answerCbQuery();
  // ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const { data } = ctx.callbackQuery;
  switch (data) {
    case CLOSE_WIZARD:
      return ctx.scene.leave();
    case NEXT_STEP:
      ctx.reply('<b>Le spese di spedizione sono...</b>', {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton('Incluse', 'incluse')],
          [Markup.callbackButton('Escluse', 'escluse')],
        ]),
      });
      return ctx.wizard.next();
    case PREVIOUS_STEP:
      await ctx.reply('Inserisci il prezzo richiesto (scrivi solo il valore numerico, senza €)');
      return ctx.wizard.back();
    default:
      await ctx.reply('Bzzagrakkchhabz', 'Bot is dead', 'You killed the bot');
      return ctx.scene.leave();
  }
};

const shippingCostsConfirmationAndShowPaymentsKeyboard = async ctx => {
  if (!ctx.callbackQuery) {
    const { message_id } = ctx.message;
    // If user sends random message, delete it in order to avoid chat cluttering
    ctx.deleteMessage(message_id);
    return;
  }
  ctx.answerCbQuery();
  // ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const { data } = ctx.callbackQuery;
  ctx.wizard.state.shippingCosts = data;
  ctx.wizard.state.paymentMethods = [];
  const paymentMethodsPrompt = getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods);
  ctx.reply('<b>Seleziona i metodi di pagamento</b>', {
    parse_mode: 'HTML',
    reply_markup: paymentMethodsPrompt,
  });
  ctx.wizard.next();
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
        ctx.answerCbQuery('Seleziona un metodo di pagamento');
        ctx.reply('Seleziona almeno un metodo di pagamento');
        return;
      }
      const {
        title,
        description,
        images,
        value,
        category,
        paymentMethods,
        condition,
        location,
        shippingCosts,
      } = ctx.wizard.state;
      const { username, id, first_name } = ctx.from;

      // generate array of inputMediaPhoto to be sent with sendMediaGroup
      const media = images.map(file_id => {
        return {
          type: 'photo',
          media: file_id,
        };
      });

      try {
        await upsert({
          table: 'users',
          object: { id, username, first_name },
          constraint: '(id)',
        });
      } catch (error) {
        ctx.reply('Qualcosa è andato storto, il bot potrebbe essere in manutenzione, riprova piu tardi');
        ctx.scene.leave();
        logger.error(error);
      }

      // Insert announce in DB
      let announceId;
      try {
        const result = await knex('insertions')
          .returning('id')
          .insert({
            product: title,
            user_id: id,
            category,
            condition,
          });
        announceId = result[0];
      } catch (error) {
        ctx.reply('Qualcosa è andato storto, il bot potrebbe essere in manutenzione, riprova piu tardi');
        ctx.scene.leave();
        console.log(error);
        logger.error('Cannot save sale announcement to the database');
      }

      // Save insertion's images
      ctx.wizard.state.images.forEach(file_id => {
        try {
          upsert({
            table: 'images',
            object: {
              file_id,
              insertion_id: announceId,
            },
            constraint: '(file_id)',
          });
        } catch (error) {
          console.log(error);
        }
      });

      media[0].caption = generateCaption(
        announceId,
        category,
        username,
        title,
        description,
        value,
        paymentMethods,
        condition,
        location,
        shippingCosts
      );
      try {
        ctx.telegram.sendMediaGroup(process.env.SECRET_CHAT_ID, media);
      } catch (error) {
        ctx.reply('Errore, impossibile inviare il tuo messaggio. Riprova piu tardi');
        return ctx.scene.leave();
      }
      // ctx.deleteMessage(ctx.callbackQuery.message.message_id);
      await ctx.reply(
        '<b>OPERAZIONE COMPLETATA</b>\n\nGrazie, il tuo messaggio è stato inviato agli amministratori che provvederanno alla convalida del tuo annuncio.',
        { parse_mode: 'HTML' }
      );
      return ctx.scene.leave();
    case PAYPAL:
      // If paypal is already present
      if (ctx.wizard.state.paymentMethods.includes('Paypal')) {
        // Remove it
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(method => {
          return method !== 'Paypal';
        });
        ctx.answerCbQuery('Paypal rimosso');
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined ? ['Paypal'] : [...ctx.wizard.state.paymentMethods, 'Paypal'];
        ctx.answerCbQuery('Paypal aggiunto');
      }
      // Update message with dynamically generated inline keyboard of payment methods
      try {
        await ctx.editMessageReplyMarkup(getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods));
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
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(method => {
          return method !== 'Hype';
        });
        ctx.answerCbQuery('Hype rimosso');
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined ? ['Hype'] : [...ctx.wizard.state.paymentMethods, 'Hype'];
        ctx.answerCbQuery('Hype aggiunto');
      }
      try {
        await ctx.editMessageReplyMarkup(getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods));
        return;
      } catch (error) {
        logger.error(error);
        ctx.reply('Si è verificato un errore, riprova piu tardi');
        ctx.scene.leave();
      }
      return;
    case CASH:
      // If cash is already present
      if (ctx.wizard.state.paymentMethods.includes('Contante')) {
        // Remove it
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(method => {
          return method !== 'Contante';
        });
        ctx.answerCbQuery('Contante rimosso');
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Contante']
            : [...ctx.wizard.state.paymentMethods, 'Contante'];
        ctx.answerCbQuery('Contante aggiunto');
      }
      try {
        await ctx.editMessageReplyMarkup(getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods));
        return;
      } catch (error) {
        logger.error(error);
        ctx.reply('Si è verificato un errore, riprova piu tardi');
        ctx.scene.leave();
      }
      return;
    case TRANSFER:
      // If transfer is already present
      if (ctx.wizard.state.paymentMethods.includes('Bonifico')) {
        // Remove it
        ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(method => {
          return method !== 'Bonifico';
        });
        ctx.answerCbQuery('Bonifico Rimosso');
      } else {
        ctx.wizard.state.paymentMethods =
          ctx.wizard.state.paymentMethods === undefined
            ? ['Bonifico']
            : [...ctx.wizard.state.paymentMethods, 'Bonifico'];

        ctx.answerCbQuery('Bonifico aggiunto');
      }
      try {
        await ctx.editMessageReplyMarkup(getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods));
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

// Helpers
const getConditionsMarkup = () => {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(conditions.LIKE_NEW, conditions.LIKE_NEW)],
    [Markup.callbackButton(conditions.VERY_GOOD, conditions.VERY_GOOD)],
    [Markup.callbackButton(conditions.GOOD, conditions.GOOD)],
    [Markup.callbackButton(conditions.ACCEPTABLE, conditions.ACCEPTABLE)],
    [Markup.callbackButton(conditions.BROKEN, conditions.BROKEN)],
  ]).resize();
};

module.exports = {
  askForCategory,
  confirmCategoryAndAskForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForConditions,
  confirmConditionAndAskForLocation,
  validateLocation,
  confirmLocationAndAskForImages,
  validateImagesAndAskForPrice,
  priceValidation,
  priceConfirmationAndSelectShippingCosts,
  shippingCostsConfirmationAndShowPaymentsKeyboard,
  updatePaymentMethods,
};
