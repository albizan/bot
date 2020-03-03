const knex = require('../../db');

function setupDeleteCommand(bot) {
  bot.command('delete', async ctx => {
    const [insertionTag] = ctx.state.command.args;
    if (!insertionTag) {
      return;
    }
    const insertionType = insertionTag.substring(0, 2);
    const insertionId = insertionTag.substring(2);
    console.log(insertionTag);
    switch (insertionType) {
      case 'av':
        console.log(`Insertion #${insertionId} to be deleted`);
        try {
          await knex('insertions')
            .where({ id: insertionId })
            .del();
        } catch (error) {
          console.log(error);
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
