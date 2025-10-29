# Node.js Example - FHEVM SDK

A comprehensive Node.js demo package showcasing **real contract interactions** with FHEVM operations, **proving FHEVM works in real Node.js environments** (not just browser/mockchains).

> **Note**: This is the **demo package** for contract interactions. For universal FHEVM utilities, use `@fhevm/sdk` with `fhevm-cli` command.

## 🚀 Features

### **Real Environment Operations**
- **Counter Operations**: Increment, decrement, and query encrypted counters
- **Bank Operations**: Deposit, withdraw, transfer, and check balances  
- **Voting Operations**: Create sessions, cast votes, end sessions, and view results
- **Interactive Wizard**: Guided demo experience with `fhevm-wizard.js`
- **Stateless CLI**: Command-line operations for each demo
- **Development Mode**: Hot reload for rapid development

### **Proves FHEVM Works Everywhere**
- **Node.js Environment**: Real server-side FHEVM operations
- **Cross-Framework**: Data encrypted in browser works in Node.js
- **Production Ready**: Error handling, logging, and monitoring
- **No Mockchains**: Uses real blockchain networks

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Install CLI globally (optional)
pnpm install -g .
```

## 🔧 Configuration

Create a `.env` file in the project root:

```env
# Network Configuration
RPC_URL=http://localhost:8545
CHAIN_ID=31337
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Contract Addresses
FHECounter=0x5FbDB2315678afecb367f032d93F642f64180aa3
FHEBank=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
FHEVoting=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

## 🖥️ Usage

### **Interactive Wizard (Recommended)**

```bash
# Start the interactive wizard
pnpm wizard

# Or use the global command
pnpm fhevm:wizard
```

The wizard provides a guided experience through all three demos with:
- **Step-by-step guidance** for each operation
- **Real-time status updates** and error handling
- **Automatic session management** for voting
- **Beautiful CLI interface** with colors and spinners

### **Stateless CLI Operations**

```bash
# Counter operations
pnpm counter                    # Counter demo
pnpm demo:counter              # Stateless counter operations

# Bank operations  
pnpm bank                      # Bank demo
pnpm demo:bank                 # Stateless bank operations

# Voting operations
pnpm voting                    # Voting demo
pnpm demo:voting               # Stateless voting operations

# Run all demos
pnpm demo:all                  # Run all stateless demos
```

### **Development Commands**

```bash
# Start development server
pnpm dev

# Build the project
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Lint code
pnpm lint
```

## 🏗️ Development

### **Project Structure**

```
packages/node-example/
├── src/
│   ├── cli/                 # CLI commands
│   │   ├── index.ts         # Main CLI entry point
│   │   ├── counter.ts       # Counter operations
│   │   ├── bank.ts          # Bank operations
│   │   └── voting.ts        # Voting operations
│   ├── config/              # Configuration management
│   │   └── index.ts         # Config loading and validation
│   ├── contracts/           # Contract ABIs and addresses
│   │   ├── index.ts         # Contract configuration
│   │   ├── addresses.ts     # Contract addresses
│   │   └── abis/            # Contract ABIs
│   └── utils/               # Utility functions
│       ├── fhevm.ts         # FHEVM client utilities
│       ├── contracts.ts     # Contract interaction utilities
│       └── encryption.ts    # Encryption/decryption utilities
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

### **Available Scripts**

```bash
# Interactive Experience
pnpm wizard                 # Interactive FHEVM wizard
pnpm fhevm:wizard          # Global wizard command

# Demo Operations
pnpm demo:counter          # Counter operations
pnpm demo:bank             # Bank operations  
pnpm demo:voting           # Voting operations
pnpm demo:all              # Run all demos

# Development
pnpm dev                   # Start development server
pnpm build                 # Build TypeScript
pnpm start                 # Start production server

# Testing & Quality
pnpm test                  # Run tests
pnpm lint                  # Lint code
pnpm clean                 # Clean build artifacts
```

## 🎯 Demo Features

### **Counter Demo**
- **Increment/Decrement**: Encrypted counter operations
- **Real-time Status**: FHEVM client state monitoring
- **Error Handling**: Comprehensive error states
- **Cross-Framework**: Data encrypted in browser works in Node.js

### **Bank Demo**
- **Deposit**: Encrypt and deposit amounts
- **Withdraw**: Encrypt and withdraw amounts
- **Transfer**: Send encrypted amounts to other users
- **Balance**: View and decrypt encrypted balances

### **Voting Demo**
- **Create Sessions**: Start new voting sessions
- **Cast Votes**: Vote yes/no with encryption
- **View Results**: Decrypt encrypted voting results
- **Session Management**: End and monitor sessions

### **Interactive Wizard**
- **Guided Experience**: Step-by-step demo flow
- **Real-time Feedback**: Status updates and error handling
- **Session Management**: Automatic voting session handling
- **Beautiful CLI**: Colors, spinners, and progress indicators

## 🛠️ Advanced Usage

### **Environment Configuration**

```bash
# Set environment variables
export RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
export CHAIN_ID=11155111
export PRIVATE_KEY="0x..."

# Or use .env file
echo "RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY" > .env
echo "CHAIN_ID=11155111" >> .env
echo "PRIVATE_KEY=0x..." >> .env
```

### **Mock Mode for Development**

```bash
# Use mock mode for local development
export MOCK_MODE=true
pnpm wizard
```

### **Cross-Framework Testing**

```bash
# Test data encrypted in browser works in Node.js
# 1. Encrypt data in Next.js/Vue app
# 2. Use the same handles in Node.js
pnpm demo:counter
```

## 🔒 Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use secure environment variable management
- **Network Security**: Ensure RPC endpoints are secure
- **Contract Verification**: Verify contract addresses before use

## 🐛 Troubleshooting

### **Common Issues**

1. **Configuration Errors**
   ```bash
   # Check configuration
   fhevm-node status --detailed
   ```

2. **Connection Issues**
   ```bash
   # Test connection
   fhevm-node test
   ```

3. **Contract Errors**
   ```bash
   # Verify contract addresses
   fhevm-node status --detailed
   ```

### **Debug Mode**

```bash
# Enable verbose logging
fhevm-node --verbose counter increment --value 5
```

## 📚 Examples

### **Complete Workflow**

```bash
# 1. Start interactive wizard
pnpm wizard

# 2. Or run individual demos
pnpm demo:counter
pnpm demo:bank
pnpm demo:voting

# 3. Run all demos at once
pnpm demo:all
```

### **Development Workflow**

```bash
# 1. Start local development
pnpm dev

# 2. Run tests
pnpm test

# 3. Build for production
pnpm build

# 4. Start production server
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

BSD-3-Clause-Clear

## 🌐 Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM SDK](https://github.com/zama-ai/fhevm)
- [Confidential Computing](https://en.wikipedia.org/wiki/Confidential_computing)

---

**Built with ❤️ by elegant**
