const { Markup } = require('telegraf');

const { getSelectCategoryMarkup, filterUpdates } = require('../../helper');

const { package } = require('../../emoji');

// Import Database
const knex = require('../../db');

// Import types
const { categories } = require('../../types/callbacks.types');

const askForCategory = ctx => {
  let insertions;

  ctx.reply(
    `<b>${package} RICERCA ANNUNCI ${package}\n\nSei entrato nel wizard che ti guiderà nella ricerca di un annuncio di vendita\nTi ricordo che in qualunque momento puoi usare il comando /home per tornare al menu principale\n\nSeleziona una categoria</b>`,
    {
      parse_mode: 'HTML',
      reply_markup: getSelectCategoryMarkup(),
    }
  );
  ctx.wizard.next();
};

const showInsertions = async ctx => {
  const data = filterUpdates(ctx, 'callback_query');
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
    return;
  }
  const buttons = insertions.map(row => [Markup.urlButton(`${row.product}`, row.url)]);
  if (buttons.length === 0) {
    await ctx.reply(`<b>${data.toUpperCase()}:</b> nessuna inserzione trovata`, {
      parse_mode: 'HTML',
      reply_markup: getGoHomeMarkup(),
    });
  } else {
    buttons.push([Markup.callbackButton('Home', 'Home')]);
    await ctx.reply(`${data}: ${insertions.length} ${insertions.length === 1 ? 'inserzione trovata' : 'inserzioni trovate'}`, {
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  }
  ctx.wizard.next();
  return;
};

const getGoHomeMarkup = () => {
  return Markup.inlineKeyboard([[Markup.callbackButton('Home', 'Home')]]).resize();
};

module.exports = {
  askForCategory,
  showInsertions,
};
