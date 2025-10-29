# Next.js Example - FHEVM SDK

A comprehensive Next.js application demonstrating the FHEVM SDK with three complete demos: Counter, Bank, and Voting operations.

## 🚀 Features

### **Three Complete Demos**
- **Counter Demo**: Encrypted increment/decrement operations
- **Bank Demo**: Confidential deposits, withdrawals, and transfers
- **Voting Demo**: Encrypted voting with session management

### **Modern Next.js Stack**
- **Next.js 14**: App Router with TypeScript
- **Wagmi**: Ethereum React hooks
- **RainbowKit**: Wallet connection
- **Tailwind CSS**: Modern styling
- **FHEVM SDK**: Universal confidential computing

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Start development
pnpm dev
```

## 🚀 Quick Start

### **1. Start Local Development**

```bash
# Terminal 1: Start Hardhat node
pnpm chain

# Terminal 2: Deploy contracts
pnpm deploy:localhost

# Terminal 3: Start Next.js
pnpm dev
```

### **2. Open Application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Features

### **Counter Demo**
- **Increment/Decrement**: Encrypted counter operations
- **Real-time Status**: FHEVM client state monitoring
- **Error Handling**: Comprehensive error states
- **Modern UI**: Beautiful, responsive interface

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

## 🔧 Configuration

### **Environment Variables**
```bash
# Required for production
NEXT_PUBLIC_ALCHEMY_API_KEY=put_your_alchemy_key_here_from_alchemy_website
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_from_reown_fna_wallet_connet

# Optional
MNEMONIC=your_wallet_mnemonic_you_know_the_drill
INFURA_API_KEY=_as_usual_your_infura_key
```

### **Network Configuration**
- **Local Development**: Hardhat (Chain ID: 31337)
- **Testnet**: Sepolia (Chain ID: 11155111)
- **Mock Chains**: Localhost for development

## 📱 User Interface

### **Navigation**
- **Tab-based Interface**: Easy switching between demos
- **Visual Indicators**: Clear active state indicators
- **Responsive Design**: Works on all screen sizes

### **Status Monitoring**
- **FHEVM Status**: Real-time client state
- **Contract Status**: Deployment and connection status
- **Error States**: Clear error messages and handling

### **Operations**
- **Form-based Input**: Intuitive user inputs
- **Loading States**: Visual feedback during operations
- **Results Display**: Clear output formatting

## 🏆 Bounty Requirements

### **✅ Framework Agnostic**
- Core SDK works in React, Vue, and Node.js
- Framework-specific adapters for each environment
- Clean separation of concerns

### **✅ Wagmi-like Structure**
- Familiar React hooks pattern
- Intuitive API design
- TypeScript-first approach

### **✅ Quick Setup**
- <10 lines of code to get started
- Zero-config defaults
- Comprehensive documentation

### **✅ Full FHEVM Flow**
- Initialize, encrypt, decrypt operations
- Contract interactions
- Error handling and edge cases

### **✅ Multiple Examples**
- Three comprehensive demos
- Real-world use cases
- Production-ready implementation

## 🚀 Deployment

### **Vercel Deployment**
```bash
# Build and deploy
pnpm vercel

# Or with environment variables
pnpm vercel:yolo
```

### **Environment Setup**
1. Set `NEXT_PUBLIC_ALCHEMY_API_KEY`
2. Update contract addresses in `deployedContracts.ts`
3. Configure RPC URLs for production

## 📚 Documentation

- [FHEVM SDK Documentation](../fhevm-sdk/README.md)
- [Node.js Example](../node-example/README.md)
- [Vue Example](../vue-example/README.md)

## 🤝 Contributing

This project is part of the Zama FHEVM Bounty Program. See the main repository for contribution guidelines.

## 📄 License

BSD-3-Clause-Clear License
