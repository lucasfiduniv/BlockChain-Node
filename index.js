const Blockchain = require("./blockchain");
const P2PNetwork = require("./p2pNetwork");
const EC = require("elliptic").ec;

const ec = new EC("secp256k1");

const blockchain = new Blockchain();
const p2pNetwork = new P2PNetwork(blockchain);

const P2P_PORT = process.env.P2P_PORT || 6001;

p2pNetwork.startServer(P2P_PORT);

if (process.env.PEER) {
  const peers = process.env.PEER.split(",");
  peers.forEach((peer) => p2pNetwork.connectToNode(peer));
}

const minerKey = ec.keyFromPrivate(
  "b1fc8835f22444a6c62102f2e93e21772e4799cfaeb8ad209feb90d6a90",
  "hex"
);
const minerAddress = minerKey.getPublic("hex");

setInterval(() => {
  blockchain.minePendingTransactions(minerAddress);
  const lastBlock = blockchain.getLatestBlock();
  console.log("Novo bloco minerado:", lastBlock);
  p2pNetwork.broadcastMine(lastBlock);
}, 60000);
