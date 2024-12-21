const WebSocket = require("ws");
const Transaction = require("./transaction");

const MESSAGE_TYPES = {
  CHAIN: "CHAIN",
  TRANSACTION: "TRANSACTION",
  MINE: "MINE",
  REQUEST_CHAIN: "REQUEST_CHAIN",
};

class P2PNetwork {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.sockets = [];
  }

  startServer(port) {
    const server = new WebSocket.Server({ port });

    server.on("connection", (socket) => {
      this.connectSocket(socket);
      console.log(`Novo nó conectado no servidor P2P na porta ${port}`);
    });

    console.log(`Servidor P2P rodando na porta ${port}`);
  }

  connectToNode(address) {
    const socket = new WebSocket(address);

    socket.on("open", () => {
      this.connectSocket(socket);
      console.log(`Conectado ao nó: ${address}`);
    });

    socket.on("error", (error) => {
      console.error(`Erro ao conectar ao nó ${address}:`, error.message);
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);

    socket.on("message", (message) => {
      const data = JSON.parse(message);
      this.handleMessage(socket, data);
    });

    this.sendBlockchain(socket); 
  }

  handleMessage(socket, message) {
  switch (message.type) {
    case MESSAGE_TYPES.CHAIN:
      console.log("Recebendo blockchain...");
      this.blockchain.handleBlockchainSync(message.chain);
      break;

    case MESSAGE_TYPES.TRANSACTION:
      console.log("Recebendo transação...");
      const transactionData = message.transaction;

      const transaction = new Transaction(
        transactionData.fromAddress,
        transactionData.toAddress,
        transactionData.amount
      );
      transaction.signature = transactionData.signature;

      try {
        this.blockchain.addTransaction(transaction);
        console.log("Transação adicionada com sucesso.");
      } catch (error) {
        console.error("Erro ao adicionar transação:", error.message);
      }
      break;

    case MESSAGE_TYPES.MINE:
      console.log("Recebendo novo bloco...");
      const block = message.block;
      if (this.blockchain.isValidBlock(block)) {
        this.blockchain.chain.push(block);
        console.log("Bloco adicionado à blockchain.");
        this.broadcastChain();
      } else {
        console.log("Bloco inválido recebido.");
      }
      break;

    case MESSAGE_TYPES.REQUEST_CHAIN:
      console.log("Respondendo solicitação de blockchain...");
      this.sendBlockchain(socket);
      break;

    default:
      console.error("Mensagem desconhecida recebida:", message.type);
  }
}



  sendBlockchain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.CHAIN,
        chain: this.blockchain.chain,
      })
    );
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.TRANSACTION,
          transaction,
        })
      );
    });
  }

  broadcastMine(block) {
    this.sockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.MINE,
          block,
        })
      );
    });
  }

  broadcastChain() {
    this.sockets.forEach((socket) => {
      this.sendBlockchain(socket);
    });
  }
}

module.exports = P2PNetwork;
