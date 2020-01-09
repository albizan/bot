const pino = require("pino");
const logger = pino({
  name: "nasbot",
  prettyPrint: true
});
module.exports = logger;
