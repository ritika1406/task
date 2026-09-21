const crypto = require("crypto");

function transactionHash({ date, description, amount, type }) {
  return crypto
    .createHash("sha256")
    .update(`${date}|${description.trim().toLowerCase()}|${amount}|${type}`)
    .digest("hex");
}

module.exports = { transactionHash };
