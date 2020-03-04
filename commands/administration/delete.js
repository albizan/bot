const knex = require('../../db');

function setupDeleteCommand(bot) {
  bot.command('delete', async ctx => {
    if (!process.env.ADMINS.includes(id)) {
      return;
    }
    const [insertionTag] = ctx.state.command.args;
    if (!insertionTag) {
      return;
    }
    const insertionType = insertionTag.substring(0, 2);
    const insertionId = insertionTag.substring(2);
    console.log(insertionTag);
    switch (insertionType) {
      case 'av':
        try {
          await knex('insertions')
            .where({ id: insertionId })
            .del();
          ctx.reply(`Annuncio n° ${insertionId} eliminato`);
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
