exports.up = function(knex) {
  knex.schema.createTable('users', function(table) {
    table
      .integer('id')
      .notNullable()
      .primary();
    table.string('username').notNullable();
    table.string('first_name').notNullable();
    table
      .boolean('muted')
      .defaultTo(false)
      .notNullable();
  });
};

exports.down = function(knex) {
  knex.schema.dropTable('users');
};

exports.config = { transaction: false };
