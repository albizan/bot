const ignoreOldUpdates = async (ctx, next) => {
  if (ctx.updateType === 'message') {
    if (new Date().getTime() / 1000 - ctx.message.date < 30) {
      next();
    } else {
      console.log(`Ignoring message from ${ctx.from.id} at ${ctx.chat.id})`);
    }
  } else {
    next();
  }
};

module.exports = ignoreOldUpdates;
