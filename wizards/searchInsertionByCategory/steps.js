const { Markup } = require('telegraf');

const { getSelectCategoryMarkup } = require('../../helper');

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

const getGoHomeMarkup = () => {
  return Markup.inlineKeyboard([[Markup.callbackButton('Home', 'Home')]]).resize();
};

module.exports = {
  askForCategory,
  showInsertions,
};
