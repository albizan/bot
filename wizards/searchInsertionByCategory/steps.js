const { Markup } = require('telegraf');

// Import Database
const knex = require('../../db');

// Import types
const { categories } = require('../../types/callbacks.types');

const askForCategory = ctx => {
  let insertions;

  ctx.reply('<b>SELEZIONA UNA CATEGORIA</b>', {
    parse_mode: 'HTML',
    reply_markup: getSelectCategoryMarkup(),
  });
  ctx.wizard.next();
};

const showInsertions = async ctx => {
  if (ctx.updateType !== 'callback_query') {
    return;
  }
  ctx.answerCbQuery();
  ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  const { data } = ctx.callbackQuery;
  if (!Object.values(categories).includes(data)) {
    return;
  }
  try {
    insertions = await knex('insertions')
      .select('product', 'url')
      .whereNotNull('url')
      .where({ category: data });
  } catch (error) {
    console.log(error);
    ctx.reply('Impossibile ottenere le inserzioni, si è verificato un errore');
    ctx.scene.leave();
  }
  const buttons = insertions.map(row => [Markup.urlButton(`${row.product}`, row.url)]);
  if (buttons.length === 0) {
    await ctx.reply(`<b>${data.toUpperCase()}:</b> nessuna inserzione trovata`, {
      parse_mode: 'HTML',
      reply_markup: getGoHomeMarkup(),
    });
  } else {
    buttons.push([Markup.callbackButton('Home', 'Home')]);
    await ctx.reply(
      `${data}: ${insertions.length} ${insertions.length === 1 ? 'inserzione trovata' : 'inserzioni trovate'}`,
      {
        reply_markup: Markup.inlineKeyboard(buttons),
      }
    );
  }
  return ctx.wizard.next();
};

// Helpers
const getSelectCategoryMarkup = () => {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(categories.CPU, categories.CPU), Markup.callbackButton(categories.GPU, categories.GPU)],
    [Markup.callbackButton(categories.RAM, categories.RAM), Markup.callbackButton(categories.MOBO, categories.MOBO)],
    [
      Markup.callbackButton(categories.PSU, categories.PSU),
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

const getGoHomeMarkup = () => {
  return Markup.inlineKeyboard([[Markup.callbackButton('Home', 'Home')]]).resize();
};

module.exports = {
  askForCategory,
  showInsertions,
};
