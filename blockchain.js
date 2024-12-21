const Block = require("./block");
const Transaction = require("./transaction");

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 4;
    this.p2pNetwork = null; 
  }

  setP2PNetwork(p2pNetwork) {
    this.p2pNetwork = p2pNetwork;
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

  block.miner = minerAddress;
  block.mineBlock(this.difficulty);

  console.log("Bloco minerado:", block);
  this.chain.push(block);

  this.pendingTransactions = [
    new Transaction(null, minerAddress, this.miningReward),
  ];

  if (this.p2pNetwork) {
    this.p2pNetwork.broadcastChain();
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

  isChainValid(chain = this.chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (!currentBlock.hash.startsWith("0".repeat(this.difficulty))) {
        return false;
      }
    }
    return true;
  }

  isValidBlock(block) {
    const latestBlock = this.getLatestBlock();
    return (
      block.previousHash === latestBlock.hash &&
      block.hash === block.calculateHash() &&
      block.hash.startsWith("0".repeat(this.difficulty))
    );
  }

  handleBlockchainSync(receivedChain) {
    if (
      receivedChain.length > this.chain.length &&
      this.isChainValid(receivedChain)
    ) {
      console.log("Blockchain sincronizada com nova cadeia mais longa.");
      this.chain = receivedChain;

      if (this.p2pNetwork) {
        this.p2pNetwork.broadcastChain(); 
      }
    } else {
      console.log("Blockchain recebida é inválida ou menor que a atual.");
    }
  }

  replaceChain(newChain) {
    if (newChain.length > this.chain.length && this.isChainValid(newChain)) {
      this.chain = newChain;
      console.log("Cadeia local substituída pela nova cadeia.");
      return true;
    }
    console.log("Nova cadeia não foi aceita.");
    return false;
  }
}

module.exports = Blockchain;
