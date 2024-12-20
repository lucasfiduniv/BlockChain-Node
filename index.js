const Blockchain = require("./blockchain");
const Transaction = require("./transaction");
const P2PNetwork = require("./p2pNetwork");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myBlockchain = new Blockchain();
const myNetwork = new P2PNetwork(myBlockchain);

const PORT = process.env.PORT || 6001;

myNetwork.startServer(PORT);

if (process.env.PEER) {
  myNetwork.connectToNode(process.env.PEER);
}

(async () => {
  const myKey = ec.genKeyPair();
  const myWalletAddress = myKey.getPublic("hex");

  const tx1 = new Transaction(myWalletAddress, "address2", 50);
  tx1.signTransaction(myKey);

  myBlockchain.addTransaction(tx1);
  myNetwork.broadcastTransaction(tx1);

  console.log("Iniciando mineração...");
  myBlockchain.minePendingTransactions(myWalletAddress);

  const lastBlock = myBlockchain.getLatestBlock();
  myNetwork.broadcastMine(lastBlock);
})();
