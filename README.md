### README - Blockchain Node System

---

## **Descrição do Projeto**
Este projeto implementa uma blockchain simples usando Node.js. O sistema suporta transações, mineração, propagação de blocos e transações através de uma rede descentralizada P2P (peer-to-peer) baseada em WebSockets. Ele permite a interação via HTTP para criar transações, minerar blocos e consultar a blockchain.

---

## **Principais Funcionalidades**
- **Blockchain e Mineração:**
  - Criação e validação de blocos.
  - Mineração de blocos com recompensa para mineradores.
  - Propagação de novos blocos para outros nós na rede.

- **Transações:**
  - Criação de transações com assinatura digital.
  - Propagação de transações pela rede P2P.
  - Verificação de saldo com base nas transações.

- **Rede P2P:**
  - Conexão entre nós para sincronizar blockchains.
  - Transmissão de blocos e transações entre nós.

---

## **Pré-requisitos**
Certifique-se de ter o seguinte instalado no seu sistema:
- **Node.js** (versão 14.x ou superior)
- **NPM** (vem junto com o Node.js)

---

## **Configuração e Instalação**

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/lucasfiduniv/blockchain-node.git
   cd blockchain-node
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Estrutura de Arquivos**
   Certifique-se de que os arquivos estão organizados da seguinte maneira:
   ```
   blockchain-node/
   ├── index.js                # Arquivo principal do servidor
   ├── startInstances.js     # Script para iniciar múltiplos nós
   ├── blockchain.js         # Classe Blockchain
   ├── block.js              # Classe Block
   ├── transaction.js        # Classe Transaction
   ├── p2pNetwork.js         # Gerenciamento P2P
   ├── package.json          # Configurações do projeto e dependências
   └── node_modules/         # Dependências instaladas
   ```

---

## **Como Executar**

### **Iniciar um único nó**
Para iniciar uma única instância do nó blockchain, execute:
```bash
HTTP_PORT=3001 P2P_PORT=6001 node app.js
```
Substitua as portas, se necessário.

### **Iniciar múltiplos nós (recomendado)**
Use o script `startInstances.js` para iniciar várias instâncias e conectá-las automaticamente:
```bash
node startInstances.js
```
Este script iniciará quatro nós com as seguintes configurações:
- Nó 1: HTTP na porta `3001`, P2P na porta `6001`
- Nó 2: HTTP na porta `3002`, P2P na porta `6002`, conectado ao Nó 1
- Nó 3: HTTP na porta `3003`, P2P na porta `6003`, conectado ao Nó 1
- Nó 4: HTTP na porta `3004`, P2P na porta `6004`, conectado aos Nós 2 e 3

---

## **API HTTP**
Cada nó fornece uma API REST para interagir com a blockchain. Aqui estão os principais endpoints:

### **1. Obter todos os blocos**
- **GET** `/blocks`
- **Descrição:** Retorna todos os blocos na blockchain.
- **Exemplo:**
  ```bash
  curl http://localhost:3001/blocks
  ```

### **2. Criar uma nova transação**
- **POST** `/transactions`
- **Descrição:** Adiciona uma transação à lista de transações pendentes.
- **Corpo da Requisição:**
  ```json
  {
    "fromAddress": "seu-endereco-publico",
    "toAddress": "endereco-destino",
    "amount": 50,
    "privateKey": "sua-chave-privada"
  }
  ```
- **Exemplo:**
  ```bash
  curl -X POST http://localhost:3001/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fromAddress": "endereco1",
    "toAddress": "endereco2",
    "amount": 100,
    "privateKey": "chave-privada-aqui"
  }'
  ```

### **3. Mineração de blocos**
- **POST** `/mine`
- **Descrição:** Minera um novo bloco e propaga para a rede.
- **Exemplo:**
  ```bash
  curl -X POST http://localhost:3001/mine
  ```

### **4. Consultar saldo**
- **GET** `/balance/:address`
- **Descrição:** Retorna o saldo do endereço especificado.
- **Exemplo:**
  ```bash
  curl http://localhost:3001/balance/seu-endereco-publico
  ```

### **5. Obter transações pendentes**
- **GET** `/pendingTransactions`
- **Descrição:** Retorna a lista de transações pendentes.
- **Exemplo:**
  ```bash
  curl http://localhost:3001/pendingTransactions
  ```

---

## **Como Funciona a Rede P2P**

1. **Inicialização dos nós:**
   Cada nó inicia um servidor WebSocket na porta configurada. Por padrão, a porta inicial é `6001`.

2. **Conexão entre nós:**
   O script `startInstances.js` conecta automaticamente os nós listados como `peers`. Novos nós podem ser conectados manualmente usando o método `connectToNode` na classe `P2PNetwork`.

3. **Propagação de dados:**
   - Transações pendentes são propagadas para todos os nós conectados.
   - Novos blocos minerados também são enviados para sincronização.

---

## **Testando o Sistema**

### **Teste Básico:**
1. Inicie o sistema com o script `startInstances.js`.
2. Acesse o nó 1 (`http://localhost:3001`) e crie uma transação.
3. Verifique as transações pendentes no nó 2 (`http://localhost:3002/pendingTransactions`).
4. Minere um bloco no nó 1 (`http://localhost:3001/mine`).
5. Verifique os blocos atualizados no nó 3 (`http://localhost:3003/blocks`).

### **Teste de Conexões P2P:**
1. Conecte manualmente um novo nó:
   ```bash
   HTTP_PORT=3005 P2P_PORT=6005 PEER=ws://localhost:6001 node app.js
   ```
2. Verifique se o nó 5 sincroniza automaticamente a blockchain do nó 1.

---

## **Dependências**
Este projeto usa as seguintes bibliotecas:
- [express](https://www.npmjs.com/package/express) - Framework web para a API HTTP.
- [body-parser](https://www.npmjs.com/package/body-parser) - Middleware para processar requisições HTTP.
- [elliptic](https://www.npmjs.com/package/elliptic) - Biblioteca para criptografia de curva elíptica.
- [ws](https://www.npmjs.com/package/ws) - Biblioteca para implementar WebSockets.

Instale as dependências com:
```bash
npm install
```

---

## **Contribuindo**
1. Faça um fork do repositório.
2. Crie um branch para sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -m "Adiciona minha nova feature"
   ```
4. Envie para o branch principal:
   ```bash
   git push origin minha-feature
   ```

---

## **Licença**
Este projeto é distribuído sob a Licença MIT. Sinta-se à vontade para usá-lo e modificá-lo conforme necessário.

---

Se tiver dúvidas ou problemas, entre em contato com o autor do repositório ou abra uma issue no GitHub. 🚀
