const { SEARCH_INSERTION_BY_CATEGORY_WIZARD } = require('../../types/scenes.types');

// Import types
const { SEARCH_INSERTION_BY_CATEGORY } = require('../../types/callbacks.types');

function setupSearchInsertionByCategory(bot) {
  bot.action(SEARCH_INSERTION_BY_CATEGORY, ctx => {
    ctx.answerCbQuery();
    ctx.scene.enter(SEARCH_INSERTION_BY_CATEGORY_WIZARD);
  });
}

module.exports = setupSearchInsertionByCategory;
