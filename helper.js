const { package, memo, moneyBag, moneyFly, silhouette } = require("./emoji");

function generateCaption(
  first_name,
  username,
  id,
  title,
  description,
  value,
  paymentMethods
) {
  return `\n${package} Prodotto ${package}\n${title}
    \n\n${memo} Descrizione ${memo}\n${description}
    \n\n${moneyBag} Prezzo Richiesto ${moneyBag}\n${value}€
    \n\n${moneyFly}Pagamenti Accettati${moneyFly}\n${paymentMethods.join(" ")}
    \n\n${silhouette} Contatto ${silhouette}\n${first_name} (@${username} - ${id})`;
}

/* function reduceToString(paymentMethods) {
  paymentMethods.reduce((method, currentValue) => {
    return currentValue + " " + method;
  }, "");
} */

module.exports = {
  generateCaption
};
