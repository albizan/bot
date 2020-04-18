/* 
  This middleware parse incoming text and generates a string representing a command and a list of args
*/

const commandParser = (ctx, next) => {
  if (ctx.updateSubTypes.includes('text')) {
    const text = allTrim(ctx.update.message.text);
    if (text.startsWith('/')) {
      const match = text.match(/^\/([^\s]+)\s?(.+)?/);
      let args = [];
      let command;
      if (match !== null) {
        if (match[1]) {
          command = match[1];
        }
        if (match[2]) {
          args = match[2].split(' ');
        }
      }

      ctx.state.command = {
        raw: text,
        command,
        args,
      };
    }
  }
  return next();
};

function allTrim(str) {
  return str.replace(/\s+/g, ' ').replace(/^\s+|\s+$/, '');
}

module.exports = commandParser;
