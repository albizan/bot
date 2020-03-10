const Markup = require('telegraf/markup');
var CronJob = require('cron').CronJob;

const cronJob = bot => {
  const sendMessageToGroupJob = new CronJob('0 0 */12 * * *', function() {
    console.log('Sending message...');
    try {
      bot.telegram.sendMessage(
        process.env.MIT_GROUP,
        'Per tutte le discussioni non strettamente inerenti al mercatino e agli annunci ivi proposti, vi invitiamo ad entrare nel gruppo @pcbuildingitaly. Vi ricordiamo inoltre che è disponibile il nostro bot @mitricvenbot per creare annunci di vendita e per consultare le inserzioni già approvate suddivise per categoria. Tutti gli annunci possono essere consultati sul nostro canale @mitvendita',
        {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.urlButton(`Canale`, 'https://t.me/mitvendita'),
              Markup.urlButton('BOT', 'https://t.me/mitricvenbot'),
            ],
          ]).resize(),
        }
      );
    } catch (error) {
      console.log(error);
    }
  });
  return sendMessageToGroupJob;
};

module.exports = cronJob;
