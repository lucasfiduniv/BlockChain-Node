const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Gera um novo par de chaves
const key = ec.genKeyPair();
const privateKey = key.getPrivate("hex");
const publicKey = key.getPublic("hex");

// Imprime a chave privada e o endereço público
console.log("Nova Chave Privada:", privateKey);
console.log("Novo Endereço Público (fromAddress):", publicKey);
