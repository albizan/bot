const { Markup } = require('telegraf');

const { getSelectCategoryMarkup, filterUpdates } = require('../../helper');

const { package } = require('../../emoji');

// Import Database
const { getInsertionsByCategory } = require('../../db/helper');

// Import types
const { categories, HOME } = require('../../types/callbacks.types');

function askForCategory(ctx) {
  ctx.reply(
    `<b>${package} RICERCA ANNUNCI ${package}\n\nSei entrato nel wizard che ti guiderà nella ricerca di un annuncio di vendita\nTi ricordo che in qualunque momento puoi usare il comando /home per tornare al menu principale\n\nSeleziona una categoria</b>`,
    {
      parse_mode: 'HTML',
      reply_markup: getSelectCategoryMarkup(),
    }
  );
  ctx.wizard.next();
}

async function showInsertions(ctx) {
  const data = filterUpdates(ctx, 'callback_query');
  if (!Object.values(categories).includes(data)) {
    return;
  }
  const insertions = await getInsertionsByCategory(data);
  if (!insertions) {
    return;
  }
  if (insertions.length === 0) {
    await ctx.reply(`<b>${data.toUpperCase()}:</b> nessuna inserzione trovata\n\nPer tornare alla home...`, {
      parse_mode: 'HTML',
      reply_markup: getGoHomeMarkup(),
    });
  } else {
    const buttons = insertions.map(row => [Markup.urlButton(`${row.product}`, row.url)]);
    buttons.push([Markup.callbackButton('Home', 'Home')]);
    ctx.reply(`${data}: ${insertions.length} ${insertions.length === 1 ? 'inserzione trovata' : 'inserzioni trovate'}`, {
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  }
  ctx.wizard.next();
  return;
}

const getGoHomeMarkup = () => {
  return Markup.inlineKeyboard([[Markup.callbackButton('... premi qua', HOME)]]).resize();
};

module.exports = {
  askForCategory,
  showInsertions,
};
