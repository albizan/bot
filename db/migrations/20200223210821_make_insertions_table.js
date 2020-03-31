exports.up = async function(knex) {
  return knex.schema.createTable('insertions', function(table) {
    table
      .increments('id')
      .notNullable()
      .primary();
    table.string('product').notNullable();
    table.string('category').notNullable();
    table.string('url').nullable();
    table
      .boolean('isRemoved')
      .defaultTo(false)
      .notNullable();
    table.integer('user_id').notNullable();

    table
      .foreign('user_id')
      .references('id')
      .inTable('users');
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('insertions');
};
