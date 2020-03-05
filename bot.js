const Telegraf = require('telegraf');
const cronJob = require('./cron/sendMessage');

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

// Run Cron Job
const job = cronJob(bot);
job.start();

module.exports = bot;
