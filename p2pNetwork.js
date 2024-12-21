const WebSocket = require("ws");
const Transaction = require("./transaction");

const MESSAGE_TYPES = {
  CHAIN: "CHAIN",
  TRANSACTION: "TRANSACTION",
  MINE: "MINE",
  REQUEST_CHAIN: "REQUEST_CHAIN",
  START_MINING: "START_MINING",
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
    try {
      const data = JSON.parse(message);
      this.handleMessage(socket, data);
    } catch (error) {
      console.error("Erro ao processar mensagem recebida:", error.message);
    }
  });

  this.requestChain(socket);
}


  handleMessage(socket, message) {
    switch (message.type) {
      case MESSAGE_TYPES.CHAIN:
        console.log("Recebendo blockchain...");
        if (this.blockchain.replaceChain(message.chain)) {
          console.log("Cadeia local substituída pela cadeia recebida.");
          this.broadcastChain();
        } else {
          console.log("Cadeia recebida foi ignorada.");
        }
        break;

      case MESSAGE_TYPES.TRANSACTION:
        console.log("Recebendo transação...");
        try {
          const transaction = new Transaction(
            message.transaction.fromAddress,
            message.transaction.toAddress,
            message.transaction.amount
          );
          transaction.signature = message.transaction.signature;
          this.blockchain.addTransaction(transaction);
          console.log("Transação adicionada com sucesso.");
        } catch (error) {
          console.error("Erro ao adicionar transação:", error.message);
        }
        break;

      case MESSAGE_TYPES.START_MINING:
        console.log("Iniciando mineração contínua por solicitação remota...");
        this.blockchain.minePendingTransactions(message.minerAddress);
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
      chains: [this.blockchain.chain],
    })
  );
}

  requestChain(socket) {
  
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.REQUEST_CHAIN,
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

  broadcastStartMining(minerAddress) {
    this.sockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.START_MINING,
          minerAddress,
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
