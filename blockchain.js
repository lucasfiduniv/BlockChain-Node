const Block = require('./block');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3; // Nível de dificuldade para mineração
  }

  // Criação do bloco gênesis
  createGenesisBlock() {
    return new Block(0, '01/01/2024', 'Bloco Gênesis', '0');
  }

  // Retornar o último bloco da cadeia
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Adicionar um novo bloco à cadeia
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty); // Minerar o bloco antes de adicioná-lo
    this.chain.push(newBlock);
  }

  // Verificar a integridade da cadeia
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
}

module.exports = Blockchain;
