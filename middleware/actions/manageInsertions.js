const { MANAGE_INSERTIONS_WIZARD } = require('../../types/scenes.types');

// Import types
const { MANAGE_INSERTIONS } = require('../../types/callbacks.types');

function setupManageInsertions(bot) {
  bot.action(MANAGE_INSERTIONS, ctx => {
    console.log('Manage insertions');
    ctx.answerCbQuery();
    ctx.scene.enter(MANAGE_INSERTIONS_WIZARD);
  });
}

module.exports = setupManageInsertions;
