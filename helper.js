const Markup = require('telegraf/markup');

// Import Database
const knex = require('./db');

const { package, memo, moneyBag, moneyFly, silhouette, checkMark, conditions, pushPin } = require('./emoji');
// Import callback query types
const {
  NEW_INSERTION,
  BOT_INFO,
  SEARCH_INSERTION_BY_CATEGORY,
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD,
  payments,
  categories,
} = require('./types/callbacks.types');

const generateCaption = (
  insertionId,
  category,
  username,
  title,
  description,
  value,
  paymentMethods,
  condition,
  location,
  shippingCosts
) => {
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

const sellItemMenuMarkup = Markup.inlineKeyboard([
  [
    Markup.callbackButton(`Modifica`, PREVIOUS_STEP),
    Markup.callbackButton('Esci', CLOSE_WIZARD),
    Markup.callbackButton(`Avanti`, NEXT_STEP),
  ],
]).resize();

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

const getSelectCategoryMarkup = () => {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(categories.CPU, categories.CPU), Markup.callbackButton(categories.GPU, categories.GPU)],
    [Markup.callbackButton(categories.PSU, categories.PSU), Markup.callbackButton(categories.MOBO, categories.MOBO)],
    [
      Markup.callbackButton(categories.RAM, categories.RAM),
      Markup.callbackButton(categories.STORAGE, categories.STORAGE),
    ],
    [
      Markup.callbackButton(categories.CASE, categories.CASE),
      Markup.callbackButton(categories.PERIPHERALS, categories.PERIPHERALS),
    ],
    [Markup.callbackButton(categories.COMPLETE_PC, categories.COMPLETE_PC)],
    [Markup.callbackButton(categories.OTHER, categories.OTHER)],
  ]).resize();
};

const startMenuMarkup = Markup.inlineKeyboard([
  [Markup.callbackButton('Nuovo Annuncio di Vendita', NEW_INSERTION)],
  // [Markup.callbackButton('Nuovo Annuncio di Ricerca', SEEK_ITEM)],
  [Markup.callbackButton('Cerca per Categoria', SEARCH_INSERTION_BY_CATEGORY)],
  [Markup.callbackButton('Info sul BOT', BOT_INFO)],
  // [Markup.callbackButton('Supporto', SUPPORT_CHAT)],
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
  return `Ciao <b>${first_name}</b>\n\nBenvenuto/a nel BOT ufficiale del gruppo <a href="https://t.me/joinchat/BUc_2U-1GRQClo4MllBuFA">MIT - Mercatino Informatica e Tecnologia</a>\n\nTi ricordo che in qualunque momento puoi tornare in questo menu con il comando /start\nQuesto bot ti permette di creare annunci di vendita per le tue componenti informatiche e non solo. Tutti gli annunci, prima di essere pubblicati sul canale ufficiale @mitvendita, verranno valutati ed eventualmente approvati dallo <b>STAFF</b>`;
};

module.exports = {
  startMenuMarkup,
  getSelectCategoryMarkup,
  generateCaption,
  generateSearchAnnouncement,
  sellItemMenuMarkup,
  getPaymentMethodsMenuMarkup,
  generatePaymentsInlineKeyboard,
  upsert,
  getWelcomeMessage,
};
