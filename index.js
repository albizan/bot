const dotenv = require('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}
const bot = require('./bot');
const logger = require('./logger');

bot.launch();
logger.info('Bot started');
