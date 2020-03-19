const Markup = require('telegraf/markup');
const { upsert } = require('./db/helper');

// Import callback query types
const {
  INSERTION_TYPE_SELECTOR,
  MANAGE_INSERTIONS,
  BOT_INFO,
  SEARCH_INSERTION_BY_CATEGORY,
  SEARCH_FEEDBACK,
  HOME,
  categories,
} = require('./types/callbacks.types');

const startMenuMarkup = Markup.inlineKeyboard([
  [Markup.callbackButton('Nuovo annuncio', INSERTION_TYPE_SELECTOR)],
  [Markup.callbackButton('I miei annunci', MANAGE_INSERTIONS)],
  [Markup.callbackButton('Cerca per categoria', SEARCH_INSERTION_BY_CATEGORY)],
  [Markup.callbackButton('Cerca feedback utente', SEARCH_FEEDBACK)],
  [Markup.callbackButton('Info sul BOT', BOT_INFO)],
]).resize();

const getWelcomeMessage = first_name => {
  return `Ciao <b>${first_name}</b>\n\nBenvenuto/a nel BOT ufficiale del gruppo MIT - Mercatino Informatica e Tecnologia\n\nQuesto bot ti permette di creare annunci di vendita per le tue componenti informatiche e non solo.\n\nPrima di essere pubblicati sul canale ufficiale @mitvendita, gli annunci verranno valutati ed eventualmente approvati dallo <b>STAFF</b>`;
};

function getSelectCategoryMarkup() {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(categories.CPU, categories.CPU), Markup.callbackButton(categories.GPU, categories.GPU)],
    [Markup.callbackButton(categories.PSU, categories.PSU), Markup.callbackButton(categories.MOBO, categories.MOBO)],
    [Markup.callbackButton(categories.RAM, categories.RAM), Markup.callbackButton(categories.STORAGE, categories.STORAGE)],
    [Markup.callbackButton(categories.COMPLETE_PC, categories.COMPLETE_PC), Markup.callbackButton(categories.PERIPHERALS, categories.PERIPHERALS)],
    [Markup.callbackButton(categories.CASE, categories.CASE), Markup.callbackButton(categories.OTHER, categories.OTHER)],
    [Markup.callbackButton('Torna alla Home', HOME)],
  ]).resize();
}

function filterUpdates(ctx, updateType, minLength, maxLength) {
  switch (updateType) {
    case 'callback_query':
      if (!ctx.callbackQuery) {
        // If user sends a message, delete it in order to avoid chat cluttering
        if (ctx.message) {
          ctx.deleteMessage(ctx.message.message_id);
        }
        return null;
      }
      ctx.answerCbQuery();
      const { data } = ctx.callbackQuery;
      if (data === HOME) {
        ctx.scene.leave();
        return null;
      }
      return data;

    case 'message':
      if (!ctx.message) {
        return null;
      }
      if (!ctx.message.text) {
        // This could be a gif or a sticker and needs to be deleted in order to avoid chat cluttering
        ctx.deleteMessage(ctx.message.message_id);
        return null;
      }
      const { text, message_id } = ctx.message;

      // Check if text is a bot command, commands are not accepted and need to be deleted
      if (text.startsWith('/')) {
        ctx.deleteMessage(message_id);
        return null;
      }

      if (text.length > maxLength) {
        ctx.reply('Il testo inserito è troppo lungo, riprova');
        // ctx.deleteMessage(message_id);
        return null;
      }

      if (text.length < minLength) {
        ctx.reply('Il testo inserito è troppo corto, riprova');
        // ctx.deleteMessage(message_id);
        return null;
      }

      // If I get here, text is valid
      return text;
  }
}

function getBotUrlMarkup() {
  return Markup.inlineKeyboard([[Markup.urlButton('...premi qua', process.env.BOT_URL)]]);
}

function getGoHomeMarkup() {
  return Markup.inlineKeyboard([[Markup.callbackButton('Torna alla Home', HOME)]]);
}

module.exports = {
  startMenuMarkup,
  filterUpdates,
  upsert,
  getWelcomeMessage,
  getSelectCategoryMarkup,
  getBotUrlMarkup,
  getGoHomeMarkup,
};
