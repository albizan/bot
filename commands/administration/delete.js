const knex = require('../../db');

function setupDeleteCommand(bot) {
  bot.command('delete', async ctx => {
    const { id } = ctx.from;
    if (!process.env.ADMINS.includes(id)) {
      return;
    }
    const [insertionTag] = ctx.state.command.args;
    if (!insertionTag) {
      ctx.reply("Argomenti insufficienti, digita anche l'id dell'annuncio");
      return;
    }
    const insertionType = insertionTag.substring(0, 2);
    const insertionId = insertionTag.substring(2);
    switch (insertionType) {
      case 'av':
        try {
          const result = await knex('insertions')
            .where({ id: insertionId })
            .del();
          if (result) {
            ctx.reply(`Annuncio n°${insertionId} eliminato`);
          } else {
            ctx.reply(`Annuncio n°${insertionId} non trovato`);
          }
        } catch (error) {
          console.log(error);
          ctx.reply(error.message);
        }
        break;
      case 'ar':
        break;
      default:
        console.log('Insertion is not valid');
    }
  });
}

module.exports = setupDeleteCommand;
