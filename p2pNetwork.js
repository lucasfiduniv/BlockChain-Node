const WebSocket = require("ws");

const MESSAGE_TYPES = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  mine: "MINE",
  peer: "PEER",
  ping: "PING",
  pong: "PONG",
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

  sendPeers(socket) {
    const peerAddresses = this.sockets.map((s) => s._socket.remoteAddress);
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.peer,
        peers: peerAddresses,
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
        this.blockchain.handleBlockchainSync(message.chain);
        break;
      case MESSAGE_TYPES.transaction:
        this.blockchain.addTransaction(message.transaction);
        break;
      case MESSAGE_TYPES.mine:
        this.blockchain.handleNewBlock(message.block);
        break;
      case MESSAGE_TYPES.peer:
        message.peers.forEach((peer) => this.connectToNode(peer));
        break;
      case MESSAGE_TYPES.ping:
        socket.send(JSON.stringify({ type: MESSAGE_TYPES.pong }));
        break;
      default:
        console.error("Tipo de mensagem desconhecido:", message.type);
    }
  }
}

module.exports = P2PNetwork;
