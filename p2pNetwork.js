const WebSocket = require("ws");

const MESSAGE_TYPES = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  mine: "MINE",
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
      console.log("Novo nó conectado.");
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
      console.error(`Erro ao conectar no nó ${address}:`, error.message);
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);

    socket.on("message", (message) => {
      this.handleMessage(socket, JSON.parse(message));
    });

    this.sendBlockchain(socket);
  }

  sendBlockchain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.chain,
        chain: this.blockchain.chain,
      })
    );
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach((socket) =>
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.transaction,
          transaction,
        })
      )
    );
  }

  broadcastMine(block) {
    this.sockets.forEach((socket) =>
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.mine,
          block,
        })
      )
    );
  }

  handleMessage(socket, message) {
    switch (message.type) {
      case MESSAGE_TYPES.chain:
        this.handleBlockchainSync(message.chain);
        break;

      case MESSAGE_TYPES.transaction:
        this.blockchain.addTransaction(message.transaction);
        break;

      case MESSAGE_TYPES.mine:
        this.handleNewBlock(message.block);
        break;

      default:
        console.error("Tipo de mensagem desconhecido:", message.type);
    }
  }

  handleBlockchainSync(receivedChain) {
    if (receivedChain.length > this.blockchain.chain.length) {
      console.log("Blockchain atualizada a partir de outro nó.");
      this.blockchain.chain = receivedChain;
    } else {
      console.log("A blockchain local está atualizada.");
    }
  }

  handleNewBlock(block) {
    const lastBlock = this.blockchain.getLatestBlock();

    if (lastBlock.hash === block.previousHash) {
      this.blockchain.chain.push(block);
      console.log("Novo bloco adicionado à blockchain.");
    } else {
      console.error("Bloco recebido é inválido ou fora de ordem.");
    }
  }
}

module.exports = P2PNetwork;
