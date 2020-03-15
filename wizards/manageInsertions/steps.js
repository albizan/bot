const Markup = require('telegraf/markup');

const { HOME } = require('../../types/callbacks.types');
const { deleteInsertion, getInsertionsByUser, retreiveInsertionById } = require('../../db/helper');
const { filterUpdates } = require('../../helper');
const { siren } = require('../../emoji');

async function showInsertions(ctx) {
  const { id } = ctx.from;
  try {
    const insertions = await getInsertionsByUser(id);
    if (insertions.length === 0) {
      ctx.telegram.sendMessage(id, '<b>NON HAI ANNUNCI PUBBLICATI\n\nPer tornare alla home ...</b>', {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('... premi qua', HOME)]]).resize(),
      });
      ctx.wizard.next();
      return;
    }
    ctx.telegram.sendMessage(id, `<b>${siren} HAI ${insertions.length} ANNUNCI PUBBLICATI</b>`, {
      parse_mode: 'HTML',
    });
    for (insertion of insertions) {
      await ctx.telegram.sendMessage(id, `${insertion.product}`, {
        reply_markup: Markup.inlineKeyboard([[Markup.urlButton('Visualizza', insertion.url), Markup.callbackButton('Elimina', insertion.id)]]),
      });
    }
    ctx.telegram.sendMessage(id, 'Per tornare alla home ...', {
      reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('... premi qua', HOME)]]).resize(),
    });
    ctx.wizard.next();
  } catch (error) {
    console.log(error);
    ctx.scene.leave();
  }
}

async function manageInsertion(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  if (!data) {
    return;
  }
  const insertionId = parseInt(data);
  if (isNaN(insertionId)) {
    return;
  }
  try {
    const insertion = await retreiveInsertionById(insertionId);
    if (!insertion) {
      return;
    }
    deleteInsertion(insertion.id, ctx);
    ctx.editMessageReplyMarkup(Markup.inlineKeyboard([[Markup.callbackButton(`${siren} Annuncio Eliminato ${siren}`, 'ignore')]]));
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  showInsertions,
  manageInsertion,
};
