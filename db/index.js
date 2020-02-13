const knex = require('knex')({
  client: 'pg',
  connection: process.env.DB_CONNECTION_STRING,
});

module.exports = knex;
