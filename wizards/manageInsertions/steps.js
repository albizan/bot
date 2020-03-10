const Markup = require('telegraf/markup');

const { deleteInsertion } = require('../../db/helper');

const { getInsertionsByUser } = require('../../db/helper');
const { siren } = require('../../emoji');

async function showInsertions(ctx) {
  const { id } = ctx.from;
  try {
    const insertions = await getInsertionsByUser(id);
    for (insertion of insertions) {
      await ctx.telegram.sendMessage(id, `${insertion.product}`, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.urlButton('Visualizza', insertion.url), Markup.callbackButton('Elimina', insertion.id)],
        ]),
      });
    }
    ctx.telegram.sendMessage(id, 'Per tornare alla home ...', {
      reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('... premi qua', 'home')]]).resize(),
    });
    ctx.wizard.next();
  } catch (error) {
    console.log(error);
    ctx.scene.leave();
  }
}

async function manageInsertion(ctx) {
  if (ctx.updateType !== 'callback_query') {
    return;
  }
  ctx.answerCbQuery();
  const { data } = ctx.callbackQuery;
  if (data === 'home') {
    return ctx.scene.leave();
  }
  try {
    deleteInsertion(data, ctx);
    ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([[Markup.callbackButton(`${siren} Annuncio Eliminato ${siren}`, 'no-action-required')]])
    );
  } catch (error) {
    console.log(error);
  }
  return;
}

module.exports = {
  showInsertions,
  manageInsertion,
};
