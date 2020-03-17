exports.up = function(knex) {
  return knex.schema.createTable('feedbacks', function(table) {
    table
      .increments('id')
      .notNullable()
      .primary();
    table.integer('feedback_receiver').notNullable();
    table.integer('feedback_issuer').notNullable();
    table.integer('feedback_rate').notNullable();
    table.text('feedback_text').notNullable();
    table
      .boolean('isValidated')
      .defaultTo(false)
      .notNullable();

    table
      .foreign('feedback_receiver')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .foreign('feedback_issuer')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('feedbacks');
};
