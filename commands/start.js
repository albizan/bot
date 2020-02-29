// import markups
const { startMenuMarkup } = require('../helper');

// Import logger
const logger = require('../logger');

// Import upsert function
const { upsert } = require('../helper');

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
      Send welcome message to user
      Users can use /start or /home command even in groups.
      If the users did not start the bot before sending the /start command in a group, an error is thrown, this is because BOTs cannot start messagging with users.
      If this is the case, reply to user informing him to start the bot in his private chat
    */

    try {
      ctx.telegram.sendMessage(
        id,
        `Ciao <b>${first_name}</b>\n\nBenvenuto/a nel BOT ufficiale del gruppo <a href="https://t.me/joinchat/BUc_2U-1GRQClo4MllBuFA">MIT - Mercatino Informatica e Tecnologia</a>\n\nTi ricordo che in qualunque momento puoi tornare in questo menu con il comando /home\nQuesto bot ti permette di creare annunci di vendita per le tue componenti informatiche e non solo. Tutti gli annunci, prima di essere pubblicati sul canale ufficiale @mitvendita, verranno valutati ed eventualmente approvati dallo <b>STAFF</b>`,
        {
          reply_markup: startMenuMarkup,
          parse_mode: 'HTML',
        }
      );
    } catch (error) {
      ctx.reply(
        'Sono un BOT, non posso contattarti in privato se prima non vai su @mitricvenbot e clicchi su avvia'
      );
      return;
    }
    logger.info(`${first_name} (${username} - ${id}) started the Bot`);

    /* 
      Insert new user in the database
      If the user is already present (id is the pk) update all the info a user might have changed since the last bot query (username and first_name)
      Using Knex the only way to achieve this is using a raw query
    */
    try {
      upsert({
        table: 'users',
        object: { id, username, first_name },
        constraint: '(id)',
      });
    } catch (error) {
      logger.error(error);
    }
  });
}

module.exports = setupStartCommand;
