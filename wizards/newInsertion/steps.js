const Markup = require('telegraf/markup');
const { package } = require('../../emoji');

const { insertionWizardPrompt, getConditionsMarkup, getPaymentMethodsMenuMarkup, handleAnnounce, handlePaymentToggle } = require('./helper');

const { filterUpdates, getSelectCategoryMarkup } = require('../../helper');

// Import callback query types
const { NEXT_STEP, PREVIOUS_STEP, HOME, payments, categories, conditions, shippingCosts } = require('../../types/callbacks.types');

// Show categories' keyboard and prompt user to select one
function askForCategory(ctx) {
  ctx.reply(
    `<b>${package} NUOVO ANNUNCIO ${package}\n\nSei entrato nel wizard che ti guiderà nella creazione di un annuncio di vendita\nTi ricordo che in qualunque momento puoi usare il comando /home per tornare al menu principale\n\nSeleziona una categoria</b>`,
    {
      parse_mode: 'HTML',
      reply_markup: getSelectCategoryMarkup(),
    }
  );
  ctx.wizard.next();
}

function validateCategoryAndAskForTitle(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  if (!data) {
    return;
  }
  if (!Object.values(categories).includes(data)) {
    return;
  }
  ctx.wizard.state.category = data;
  ctx.reply('<b>Inserisci il nome del prodotto</b>\n<i>(10 - 50 caratteri)</i>', {
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
}

function validateTitle(ctx) {
  const text = filterUpdates(ctx, 'message', 10, 50);
  if (!text) {
    return;
  }
  // If I get here, text is valid
  // Update wizard state with given validated title
  ctx.wizard.state.title = text;

  // Ask for confirmation
  ctx.reply(`Hai inserito:\n<b>${text}</b>\n\nProcedere?`, {
    reply_markup: insertionWizardPrompt(),
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
}

function confirmTitleAndAskForDescription(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  switch (data) {
    case NEXT_STEP:
      ctx.reply("<b>Inserisci la descrizione dell'annuncio</b>\n<i>(10 - 500 caratteri)</i>", {
        parse_mode: 'HTML',
      });
      ctx.wizard.next();
      break;
    case PREVIOUS_STEP:
      ctx.reply('<b>Inserisci il nome del prodotto</b>\n<i>(10 - 50 caratteri)</i>', {
        parse_mode: 'HTML',
      });
      ctx.wizard.back();
      break;
    default:
      return;
  }
}

function validateDescription(ctx) {
  const text = filterUpdates(ctx, 'message', 10, 500);
  if (!text) {
    return;
  }
  ctx.wizard.state.description = text;
  ctx.reply(`Hai inserito:\n<b>${text}</b>\n\nProcedere?`, {
    reply_markup: insertionWizardPrompt(),
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
}

function confirmDescriptionAndAskForConditions(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  switch (data) {
    case NEXT_STEP:
      ctx.reply('<b>Descrivi le condizioni del prodotto</b>', {
        parse_mode: 'HTML',
        reply_markup: getConditionsMarkup(),
      });
      ctx.wizard.next();
      break;
    case PREVIOUS_STEP:
      ctx.reply("<b>Inserisci la descrizione dell'annuncio</b> <i>(10 - 500 caratteri)</i>", {
        parse_mode: 'HTML',
      });
      ctx.wizard.back();
      break;
    default:
      return ctx.scene.leave();
  }
}

function confirmConditionAndAskForLocation(ctx) {
  const data = filterUpdates(ctx, 'callback_query');

  if (!Object.values(conditions).includes(data)) {
    return;
  }
  ctx.wizard.state.condition = data;
  ctx.reply('Inserisci <b>Località - Provincia</b>\nEsempio: <code>Rho - Milano</code>', {
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
}

function validateLocation(ctx) {
  const text = filterUpdates(ctx, 'message', 2, 40);
  if (!text) {
    return;
  }
  ctx.wizard.state.location = text;
  ctx.reply(`Hai inserito:\n<b>${text}</b>\n\nProcedere?`, {
    reply_markup: insertionWizardPrompt(),
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
}

function confirmLocationAndAskForImages(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  switch (data) {
    case NEXT_STEP:
      ctx.reply(
        "<b>Invia al massimo 3 foto del prodotto</b>\n<em>Nelle immagini deve essere presente un foglio di carta in cui si legga chiaramente il tuo username di Telegram\n\nQuando tutte le foto sono state caricate, premi sul pulsante 'Avanti'</em>\nPer tornare alla Home premi su 'Annulla'",
        {
          parse_mode: 'HTML',
          reply_markup: Markup.keyboard(['Avanti', 'Annulla']).resize(),
        }
      );
      ctx.wizard.next();
      break;
    case PREVIOUS_STEP:
      ctx.reply('<b>Inserisci la località di vendita</b>', {
        parse_mode: 'HTML',
      });
      ctx.wizard.back();
      break;
    default:
      ctx.scene.leave();
  }
}

function validateImagesAndAskForPrice(ctx) {
  // User did not send an image
  if (!ctx.message) {
    return;
  }

  // User wants to submit all sent images
  if (ctx.message.text === 'Avanti') {
    if (!ctx.wizard.state.images) {
      return;
    }
    // User did not send any image
    if (ctx.wizard.state.images.length <= 0) {
      ctx.reply("<b>Inserisci almeno un'immagine</b>", {
        parse_mode: 'HTML',
        reply_markup: Markup.keyboard(['Avanti', 'Annulla']).resize(),
      });
      return;
    }

    // Delete 'Avanti' message to avoid chat cluttering
    ctx.deleteMessage(ctx.message.message_id);

    // Prompt user to type value
    ctx.reply('<b>Inserisci il prezzo richiesto</b>\n<em>Scrivi solo valore numerico intero, senza il simbolo €\nIl valore massimo è 10.000</em>', {
      parse_mode: 'HTML',
      reply_markup: Markup.removeKeyboard(), // Ask clients to remove keyboard
    });
    ctx.wizard.next();
    return;
  } else if (ctx.message.text === 'Annulla') {
    ctx.scene.leave();
    return;
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
}

function priceValidation(ctx) {
  const text = filterUpdates(ctx, 'message', 0, 10);
  const receivedValue = parseInt(text);
  if (isNaN(receivedValue)) {
    ctx.reply('Valore inserito non valido\nReinserisci il prezzo richiesto');
    return;
  }
  if (receivedValue > 10000) {
    ctx.reply('Il prezzo non deve superare 10000€\nReinserisci il prezzo richiesto');
    return;
  }
  ctx.wizard.state.value = receivedValue;
  ctx.reply(`Hai inserito <b>${ctx.wizard.state.value}€</b>\n\nProcedere?`, {
    reply_markup: insertionWizardPrompt(),
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
}

function priceConfirmationAndSelectShippingCosts(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  switch (data) {
    case NEXT_STEP:
      ctx.reply('<b>Le spese di spedizione sono...</b>', {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton('Incluse', 'incluse'), Markup.callbackButton('Escluse', 'escluse')],
          [Markup.callbackButton('Consegna a mano', 'Consegna a mano')],
        ]),
      });
      ctx.wizard.next();
      break;
    case PREVIOUS_STEP:
      ctx.reply('Inserisci il prezzo richiesto (scrivi solo il valore numerico, senza €)');
      ctx.wizard.back();
      break;
    default:
      ctx.scene.leave();
  }
}

function shippingCostsConfirmationAndShowPaymentsKeyboard(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  if (!Object.values(shippingCosts).includes(data)) {
    return;
  }
  ctx.wizard.state.shippingCosts = data;
  ctx.wizard.state.paymentMethods = [];
  ctx.reply('<b>Seleziona i metodi di pagamento</b>', {
    parse_mode: 'HTML',
    reply_markup: getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods),
  });
  ctx.wizard.next();
}

async function updatePaymentMethods(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  if (!data) {
    return;
  }
  if (data === NEXT_STEP) {
    await handleAnnounce(ctx);
    ctx.reply('Per tornare alla home ...', {
      reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('... premi qui', HOME)]]),
    });
  }
  if (Object.values(payments).includes(data)) {
    handlePaymentToggle(ctx, data);
  }
}

function goHome(ctx) {
  filterUpdates(ctx, 'callback_query');
}

module.exports = {
  askForCategory,
  validateCategoryAndAskForTitle,
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
  goHome,
};
