const Markup = require('telegraf/markup');

const { HOME } = require('../../types/callbacks.types');
const { deleteInsertion, getInsertionsByUser, retreiveInsertionById, getInsertionByUrl, setRemoved } = require('../../db/helper');
const { filterUpdates } = require('../../helper');
const { siren, checkMark } = require('../../emoji');

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
    await ctx.telegram.sendMessage(id, `<b>${siren} HAI ${insertions.length} ANNUNCI PUBBLICATI</b>`, {
      parse_mode: 'HTML',
    });
    for (index in insertions) {
      let soldButton;
      if (insertions[index].isRemoved) {
        soldButton = Markup.callbackButton(`${checkMark} Venduto ${checkMark}`, 'ignore');
      } else {
        soldButton = Markup.callbackButton('Segna come venduto', insertions[index].url);
      }
      try {
        await ctx.telegram.sendMessage(id, `<b>${parseInt(index) + 1} - ${insertions[index].product}</b>`, {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [soldButton],
            [Markup.urlButton('Visualizza', insertions[index].url), Markup.callbackButton('Elimina', insertions[index].id)],
          ]).resize(),
        });
        await ctx.telegram.sendSticker(id, 'CAACAgQAAx0CR0lurwACFCNedPfhYr86GIZzveDMgCGf9UHCuwACqwADKDlXD3QujfIUi33eGAQ');
      } catch (error) {}
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
  // If data is the url of the insertion in the channel
  if (data.startsWith('https')) {
    const [message_id] = data.split('/').slice(-1);
    const { id, caption } = await getInsertionByUrl(data);
    if (!caption) {
      return;
    }
    try {
      ctx.telegram.editMessageCaption(process.env.CHANNEL_USERNAME, message_id, undefined, `VENDUTO\n\n${caption}`);
      setRemoved(id);
      ctx.editMessageReplyMarkup(Markup.inlineKeyboard([[Markup.callbackButton(`${checkMark} Prodotto Venduto ${checkMark}`, 'ignore')]]));
    } catch (error) {
      console.log(error);
    }

    return;
  }
  console.log(data);
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
