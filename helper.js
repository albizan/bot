const Markup = require('telegraf/markup');

const {
  SELL_ITEM,
  SEEK_ITEM,
  SUPPORT_CHAT,
} = require('./types/callbacks.types');
const {
  package,
  memo,
  moneyBag,
  moneyFly,
  silhouette,
  checkMark,
} = require('./emoji');
// Import callback query types
const {
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD,
  PAYPAL,
  HYPE,
  CASH,
  TRANSFER,
} = require('./types/callbacks.types');

const generateCaption = (
  first_name,
  username,
  id,
  title,
  description,
  value,
  paymentMethods
) => {
  return `\n${package} Prodotto ${package}\n${title}
    \n\n${memo} Descrizione ${memo}\n${description}
    \n\n${moneyBag} Prezzo Richiesto ${moneyBag}\n${value}€
    \n\n${moneyFly}Pagamenti Accettati${moneyFly}\n${paymentMethods.join(' ')}
    \n\n${silhouette} Contatto ${silhouette}\nUsername: @${username}\nID: ${id}`;
};

const sellItemMenuMarkup = Markup.inlineKeyboard([
  [
    Markup.callbackButton(`Modifica`, PREVIOUS_STEP),
    Markup.callbackButton('Esci', CLOSE_WIZARD),
    Markup.callbackButton(`Avanti`, NEXT_STEP),
  ],
])
  .oneTime()
  .resize();

// Return the reply_markup with an inline keyboard used to choose payment methods
const getPaymentMethodsMenuMarkup = paymentMethods => {
  return Markup.inlineKeyboard(generatePaymentsInlineKeyboard(paymentMethods));
};

// This is just the markup of the payment inline keyboard
const generatePaymentsInlineKeyboard = paymentMethods => {
  return [
    [
      Markup.callbackButton(
        `${paymentMethods.includes('Paypal') ? checkMark : ''} Paypal`,
        PAYPAL
      ),
      Markup.callbackButton(
        `${paymentMethods.includes('Hype') ? checkMark : ''} Hype`,
        HYPE
      ),
    ],
    [
      Markup.callbackButton(
        `${paymentMethods.includes('Contante') ? checkMark : ''} Contante`,
        CASH
      ),
      Markup.callbackButton(
        `${paymentMethods.includes('Bonifico') ? checkMark : ''} Bonifico`,
        TRANSFER
      ),
    ],
    [
      Markup.callbackButton('Annulla', CLOSE_WIZARD),
      Markup.callbackButton('Avanti', NEXT_STEP),
    ],
  ];
};

const startMenuMarkup = Markup.inlineKeyboard([
  [
    Markup.callbackButton('Ricerca', SEEK_ITEM),
    Markup.callbackButton('Vendita', SELL_ITEM),
  ],
  [Markup.callbackButton('Chatta con gli admin', SUPPORT_CHAT)],
])
  .oneTime()
  .resize();

module.exports = {
  startMenuMarkup,
  generateCaption,
  sellItemMenuMarkup,
  getPaymentMethodsMenuMarkup,
  generatePaymentsInlineKeyboard,
};
