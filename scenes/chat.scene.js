const Scene = require('telegraf/scenes/base');
const { sos } = require('../emoji');
// Chat scene
const chat = new Scene('chat');
chat.enter(async ctx => {
  await ctx.reply(`${sos}<b>MODALITA CHAT ATTIVATA</b>${sos}`, {
    parse_mode: 'HTML',
  });
  ctx.reply(
    `Da adesso in avanti tutti i tuoi messaggi verranno inoltrati agli admin. Eventuali risposte e comunicazioni dagli amministratori ti verranno mostrate qui nel bot\nPer uscire dalla modalità chat digitare il comando <i>/quit</i>`,
    {
      parse_mode: 'HTML',
    }
  );
});
chat.leave(ctx =>
  ctx.reply(
    'Sei uscito dalla modalità admin\nScrivi /start per iniziare la procedura'
  )
);
chat.hears(/quit/gi, ctx => ctx.scene.leave());
chat.on('message', async ctx => {
  ctx.forwardMessage(
    process.env.SECRET_CHAT_ID,
    ctx.from.id,
    ctx.message.message_id
  );
});

module.exports = chat;
