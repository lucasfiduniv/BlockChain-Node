const fs = require("fs");
const Block = require("./block");
const Transaction = require("./transaction");

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 6;
  }

  createGenesisBlock() {
    return new Block(0, "01/01/2024", [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transação deve conter de e para endereços.");
    }

    if (!transaction.isValid()) {
      throw new Error("Transação inválida!");
    }

    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(minerAddress) {
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log("Bloco minerado com sucesso!");
    this.chain.push(block);

    this.pendingTransactions = [new Transaction(null, minerAddress, this.miningReward)];
  }
  
handleBlockchainSync(receivedChain) {
  if (receivedChain.length > this.chain.length && this.isChainValid(receivedChain)) {
    console.log("Blockchain substituída por uma versão mais longa.");
    this.chain = receivedChain;
  } else {
    console.log("Blockchain recebida é inválida ou não é mais longa.");
  }
}

  getBalance(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }
        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.transactions.every((tx) => tx.isValid())) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  isValidBlock(block) {
    const previousBlock = this.getLatestBlock();

    if (block.previousHash !== previousBlock.hash) return false;
    if (block.hash !== block.calculateHash()) return false;

    return true;
  }

  saveBlockchain() {
    fs.writeFileSync("blockchain.json", JSON.stringify(this.chain, null, 2));
  }

  loadBlockchain() {
    if (fs.existsSync("blockchain.json")) {
      const data = fs.readFileSync("blockchain.json");
      this.chain = JSON.parse(data);
    }
  }
}

module.exports = Blockchain;
