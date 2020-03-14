const Markup = require('telegraf/markup');
const { filterUpdates } = require('../../helper');

// Import callback query types
const { NEXT_STEP, PREVIOUS_STEP, HOME } = require('../../types/callbacks.types');

// Import emojis
const { package, memo, moneyBag } = require('../../emoji');

/*
  Step 1 of Wizard - Ask For Title
  Initialize wizard's state for current wizard instance.
  The state will be automatically deleted when leaving the wizard with ctx.scene.leave()
  Prompt user to write title
*/
function askForTitle(ctx) {
  ctx.reply('<b>Che prodotto stai cercando?</b>\n(10 - 50 caratteri)', {
    parse_mode: 'HTML',
  });
  ctx.wizard.next();
  return;
}

function validateTitle(ctx) {
  const text = filterUpdates(ctx, 'message', 10, 50);
  if (!text) {
    return;
  }
  // Update wizard state with given validated title
  ctx.wizard.state.title = text;

  // Ask for confirmation
  ctx.reply(`${package} Prodotto: ${text}`, {
    reply_markup: insertionWizardPrompt(),
  });
  ctx.wizard.next();
  return;
}

async function confirmTitleAndAskForDescription(ctx) {
  const data = filterUpdates(ctx, 'callback_query', 5, 50);
  if (!data) {
    return;
  }
  switch (data) {
    case NEXT_STEP:
      ctx.reply('<b>Inserisci il testo del tuo annuncio di ricerca</b>', {
        parse_mode: 'HTML',
      });
      ctx.wizard.next();
      break;
    case PREVIOUS_STEP:
      ctx.reply('Reinserisci il prodotto che stai cercando');
      ctx.wizard.back();
      break;
    default:
      break;
  }
}
const validateDescription = async ctx => {
  const text = filterUpdates(ctx, 'message');
  if (!text) {
    return;
  }

  // Update wizard state with given validated description
  ctx.wizard.state.description = text;

  // Ask for confirmation
  ctx.reply(`${memo} Descrizione: ${text}`, {
    reply_markup: insertionWizardPrompt(),
  });
  return ctx.wizard.next();
};

const confirmDescriptionAndAskForPrice = async ctx => {
  const data = filterUpdates(ctx, 'callback_query', 5, 50);
  if (!data) {
    return;
  }
  switch (data) {
    case NEXT_STEP:
      ctx.reply('<b>Inserisci il prezzo richiesto</b>\n<em>Scrivi solo valore numerico intero, senza il simbolo €</em>', {
        parse_mode: 'HTML',
      });
      ctx.wizard.next();
      break;
    case PREVIOUS_STEP:
      ctx.reply("<b>Reinserisci il testo dell'annuncio</b>", {
        parse_mode: 'HTML',
      });
      ctx.wizard.back();
      break;
    default:
      return;
  }
};

const priceValidation = ctx => {
  const text = filterUpdates(ctx, 'message');
  if (!text) {
    return;
  }
  // Convert string into a floating point number
  ctx.wizard.state.value = parseInt(text);
  ctx.reply(`${moneyBag} Prezzo: ${ctx.wizard.state.value}€`, {
    reply_markup: insertionWizardPrompt(),
  });
  ctx.wizard.next();
};

const priceConfirmationAndHandleSending = async ctx => {
  const data = filterUpdates(ctx, 'callback_query', 5, 50);
  if (!data) {
    return;
  }
  switch (data) {
    case NEXT_STEP:
      const { username, id } = ctx.from;
      const { title, description, value } = ctx.wizard.state;
      console.log(ctx.wizard.state);
      const message = generateSearchAnnouncement(username, id, title, description, value);
      try {
        ctx.telegram.sendMessage(process.env.SECRET_CHAT_ID, message);
      } catch (error) {
        console.log(error);
        ctx.reply('Impossibile inviare il messaggio, riprova piu tardi');
      }
      ctx.reply('Per tornare alla home ...', {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('... premi qui', HOME)]]),
      });
      break;
    case PREVIOUS_STEP:
      await ctx.reply('Reinserisci Il prezzo');
      ctx.wizard.back();
      break;
    default:
      return;
  }
};

function goHome(ctx) {
  filterUpdates(ctx);
}

function insertionWizardPrompt() {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(`<< Modifica`, PREVIOUS_STEP), Markup.callbackButton('Home', HOME), Markup.callbackButton(`Avanti >>`, NEXT_STEP)],
  ]).resize();
}

const generateSearchAnnouncement = (username, id, title, description, price) => {
  return `
    ${username} STA CERCANDO:
    \n${package} Prodotto: ${package}\n${title}
    \n\n${memo} Descrizione ${memo}\n${description}
    \n\n${moneyBag} Prezzo: ${moneyBag}\n${price}€`;
};

module.exports = {
  askForTitle,
  validateTitle,
  confirmTitleAndAskForDescription,
  validateDescription,
  confirmDescriptionAndAskForPrice,
  priceValidation,
  priceConfirmationAndHandleSending,
  goHome,
};
