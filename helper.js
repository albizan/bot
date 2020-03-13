const Markup = require('telegraf/markup');

// Import Database
const knex = require('./db');

const { package, memo, moneyBag, moneyFly, silhouette, checkMark, conditions, pushPin } = require('./emoji');
// Import callback query types
const {
  NEW_INSERTION,
  MANAGE_INSERTIONS,
  BOT_INFO,
  SEARCH_INSERTION_BY_CATEGORY,
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD,
  HOME,
  payments,
  categories,
} = require('./types/callbacks.types');

const generateCaption = (insertionId, category, username, title, description, value, paymentMethods, condition, location, shippingCosts) => {
  const ss = shippingCosts => {
    if (shippingCosts === 'Consegna a mano') {
      return `(${shippingCosts})`;
    }
    return `(Spese di spedizione ${shippingCosts})`;
  };
  return `\n${package} Prodotto ${package}\n${title}
    \n${conditions} Condizione ${conditions}\n${condition}
    \n${memo} Descrizione ${memo}\n${description}
    \n${moneyBag} Prezzo Richiesto ${moneyBag}\n${value}€ ${ss(shippingCosts)}
    \n${pushPin} Località ${pushPin}\n${location}
    \n${moneyFly}Pagamenti Accettati${moneyFly}\n${paymentMethods.join(', ')}
    \n${silhouette} Contatto ${silhouette}\n@${username}
    \n\nCategoria: #${category}
    \n#av${insertionId}`;
};

const generateSearchAnnouncement = (first_name, username, id, title, description, price, paymentMethods) => {
  return `<b>NUOVO ANNUNCIO DI RICERCA</b>\n\n${package} Prodotto: ${package}\n${title}
    \n\n${memo} Descrizione ${memo}\n${description}
    \n\n${moneyBag} Prezzo: ${moneyBag}\n${price}€
    \n\n${moneyFly} Metodi di pagamento:${moneyFly}\n${paymentMethods.join(' ')}
    \n\n${silhouette} Contatto ${silhouette}\nUsername: @${username}\nID: ${id}`;
};

// Return the reply_markup with an inline keyboard used to choose payment methods
const getPaymentMethodsMenuMarkup = paymentMethods => {
  return Markup.inlineKeyboard(generatePaymentsInlineKeyboard(paymentMethods));
};

// This is just the markup of the payment inline keyboard
const generatePaymentsInlineKeyboard = paymentMethods => {
  return [
    [
      Markup.callbackButton(`${paymentMethods.includes('Paypal') ? checkMark : ''} Paypal`, payments.PAYPAL),
      Markup.callbackButton(`${paymentMethods.includes('Hype') ? checkMark : ''} Hype`, payments.HYPE),
    ],
    [
      Markup.callbackButton(`${paymentMethods.includes('Contante') ? checkMark : ''} Contante`, payments.CASH),
      Markup.callbackButton(`${paymentMethods.includes('Bonifico') ? checkMark : ''} Bonifico`, payments.TRANSFER),
    ],
    [Markup.callbackButton('Annulla', CLOSE_WIZARD), Markup.callbackButton('Avanti', NEXT_STEP)],
  ];
};

const startMenuMarkup = Markup.inlineKeyboard([
  [Markup.callbackButton('Nuovo annuncio', NEW_INSERTION)],
  [Markup.callbackButton('I miei annunci', MANAGE_INSERTIONS)],
  [Markup.callbackButton('Cerca per categoria', SEARCH_INSERTION_BY_CATEGORY)],
  [Markup.callbackButton('Info sul BOT', BOT_INFO)],
]).resize();

const upsert = params => {
  const { table, object, constraint } = params;
  const insert = knex(table).insert(object);
  const update = knex.queryBuilder().update(object);
  return knex
    .raw(`? ON CONFLICT ${constraint} DO ? returning *`, [insert, update])
    .get('rows')
    .get(0);
};

const getWelcomeMessage = first_name => {
  return `Ciao <b>${first_name}</b>\n\nBenvenuto/a nel BOT ufficiale del gruppo MIT - Mercatino Informatica e Tecnologia\n\nQuesto bot ti permette di creare annunci di vendita per le tue componenti informatiche e non solo.\n\nPrima di essere pubblicati sul canale ufficiale @mitvendita, gli annunci verranno valutati ed eventualmente approvati dallo <b>STAFF</b>`;
};

module.exports = {
  startMenuMarkup,
  generateCaption,
  generateSearchAnnouncement,
  getPaymentMethodsMenuMarkup,
  generatePaymentsInlineKeyboard,
  upsert,
  getWelcomeMessage,
};
