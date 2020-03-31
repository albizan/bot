exports.up = async function(knex) {
  return knex.schema.createTable('messages', function(table) {
    table
      .string('message_id')
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
  return knex.schema.dropTable('messages');
};

exports.config = { transaction: false };
