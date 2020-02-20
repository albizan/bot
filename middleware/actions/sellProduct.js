// Import types
const { SELL_ITEM } = require('../../types/callbacks.types');
const { SELL_PRODUCT_WIZARD } = require('../../types/scenes.types');

function setupSellProduct(bot) {
  bot.action(SELL_ITEM, ctx => {
    ctx.answerCbQuery();
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.scene.enter(SELL_PRODUCT_WIZARD);
  });
}

module.exports = setupSellProduct;
