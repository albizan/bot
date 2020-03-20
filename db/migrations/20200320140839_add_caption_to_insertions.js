exports.up = function(knex) {
  return knex.schema.table('insertions', function(table) {
    table
      .text('caption')
      .notNull()
      .defaultTo('');
  });
};

exports.down = function(knex) {
  return knex.schema.table('insertions', function(table) {
    table.dropColumn('caption');
  });
};
