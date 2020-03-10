const { getUsers } = require('../../db/helper');

const setupStatsCommand = bot => {
  bot.command('ottieni', async ctx => {
    const { id } = ctx.from;
    if (!process.env.ADMINS.includes(id)) {
      ctx.reply('Non sei un admin');
      return;
    }
    arg = ctx.state.command.args[0];

    if (!arg) {
      ctx.reply('Comando con argomenti non validi');
      return;
    }

    switch (arg) {
      case 'utenti':
        const users = await getUsers();
        const message = users.reduce((message, user) => {
          return (message += `@${user.username}\n`);
        }, '');
        ctx.telegram.sendMessage(process.env.SECRET_CHAT_ID, message);
        break;
    }
  });
};

module.exports = setupStatsCommand;