const { exec } = require("child_process");
const isWindows = process.platform === "win32";


const instances = [
  { httpPort: 3001, p2pPort: 6001, peers: [] },
  { httpPort: 3002, p2pPort: 6002, peers: ["ws://localhost:6001"] },
  { httpPort: 3003, p2pPort: 6003, peers: ["ws://localhost:6001"] },
  { httpPort: 3004, p2pPort: 6004, peers: ["ws://localhost:6002", "ws://localhost:6003"] },
];

instances.forEach(({ httpPort, p2pPort, peers }) => {
  console.log(`Iniciando instância com HTTP_PORT=${httpPort} e P2P_PORT=${p2pPort}`);
  
  const command = isWindows
    ? `set HTTP_PORT=${httpPort} && set P2P_PORT=${p2pPort} && node index.js`
    : `HTTP_PORT=${httpPort} P2P_PORT=${p2pPort} node index.js`;
  const process = exec(command);

  process.stdout.on("data", (data) => {
    console.log(`[HTTP ${httpPort}]: ${data}`);
  });

  process.stderr.on("data", (data) => {
    console.error(`[HTTP ${httpPort} ERROR]: ${data}`);
  });

  process.on("close", (code) => {
    console.log(`[HTTP ${httpPort}]: Instância encerrada com código ${code}`);
  });

  setTimeout(() => {
    peers.forEach((peer) => {
      console.log(`[HTTP ${httpPort}]: Conectando ao peer ${peer}`);
      const peerCommand = isWindows
        ? `set HTTP_PORT=${httpPort} && set P2P_PORT=${p2pPort} && set PEER=${peer} && node index.js`
        : `HTTP_PORT=${httpPort} P2P_PORT=${p2pPort} PEER=${peer} node index.js`;
      exec(peerCommand);
    });
  }, 3000); 
});
