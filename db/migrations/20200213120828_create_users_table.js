exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table
      .string('id')
      .notNullable()
      .primary();
    table.string('username').notNullable();
    table.string('name').notNullable();
    table
      .boolean('muted')
      .defaultTo(false)
      .notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

exports.config = { transaction: false };
