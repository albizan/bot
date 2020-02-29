const ignoreOldUpdates = async (ctx, next) => {
  if (ctx.updateType === 'message') {
    if (new Date().getTime() / 1000 - ctx.message.date < 60) {
      next();
    } else {
      console.log(`Ignoring message from ${ctx.from.id} - message is too old`);
    }
  } else {
    next();
  }
};

module.exports = ignoreOldUpdates;
