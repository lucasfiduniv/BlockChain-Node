const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const Transaction = require("./transaction");
const P2PNetwork = require("./p2pNetwork");
const EC = require("elliptic").ec;
const fs = require("fs");

const ec = new EC("secp256k1");

const blockchain = new Blockchain();
blockchain.loadBlockchain(); 

const p2pNetwork = new P2PNetwork(blockchain);

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const P2P_PORT = process.env.P2P_PORT || 6001;

const minerKey = ec.keyFromPrivate(
  "b1fc8835f22444a6c62102f2e93e21772e4799cfaeb8ad209feb90d6a90",
  "hex"
);
const minerAddress = minerKey.getPublic("hex");

const app = express();
app.use(bodyParser.json());

app.get("/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/transactions", (req, res) => {
  const { fromAddress, toAddress, amount, privateKey } = req.body;

  try {
    const senderKey = ec.keyFromPrivate(privateKey, "hex");
    const senderAddress = senderKey.getPublic("hex");

    if (senderAddress !== fromAddress) {
      throw new Error("A chave privada não corresponde ao endereço do remetente.");
    }

    const tx = new Transaction(fromAddress, toAddress, amount);

    tx.signTransaction(senderKey);

    blockchain.addTransaction(tx);

    p2pNetwork.broadcastTransaction(tx);

    res.json({ message: "Transação adicionada à fila e transmitida." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/pendingTransactions", (req, res) => {
  res.json(blockchain.pendingTransactions);
});

app.post("/mine", async (req, res) => {
  try {
    blockchain.minePendingTransactions(minerAddress);

    const lastBlock = blockchain.getLatestBlock();

    p2pNetwork.broadcastMine(lastBlock);

    blockchain.saveBlockchain(); 

    res.json({
      message: "Mineração concluída.",
      block: lastBlock,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/balance/:address", (req, res) => {
  const address = req.params.address;

  try {
    const balance = blockchain.getBalance(address);
    res.json({ address, balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(HTTP_PORT, () => {
  console.log(`Servidor HTTP rodando na porta ${HTTP_PORT}`);
});

p2pNetwork.startServer(P2P_PORT);

if (process.env.PEER) {
  p2pNetwork.connectToNode(process.env.PEER);
}
