const Markup = require('telegraf/markup');

const { HOME, NEXT_STEP, PREVIOUS_STEP, categories } = require('../../types/callbacks.types');

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

function getSelectCategoryMarkup() {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(categories.CPU, categories.CPU), Markup.callbackButton(categories.GPU, categories.GPU)],
    [Markup.callbackButton(categories.PSU, categories.PSU), Markup.callbackButton(categories.MOBO, categories.MOBO)],
    [Markup.callbackButton(categories.RAM, categories.RAM), Markup.callbackButton(categories.STORAGE, categories.STORAGE)],
    [Markup.callbackButton(categories.CASE, categories.CASE), Markup.callbackButton(categories.PERIPHERALS, categories.PERIPHERALS)],
    [Markup.callbackButton(categories.COMPLETE_PC, categories.COMPLETE_PC), Markup.callbackButton(categories.OTHER, categories.OTHER)],
    [Markup.callbackButton(HOME, HOME)],
  ]).resize();
}

function insertionWizardPrompt() {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(`<< Modifica`, PREVIOUS_STEP), Markup.callbackButton('Home', HOME), Markup.callbackButton(`Avanti >>`, NEXT_STEP)],
  ]).resize();
}

function getConditionsMarkup() {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(conditions.LIKE_NEW, conditions.LIKE_NEW)],
    [Markup.callbackButton(conditions.VERY_GOOD, conditions.VERY_GOOD)],
    [Markup.callbackButton(conditions.GOOD, conditions.GOOD)],
    [Markup.callbackButton(conditions.ACCEPTABLE, conditions.ACCEPTABLE)],
    [Markup.callbackButton(conditions.BROKEN, conditions.BROKEN)],
    [Markup.callbackButton('Torna alla Home', HOME)],
  ]).resize();
}

module.exports = {
  filterUpdates,
  getSelectCategoryMarkup,
  insertionWizardPrompt,
  getConditionsMarkup,
};
