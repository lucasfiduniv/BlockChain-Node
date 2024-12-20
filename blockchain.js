const Block = require("./block");
const Transaction = require("./transaction");

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 5;
    this.isMining = false;
  }

  createGenesisBlock() {
    return new Block(0, "01/01/2024", [], "0");
  }
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transação deve conter de e para endereços.");
    }

    if (!transaction.isValid()) {
      throw new Error("Transação inválida!");
    }

    console.log("Adicionando transação à fila...");
    this.pendingTransactions.push(transaction);

    if (!this.isMining) {
      await this.startMining();
    }
  }

  async startMining() {
    if (this.pendingTransactions.length === 0) {
      console.log("Nenhuma transação para minerar.");
      return;
    }

    this.isMining = true;

    console.log("Iniciando mineração...");
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);

    console.log("Bloco minerado com sucesso!");
    this.chain.push(block);

    const rewardTransaction = new Transaction(
      null,
      "miner-address",
      this.miningReward
    );
    this.pendingTransactions = [rewardTransaction];

    this.isMining = false;

    if (this.pendingTransactions.length > 1) {
      await this.startMining();
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

      for (const transaction of currentBlock.transactions) {
        if (!transaction.isValid()) {
          return false;
        }
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
}

module.exports = Blockchain;
