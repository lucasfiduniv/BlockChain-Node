const Blockchain = require("./blockchain");
const Transaction = require("./transaction");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myKey = ec.genKeyPair();
const myWalletAddress = myKey.getPublic("hex");

const myBlockchain = new Blockchain();

async function simulateBlockchain() {
  const tx1 = new Transaction(myWalletAddress, "address2", 50);
  tx1.signTransaction(myKey);

  const tx2 = new Transaction(myWalletAddress, "address3", 20);
  tx2.signTransaction(myKey);

  const tx3 = new Transaction(myWalletAddress, "address3", 20);
  tx2.signTransaction(myKey);

  console.log("Adicionando transações...");
  await myBlockchain.addTransaction(tx1);
  await myBlockchain.addTransaction(tx2);

  console.log(
    "Saldo da minha carteira:",
    myBlockchain.getBalance(myWalletAddress)
  );
}

simulateBlockchain();
