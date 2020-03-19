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
async function getUserById(user_id) {
  try {
    return await knex('users')
      .where({ id: user_id })
      .first();
  } catch (error) {
    console.log(users);
  }
}

async function getUserFromUsername(username) {
  return await knex('users')
    .where({ username })
    .first();
}

async function getInsertionsByUser(user_id) {
  return await knex('insertions')
    .where({ user_id })
    .whereNotNull('url');
}

async function validateFeedback(feedback_id) {
  try {
    return knex('feedbacks')
      .where({ id: feedback_id })
      .update({
        isValidated: true,
      })
      .returning('id');
  } catch (error) {
    console.log(error);
  }
}

async function getValidatedFeedbacksByUser(user_id) {
  return await knex('feedbacks')
    .avg('feedback_rate')
    .count()
    .where({ feedback_receiver: user_id, isValidated: true });
}

function upsert(params) {
  const { table, object, constraint } = params;
  const insert = knex(table).insert(object);
  const update = knex.queryBuilder().update(object);
  return knex
    .raw(`? ON CONFLICT ${constraint} DO ? returning *`, [insert, update])
    .get('rows')
    .get(0);
}

async function getInsertionsByCategory(category) {
  try {
    return await knex('insertions')
      .select('product', 'url')
      .whereNotNull('url')
      .where({ category });
  } catch (error) {
    console.log(error);
    ctx.reply('Impossibile ottenere le inserzioni, si è verificato un errore');
    ctx.scene.leave();
  }
}

async function getFeedbacks(username) {
  const user = await getUserFromUsername(username);
  if (!user) {
    return [];
  }
  const { id } = user;
  return await knex('feedbacks').where({ isValidated: true, feedback_receiver: id });
}

module.exports = {
  deleteInsertion,
  retreiveInsertionById,
  saveImagesIds,
  retrieveMessagesIds,
  getInsertionsByUser,
  getInsertionsByCategory,
  getUsers,
  getUserById,
  getUserFromUsername,
  validateFeedback,
  getValidatedFeedbacksByUser,
  getFeedbacks,
  upsert,
};
