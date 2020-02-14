const Scene = require('telegraf/scenes/base');
const knex = require('../db');
const { SUPPORT_CHAT_SCENE } = require('../types/scenes.types');
const { startMenuMarkup } = require('../helper');
const logger = require('../logger');
const { sos } = require('../emoji');

// Chat scene
const supportChat = new Scene(SUPPORT_CHAT_SCENE);
supportChat.enter(async ctx => {
  const { id } = ctx.from;
  knex('users')
    .where({ id })
    .then(rows => {
      if (rows[0].muted) {
        ctx.reply(`${sos}<b>CHAT DISATTIVATA DAGLI ADMIN</b>${sos}`, {
          parse_mode: 'HTML',
        });
        ctx.scene.leave();
      } else {
        ctx.reply(`${sos} <b>CHAT DI SUPPORTO</b> ${sos}`, {
          parse_mode: 'HTML',
        });
        ctx.reply(
          `Da adesso in avanti tutti i tuoi messaggi verranno inoltrati agli admin. Eventuali risposte e comunicazioni dagli amministratori ti verranno mostrate qui nel bot\nPer uscire dalla modalità chat di supporto digitare il comando <i>/quit</i>`,
          {
            parse_mode: 'HTML',
          }
        );
      }
    });
});
supportChat.leave(async ctx => {
  await ctx.reply('Sei uscito dalla chat di supporto');
  ctx.reply(
    `Ciao ${ctx.from.first_name}\nBenvenuto nel mercatino del gruppo "PC Building Italia"`,
    {
      reply_markup: startMenuMarkup,
    }
  );
});
supportChat.command('quit', ctx => ctx.scene.leave());
supportChat.on('message', async ctx => {
  knex('users')
    .where({ id: ctx.from.id })
    .then(rows => {
      if (!rows[0].muted) {
        ctx.forwardMessage(
          process.env.SECRET_CHAT_ID,
          ctx.from.id,
          ctx.message.message_id
        );
        ctx.telegram.sendMessage(
          process.env.SECRET_CHAT_ID,
          `Messaggio inoltrato da ${ctx.from.id}`
        );
      }
    });
});

module.exports = supportChat;
