const Block = require("./block");
const Transaction = require("./transaction");

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 4;
  }

  createGenesisBlock() {
    return new Block(0, "01/01/2024", [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
  if (!(transaction instanceof Transaction)) {
    transaction = new Transaction(
      transaction.fromAddress,
      transaction.toAddress,
      transaction.amount
    );
    transaction.signature = transaction.signature;
  }

  if (!transaction.fromAddress || !transaction.toAddress) {
    throw new Error("Transação deve conter endereços de origem e destino.");
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

    console.log("Bloco minerado:", block);
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, minerAddress, this.miningReward),
    ];
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
    const latestBlock = this.getLatestBlock();
    return (
      block.previousHash === latestBlock.hash &&
      block.hash === block.calculateHash()
    );
  }

  handleBlockchainSync(receivedChain) {
    if (
      receivedChain.length > this.chain.length &&
      this.isChainValid(receivedChain)
    ) {
      console.log("Blockchain sincronizada com nova cadeia mais longa.");
      this.chain = receivedChain;
    } else {
      console.log("Blockchain recebida é inválida ou menor que a atual.");
    }
  }
}

module.exports = Blockchain;
