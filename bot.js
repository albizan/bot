const Telegraf = require('telegraf');
const cronJob = require('./cron/sendMessage');
const { getWelcomeMarkup } = require('./helper');

// Import middleware setups
const setupMiddleware = require('./middleware');

// Import command setups
const setupCommands = require('./commands');

// Create BOT instance
const bot = new Telegraf(process.env.BOT_TOKEN);

// Setup middleware
setupMiddleware(bot);

// Setup Commands
setupCommands(bot);

bot.on('new_chat_members', ctx => {
  ctx.reply(`Benvenuto nel Mercatino di Informatica e Tecnologia`, {
    reply_markup: getWelcomeMarkup(),
  });
});

// Run Cron Job
const job = cronJob(bot);
job.start();

module.exports = bot;
