exports.up = function(knex) {
  return knex.schema.createTable('sale_announcements', function(table) {
    table
      .increments('id')
      .notNullable()
      .primary();
    table.string('title').notNullable();
    table.string('category').notNullable();
    table.string('url').nullable();
    table
      .boolean('isRemoved')
      .defaultTo(false)
      .notNullable();
    table.string('user_id').notNullable();

    table
      .foreign('user_id')
      .references('id')
      .inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sale_announcements');
};
