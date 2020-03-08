const knex = require('./index');

async function deleteInsertion(id, ctx) {
  // Insertion is composed by several messages, get those messages and delete all of them from submitted channel
  const messages = await retrieveMessagesIds(id);
  messages.forEach(({ message_id }) => {
    ctx.telegram.deleteMessage(process.env.CHANNEL_USERNAME, message_id);
  });

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

async function retrieveMessagesIds(insertion_id) {
  return await knex('messages')
    .select('message_id')
    .where({ insertion_id });
}

async function getUsers() {
  try {
    return await knex('users');
  } catch (error) {
    console.log(users);
  }
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
  retrieveMessagesIds,
  getUsers,
};
