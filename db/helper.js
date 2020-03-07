const knex = require('./index');

async function deleteInsertion(id) {
  return await knex('insertions')
    .where({ id })
    .del();
}

async function retreiveInsertionById(id) {
  return await knex('insertions')
    .where({ id })
    .first();
}

async function saveImagesIds(messages, insertion_id) {
  messages.forEach(({ message_id }) => {
    upsert({ table: 'messages', object: { message_id, insertion_id }, constraint: '(message_id)' });
  });
}

const upsert = params => {
  const { table, object, constraint } = params;
  const insert = knex(table).insert(object);
  const update = knex.queryBuilder().update(object);
  return knex
    .raw(`? ON CONFLICT ${constraint} DO ? returning *`, [insert, update])
    .get('rows')
    .get(0);
};

module.exports = {
  deleteInsertion,
  retreiveInsertionById,
  saveImagesIds,
};
