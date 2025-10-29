# 🚀 FHEVM Node.js Quick Start Guide

Get up and running with the Universal FHEVM SDK in under 5 minutes!

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
pnpm install

# Build the packages
pnpm build:all
```

## Quick Start

### 1. Initialize Configuration

```bash
# Set up your environment
cp packages/node-example/.env.example packages/node-example/.env

# Edit the .env file with your configuration
# You need either PRIVATE_KEY or MNEMONIC
```

### 2. Test Your Setup

```bash
# Test all contracts and configuration
pnpm --filter fhevm-node-example cli init
```

### 3. Start Development

```bash
# Start the API server
pnpm --filter fhevm-node-example cli start

# Or start with hot reload for development
pnpm --filter fhevm-node-example cli dev
```

## Available Commands

### CLI Commands

```bash
# Initialize and test setup
fhevm-node init

# Start API server
fhevm-node start

# Start development server with hot reload
fhevm-node dev

# Check status
fhevm-node status

# Counter operations
fhevm-node counter increment --value 5
fhevm-node counter decrement --value 3
fhevm-node counter get-count

# Bank operations (simulated for Node.js)
fhevm-node bank deposit --amount 100
fhevm-node bank withdraw --amount 50
fhevm-node bank balance --address 0x...

# Voting operations
fhevm-node voting create-session --title "Test" --description "Test session"
fhevm-node voting cast-vote --session-id 1 --choice yes
fhevm-node voting results --session-id 1
```

### API Endpoints

When the server is running, you can access:

- **Health Check**: `GET /health`
- **API Documentation**: `GET /api/docs`
- **Counter**: `GET /api/counter/count`
- **Bank**: `GET /api/bank/total-supply`, `GET /api/bank/balance/:address`
- **Voting**: `GET /api/voting/session-counter`

## Architecture

### Node.js Environment
- **CLI**: Command-line interface for contract interactions
- **API Server**: REST API for frontend integration
- **Contract Utils**: Ethers.js-based contract interactions

### Browser Environment
- **FHEVM Client**: Full encryption/decryption capabilities
- **React/Vue Hooks**: Framework-specific integrations
- **Storage**: In-memory and persistent storage options

## Development Workflow

1. **Backend Development**: Use Node.js CLI and API server
2. **Frontend Development**: Use React/Vue examples with browser FHEVM
3. **Integration**: Connect frontend to Node.js API server

## Examples

### Basic Contract Interaction

```typescript
// Node.js - Contract reading
const contractUtils = createContractUtils(rpcUrl, privateKey)
const contract = contractUtils.getContract({
  address: contractAddress,
  abi: contractABI,
  rpcUrl,
  privateKey
})

const count = await contract.getCount()
console.log('Counter value:', count.toString())
```

### API Integration

```typescript
// Frontend - API calls
const response = await fetch('http://localhost:3002/api/counter/count')
const data = await response.json()
console.log('Counter value:', data.count)
```

## Troubleshooting

### Common Issues

1. **"window is not defined"**: This is expected in Node.js. Use the API server for contract interactions.

2. **"FHEVM client not ready"**: FHEVM encryption requires browser environment. Use the API server for Node.js.

3. **Contract not accessible**: Check your RPC URL and contract addresses in `.env`.

### Getting Help

- Check the API documentation at `http://localhost:3002/api/docs`
- Run `fhevm-node status --detailed` for configuration details
- Check the logs for specific error messages

## Next Steps

1. **Explore Examples**: Check out the React and Vue examples
2. **Build Your App**: Use the API server as your backend
3. **Deploy**: Use the deployment scripts for production

## Contributing

We welcome contributions! Please see our contributing guidelines and submit pull requests.

---

**Happy coding! 🎉**

For more information, visit our [GitHub repository](https://github.com/your-username/fhevm-react-template).
