const dotenv = require('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}

module.exports = {
  client: 'pg',
  connection: process.env.DB_CONNECTION_STRING,
  migrations: {
    tableName: 'migrations',
    directory: './db/migrations',
  },
};
