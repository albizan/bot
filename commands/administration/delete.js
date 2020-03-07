const { deleteInsertion, retrieveMessagesIds } = require('../../db/helper');

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
          // Insertion is composed by several messages, get those messages and delete all of them from submitted channel
          const messages = await retrieveMessagesIds(insertionId);
          messages.forEach(({ message_id }) => {
            ctx.telegram.deleteMessage(process.env.CHANNEL_USERNAME, message_id);
          });
          const result = await deleteInsertion(insertionId);
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
