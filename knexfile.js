module.exports = {
  client: 'pg',
  connection: process.env.DB_CONNECTION_STRING,
  migrations: {
    tableName: 'migrations',
    directory: './db/migrations',
  },
};
