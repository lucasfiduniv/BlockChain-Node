const EC = require("elliptic").ec;
const crypto = require("crypto");

const ec = new EC("secp256k1");


const privateKey = "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce36f8e4d8e6e52c4d8fa73";
const key = ec.keyFromPrivate(privateKey, "hex");


const fromAddress = key.getPublic("hex");
const toAddress = "04f4baddfa5c4820bdb93c9c36f2c78692e4d33c28a2b780df72b6e949d9b504ac";
const amount = 50;


const transactionData = fromAddress + toAddress + amount;
const transactionHash = crypto.createHash("sha256").update(transactionData).digest("hex");


const signature = key.sign(transactionHash, "base64").toDER("hex");

const transaction = {
  type: "TRANSACTION",
  transaction: {
    fromAddress: fromAddress,
    toAddress: toAddress,
    amount: amount,
    signature: signature,
  },
};

console.log(JSON.stringify(transaction, null, 2));
