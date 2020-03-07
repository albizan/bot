const knex = require('./index');

async function deleteInsertion(id) {
  return await knex('insertions')
    .where({ id })
    .del();
}

module.exports = {
  deleteInsertion,
};
