const Markup = require('telegraf/markup');
const knex = require('../../db');
const { upsert } = require('../../db/helper');

const { HOME, NEXT_STEP, PREVIOUS_STEP, categories, conditions, payments } = require('../../types/callbacks.types');

const { package, memo, moneyBag, moneyFly, silhouette, checkMark, conditionMark, pushPin } = require('../../emoji');

function insertionWizardPrompt() {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(`<< Modifica`, PREVIOUS_STEP), Markup.callbackButton('Home', HOME), Markup.callbackButton(`Avanti >>`, NEXT_STEP)],
  ]).resize();
}

function getConditionsMarkup() {
  return Markup.inlineKeyboard([
    [
      Markup.callbackButton('Nuovo', conditions.LIKE_NEW),
      Markup.callbackButton('Ottime', conditions.VERY_GOOD),
      Markup.callbackButton('Buone', conditions.GOOD),
    ],
    [Markup.callbackButton('Accettabili', conditions.ACCEPTABLE), Markup.callbackButton('Rotto', conditions.BROKEN)],
    [Markup.callbackButton('Torna alla Home', HOME)],
  ]).resize();
}

const generatePaymentsInlineKeyboard = paymentMethods => {
  return [
    [
      Markup.callbackButton(`${paymentMethods.includes('Paypal') ? checkMark : ''} Paypal`, payments.PAYPAL),
      Markup.callbackButton(`${paymentMethods.includes('Hype') ? checkMark : ''} Hype`, payments.HYPE),
    ],
    [
      Markup.callbackButton(`${paymentMethods.includes('Contanti') ? checkMark : ''} Contante`, payments.CASH),
      Markup.callbackButton(`${paymentMethods.includes('Bonifico') ? checkMark : ''} Bonifico`, payments.TRANSFER),
    ],
    [Markup.callbackButton('Home', HOME), Markup.callbackButton('Avanti', NEXT_STEP)],
  ];
};

function getPaymentMethodsMenuMarkup(paymentMethods) {
  return Markup.inlineKeyboard(generatePaymentsInlineKeyboard(paymentMethods));
}

async function handleAnnounce(ctx) {
  if (ctx.wizard.state.paymentMethods.length <= 0) {
    ctx.answerCbQuery();
    ctx.reply('<b>Seleziona almeno un metodo di pagamento</b>', {
      parse_mode: 'HTML',
    });
    return;
  }
  const { title, description, images, value, category, paymentMethods, condition, location, shippingCosts } = ctx.wizard.state;
  const { username, id, first_name } = ctx.from;

  // Set max length for images
  if (images.length > 3) {
    images.length = 3;
  }

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
    console.log(error);
    ctx.reply('Impossibile aggiornare utente nel DB, il bot potrebbe essere in manutenzione');
    ctx.scene.leave();
    return;
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
    console.log(error);
    ctx.reply('Impossibile salvare annuncio nel DB, il bot potrebbe essere in manutenzione');
    ctx.scene.leave();
    return;
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
      ctx.reply('Impossibile salvare le immagini nel DB, il bot potrebbe essere in manutenzione');
      ctx.scene.leave();
      return;
    }
  });

  // Give captiojn to first image of media group
  media[0].caption = generateCaption(announceId, category, username, title, description, value, paymentMethods, condition, location, shippingCosts);
  try {
    ctx.telegram.sendMediaGroup(process.env.SECRET_CHAT_ID, media);
  } catch (error) {
    ctx.reply('Errore, impossibile inviare il tuo annuncio agli admin, il bot potrebbe essere in manutenzione');
    ctx.scene.leave();
    return;
  }
  await ctx.reply(
    '<b>OPERAZIONE COMPLETATA</b>\n\nGrazie, il tuo annuncio è stato inviato agli amministratori che provvederanno alla convalida del tuo annuncio.\n\n',
    { parse_mode: 'HTML' }
  );
  return;
}

function generateCaption(insertionId, category, username, title, description, value, paymentMethods, condition, location, shippingCosts) {
  const ss = shippingCosts => {
    if (shippingCosts === 'Consegna a mano') {
      return `(${shippingCosts})`;
    }
    return `(Spese di spedizione ${shippingCosts})`;
  };
  return `\n${package} Prodotto ${package}\n${title}
    \n${conditionMark} Condizione ${conditionMark}\n${condition}
    \n${memo} Descrizione ${memo}\n${description}
    \n${moneyBag} Prezzo Richiesto ${moneyBag}\n${value}€ ${ss(shippingCosts)}
    \n${pushPin} Località ${pushPin}\n${location}
    \n${moneyFly}Pagamenti Accettati${moneyFly}\n${paymentMethods.join(', ')}
    \n${silhouette} Contatto ${silhouette}\n@${username}
    \n\nCategoria: #${category}
    \n#av${insertionId}`;
}

function handlePaymentToggle(ctx, payment) {
  if (ctx.wizard.state.paymentMethods.includes(payment)) {
    // Remove payment
    ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods.filter(currentPayment => {
      return currentPayment !== payment;
    });
    ctx.answerCbQuery(`${payment} rimosso`);
  } else {
    ctx.wizard.state.paymentMethods = ctx.wizard.state.paymentMethods === undefined ? [payment] : [...ctx.wizard.state.paymentMethods, payment];
    ctx.answerCbQuery(`${payment} aggiunto`);
  }
  try {
    ctx.editMessageReplyMarkup(getPaymentMethodsMenuMarkup(ctx.wizard.state.paymentMethods));
  } catch (error) {
    console.log(error);
    ctx.reply('Errore fatale, il bot potrebbe essere in manutenzione');
    ctx.scene.leave();
  }
}

module.exports = {
  insertionWizardPrompt,
  getConditionsMarkup,
  getPaymentMethodsMenuMarkup,
  handleAnnounce,
  handlePaymentToggle,
};
