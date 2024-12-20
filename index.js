const Blockchain = require('./blockchain');
const Block = require('./block');

// Criar um blockchain
let myBlockchain = new Blockchain();

console.log('Adicionando o bloco 1...');
myBlockchain.addBlock(new Block(1, '18/12/2024', { amount: 4 }));

console.log('Adicionando o bloco 2...');
myBlockchain.addBlock(new Block(2, '19/12/2024', { amount: 10 }));

// Verificar a integridade da cadeia
console.log('O blockchain é válido?', myBlockchain.isChainValid());

// Exibir os blocos
console.log(JSON.stringify(myBlockchain, null, 4));
