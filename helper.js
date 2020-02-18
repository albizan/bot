const Markup = require('telegraf/markup');

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
  SELL_ITEM,
  SEEK_ITEM,
  SUPPORT_CHAT,
  SEARCH,
  NEXT_STEP,
  PREVIOUS_STEP,
  CLOSE_WIZARD,
  PAYPAL,
  HYPE,
  CASH,
  TRANSFER,
} = require('./types/callbacks.types');

const generateCaption = (
  announceId,
  category,
  username,
  title,
  description,
  value,
  paymentMethods
) => {
  return `\n${package} Prodotto ${package}\n${title}
    \n\n${memo} Descrizione ${memo}\n${description}
    \n\n${moneyBag} Prezzo Richiesto ${moneyBag}\n${value}€
    \n\n${moneyFly}Pagamenti Accettati${moneyFly}\n${paymentMethods.join('\n')}
    \n\n${silhouette} Contatto ${silhouette}\nUsername: @${username}\n\n#${category}\n#av${announceId}`;
};

const generateSearchAnnouncement = (
  first_name,
  username,
  id,
  title,
  description,
  price,
  paymentMethods
) => {
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
  [Markup.callbackButton('Nuovo Annuncio di Vendita', SELL_ITEM)],
  [Markup.callbackButton('Nuovo Annuncio di Ricerca', SEEK_ITEM)],
  [Markup.callbackButton('Cerca per Categoria', SEARCH)],
  [Markup.callbackButton('Supporto', SUPPORT_CHAT)],
])
  .oneTime()
  .resize();

module.exports = {
  startMenuMarkup,
  generateCaption,
  generateSearchAnnouncement,
  sellItemMenuMarkup,
  getPaymentMethodsMenuMarkup,
  generatePaymentsInlineKeyboard,
};
