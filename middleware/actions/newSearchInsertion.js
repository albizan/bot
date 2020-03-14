// Import types
const { SEARCH_INSERTION } = require('../../types/callbacks.types');
const { SEARCH_ITEM_WIZARD } = require('../../types/scenes.types');

function setupNewSearchInsertion(bot) {
  bot.action(SEARCH_INSERTION, ctx => {
    console.log('New insertion');
    ctx.answerCbQuery();
    ctx.scene.enter(SEARCH_ITEM_WIZARD);
  });
}

module.exports = setupNewSearchInsertion;
