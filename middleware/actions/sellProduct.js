// Import types
const { NEW_INSERTION } = require('../../types/callbacks.types');
const { NEW_INSERTION_WIZARD } = require('../../types/scenes.types');

function setupNewInsertion(bot) {
  bot.action(NEW_INSERTION, ctx => {
    ctx.answerCbQuery();
    ctx.scene.enter(NEW_INSERTION_WIZARD);
  });
}

module.exports = setupNewInsertion;
