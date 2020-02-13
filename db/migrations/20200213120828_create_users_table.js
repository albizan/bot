exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table
      .string('id', 8)
      .notNullable()
      .primary();
    table.boolean('muted').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

exports.config = { transaction: false };
