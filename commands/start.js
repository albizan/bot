// import markups
const { startMenuMarkup } = require('../helper');

// Import logger
const logger = require('../logger');

// Import upsert function
const { upsert, getWelcomeMessage } = require('../helper');

function setupStartCommand(bot) {
  bot.command(['start', 'home'], async ctx => {
    // Extract user's info and check if required fields are present. If they are not, tell user what's missing and return.
    const { id, username, first_name } = ctx.from;
    if (!username) {
      ctx.reply('Per usare questo BOT è necessario impostare un username');
      return;
    }
    if (!first_name) {
      ctx.reply('Per usare questo BOT è necessario impostare un nome');
      return;
    }

    /* 
      Insert (or update) user in the database
    */
    try {
      await upsert({
        table: 'users',
        object: { id, username, first_name },
        constraint: '(id)',
      });
    } catch (error) {
      logger.error(error);
    }

    /* 
      Send welcome message to user
      Users can use /start command even in groups.
      If the users did not start the bot before sending the /start command in a group, an error is thrown, this is because BOTs cannot start messagging with users.
      If this is the case, reply to user informing him to start the bot in his private chat
    */
    try {
      ctx.telegram.sendMessage(id, getWelcomeMessage(first_name), {
        reply_markup: startMenuMarkup,
        parse_mode: 'HTML',
      });
    } catch (error) {
      ctx.reply(
        'Sono un BOT, non posso contattarti in privato se prima non vai su @mitricvenbot e clicchi su avvia'
      );
      return;
    }
  });
}

module.exports = setupStartCommand;
