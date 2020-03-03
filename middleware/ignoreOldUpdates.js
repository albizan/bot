const ignoreOldUpdates = async (ctx, next) => {
  const { updateType } = ctx;
  let updateDate,
    waitingThreshold = 60;
  switch (updateType) {
    case 'message':
      updateDate = ctx.message.date;
      if (new Date().getTime() / 1000 - updateDate < waitingThreshold) {
        next();
      } else {
        console.log(`Ignoring message from ${ctx.from.id} - message is too old`);
      }
      break;
    case 'callback_query':
      updateDate = ctx.update.callback_query.message.date;
      if (new Date().getTime() / 1000 - updateDate < waitingThreshold) {
        next();
      } else {
        console.log(`Ignoring callback_query from ${ctx.from.id} - message is too old`);
      }
      break;
    default:
      next();
  }
};

module.exports = ignoreOldUpdates;
