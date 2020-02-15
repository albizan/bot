exports.up = function(knex) {
  return knex.schema.createTable('sale_announcements', function(table) {
    table
      .string('id')
      .notNullable()
      .primary();
    table
      .boolean('removed')
      .defaultTo(false)
      .notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sale_announcements');
};
