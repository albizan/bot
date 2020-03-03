exports.up = function(knex) {
  return knex.schema.table('insertions', function(table) {
    table
      .string('condition')
      .notNull()
      .defaultTo('Buone Condizioni');
  });
};

exports.down = function(knex) {
  return knex.schema.table('insertions', function(table) {
    table.dropColumn('condition');
  });
};
