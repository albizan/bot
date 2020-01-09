const { package, memo, moneyBag, moneyFly, silhouette } = require("./emoji");

function generateCaption(first_name, username, id, title, description, value) {
  return `\n${package} Prodotto ${package}\n${title}\n\n${memo} Descrizione ${memo}\n${description}\n\n${moneyBag} Prezzo Richiesto ${moneyBag}\n${value}€\n\n${moneyFly} Pagamento ${moneyFly}\nPaypal\n\n${silhouette} Contatto ${silhouette}\n${first_name} (@${username} - ${id})`;
}

module.exports = {
  generateCaption
};
