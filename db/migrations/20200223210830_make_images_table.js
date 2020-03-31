exports.up = async function(knex) {
  return knex.schema.createTable('images', function(table) {
    table
      .string('file_id')
      .notNullable()
      .primary();
    table.integer('insertion_id').notNullable();

    table
      .foreign('insertion_id')
      .references('id')
      .inTable('insertions')
      .onDelete('CASCADE');
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('images');
};

exports.config = { transaction: false };
