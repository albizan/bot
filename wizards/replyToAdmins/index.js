const WizardScene = require('telegraf/scenes/wizard');
const { REPLY_TO_ADMINS_WIZARD } = require('../../types/scenes.types');

// Import Steps
const {} = require('./steps');

const replyToAdmins = new WizardScene(
  REPLY_TO_ADMINS_WIZARD,
  ctx => {
    ctx.reply('<b>Digita la tua risposta</b>', { parse_mode: 'HTML' });
    return ctx.wizard.next();
  },
  async ctx => {
    if (!ctx.message) {
      return;
    }
    if (!ctx.message.text) {
      // this could be a gif or a sticker and needs to be deleted in order to avoid chat cluttering
      ctx.deleteMessage(ctx.message.message_id);
      return;
    }
    const { text, message_id } = ctx.message;
    const { id, username } = ctx.from;

    // Check if text is a bot command, commands are not accepted and need to be deleted
    if (text.startsWith('/')) {
      ctx.deleteMessage(message_id);
      return;
    }
    try {
      await ctx.telegram.sendMessage(
        process.env.SECRET_CHAT_ID,
        `MESSAGGIO DI RISPOSTA DA:\n@${username} - ${id}\n\n${text}`
      );
      ctx.reply('Grazie, il tuo messaggio è stato inviato');
    } catch (error) {
      console.log(error);
    } finally {
      return ctx.scene.leave();
    }
  }
);

replyToAdmins.command(['quit, home'], ctx => {
  ctx.scene.leave();
});

replyToAdmins.leave();
module.exports = replyToAdmins;
