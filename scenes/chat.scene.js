const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

// Greeter scene
const chat = new Scene('chat');
chat.enter(ctx =>
  ctx.reply(
    'Modalità chat avviata\nDa adesso in avanti tutti i tuoi messaggi verranno inoltrati agli admin. Eventuali risposte e comunicazioni dagli amministratori ti verranno mostrate qui nel bot\nPer uscire dalla modalità chat digitare il comando /quit'
  )
);
chat.leave(ctx =>
  ctx.reply(
    'Sei uscito dalla modalità admin\nScrivi /start per iniziare la procedura'
  )
);
chat.hears(/quit/gi, ctx => ctx.scene.leave());
chat.on('message', async ctx => {
  if (ctx.message && ctx.message.text) {
    await ctx.telegram.sendMessage(
      process.env.SECRET_CHAT_ID,
      `${ctx.from.id}\n@${ctx.from.username} ha scritto:\n${ctx.message.text}\n`
    );
  }
});

module.exports = chat;
