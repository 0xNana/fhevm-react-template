# Universal FHEVM SDK

**The complete toolkit for building confidential dApps with FHEVM**

A universal, framework-agnostic SDK that provides everything you need to build confidential applications with fully homomorphic encryption on any blockchain

<div align="center">
  
  **🎥 [📺 View My Video Presentation Cover →](youtube-cover.html)**
  
  <sub>One SDK. All Frameworks. Zero Config.</sub>
  
</div>


## Features

-  **Universal SDK** - Works in React, Vue, Node.js, and vanilla JS
-  **Wagmi-like API** - Intuitive, modular interface familiar to Web3 developers
-  **EIP-712 Signing** - Secure user decryption with wallet signatures
-  **Multi-Environment** - Next.js, Vue, and Node.js examples
-  **Zero Config** - Works out of the box with sensible defaults
-  **Interactive Wizard** - Guided setup and testing experience
-  **Comprehensive CLI** - Command-line interface for all operations
-  **Mock Mode** - Auto-detection for easy development (no Windows API issues)
-  **TypeScript First** - Full type safety and IntelliSense
-  **Cross-Framework** - Data encrypted in one framework works in another

##  Architecture

### **Universal FHEVM SDK Structure**

```
┌─────────────────────────────────────────────────────────────┐
│                    Universal FHEVM SDK                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    CORE     │  │    REACT    │  │     VUE     │        │
│  │             │  │             │  │             │        │
│  │ • FHEVMClient│  │ • useFHEVM  │  │ • useFHEVM  │        │
│  │ • Encryption│  │ • useEncrypt│  │ • useEncrypt│        │
│  │ • Decryption│  │ • useDecrypt│  │ • useDecrypt│        │
│  │ • Storage   │  │ • Components│  │ • Composables│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    NODE     │  │   HARDHAT   │  │   MOCK      │        │
│  │             │  │             │  │             │        │
│  │ • CLI Tools │  │ • Detection │  │ • Testing   │        │
│  │ • Utilities │  │ • Integration│  │ • Development│        │
│  │ • Batch Ops │  │ • Local Dev │  │ • No RPC    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   REACT     │    │     VUE     │    │    NODE     │
│             │    │             │    │             │
│ useFHEVM()  │    │ useFHEVM()  │    │ CLI Tools   │
│ useEncrypt()│    │ useEncrypt()│    │ Utilities   │
│ useDecrypt()│    │ useDecrypt()│    │ Batch Ops   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                   ┌──────▼──────┐
                   │     CORE    │
                   │             │
                   │ FHEVMClient │
                   │ Encryption  │
                   │ Decryption  │
                   │ Storage     │
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │   ZAMA      │
                   │             │
                   │ Relayer SDK │
                   │ FHEVM Types │
                   │ Mock Inst.  │
                   └─────────────┘
```

##  Quick Start (< 2 minutes)

### 1. Install & Setup

```bash
# Clone the repository
git clone https://github.com/0xNana/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
pnpm install

# Quick setup (configures everything)
pnpm quickstart
```

### 2. Choose Your Environment

```bash
# Frontend Examples
pnpm dev          # Next.js example
pnpm vue:dev      # Vue example

# Interactive Experience
pnpm fhevm:wizard # 🧙‍♂️ Interactive FHEVM Wizard

# Demo Operations
pnpm demo:counter # Counter operations
pnpm demo:bank    # Bank operations  
pnpm demo:voting  # Voting operations

# See all examples
pnpm examples
```

##  Framework Integration

### **React Integration**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   REACT     │    │     CORE    │    │   ZAMA      │
│             │    │             │    │             │
│ useFHEVM()  │───▶│ FHEVMClient │───▶│ Relayer SDK │
│ useEncrypt()│    │ encrypt()   │    │ FHEVM Types │
│ useDecrypt()│    │ decrypt()   │    │ Mock Inst.  │
│ Components  │    │ Storage     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Vue Integration**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     VUE     │    │     CORE    │    │   ZAMA      │
│             │    │             │    │             │
│ useFHEVM()  │───▶│ FHEVMClient │───▶│ Relayer SDK │
│ useEncrypt()│    │ encrypt()   │    │ FHEVM Types │
│ useDecrypt()│    │ decrypt()   │    │ Mock Inst.  │
│ Composables │    │ Storage     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Node.js Integration**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    NODE     │    │     CORE    │    │   ZAMA      │
│             │    │             │    │             │
│ CLI Tools   │───▶│ FHEVMClient │───▶│ Relayer SDK │
│ Utilities   │    │ encrypt()   │    │ FHEVM Types │
│ Batch Ops   │    │ decrypt()   │    │ Mock Inst.  │
│ Server      │    │ Storage     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

##  Live Demos

- **Next.js Demo**: [https://mynextdpoc.vercel.app](https://mynextpoc.vercel.app) 
- **Vue Demo**: [https://myvuedpoc.vercel.app](https://myvuepoc.vercel.app) 


> **Note**: Deployment links will be updated once deployed. All examples work locally with `pnpm dev`, `pnpm vue:dev`, and `pnpm cli:start`.

##  Installation

```bash
# Install the SDK
npm install @fhevm/sdk

# Or with pnpm
pnpm add @fhevm/sdk
```

##  Basic Usage

### Core SDK (Framework Agnostic)

```typescript
import { createFHEVMClient } from '@fhevm/sdk'

// Create client
const client = createFHEVMClient({
  rpcUrl: 'https://sepolia.infura.io/v3/INPUT_YOUR_INFURA_API_KEY_HERE',
  chainId: 11155111
})

// Initialize
await client.initialize()

// Encrypt
const encrypted = await client.encrypt(42, { 
  publicKey: '0x...' 
})

// Decrypt (public)
const decrypted = await client.decrypt({
  handle: encrypted,
  contractAddress: '0x...',
  usePublicDecrypt: true
})
```

### React Hooks

```tsx
import { useFHEVM, useEncrypt, useDecrypt } from '@fhevm/sdk/react'

function MyComponent() {
  const { instance, isReady } = useFHEVM()
  const { encrypt, isEncrypting } = useEncrypt(instance, {
    publicKey: '0x...',
    contractAddress: '0x...'
  })
  const { decrypt, isDecrypting } = useDecrypt(instance, {
    handle: '0x...',
    contractAddress: '0x...'
  })

  return (
    <div>
      <button onClick={() => encrypt(42)} disabled={isEncrypting}>
        Encrypt
      </button>
      <button onClick={() => decrypt()} disabled={isDecrypting}>
        Decrypt
      </button>
    </div>
  )
}
```

### Vue Composables

```vue
<script setup>
import { useFHEVM, useEncryption, useDecryption } from '@fhevm/sdk/vue'

const { instance, isReady } = useFHEVM()
const { encrypt, isEncrypting } = useEncryption(instance, {
  publicKey: '0x...',
  contractAddress: '0x...'
})
const { decrypt, isDecrypting } = useDecryption(instance, {
  handle: '0x...',
  contractAddress: '0x...'
})
</script>
```

### Node.js CLI & Utilities

```typescript
import { createFHEVMClientForNode, encryptValue, decryptValue } from '@fhevm/sdk/node'

// Create client (auto-detects mock mode)
const client = createFHEVMClientForNode({
  rpcUrl: 'http://localhost:8545', // Mock mode default
  chainId: 31337
})

// Initialize
await client.initialize()

// Encrypt value
const encrypted = await encryptValue(42, '0x...', client)

// Decrypt handle
const decrypted = await decryptValue(
  '0x...', // handle
  '0x...', // contract address
  client,
  { usePublicDecrypt: true }
)
```

### Node.js Server-Side

```typescript
import { createFHEVMClientForNode } from '@fhevm/sdk/node'
import { ethers } from 'ethers'

// Server-side FHEVM operations
const client = createFHEVMClientForNode({
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  chainId: parseInt(process.env.CHAIN_ID || '31337')
})

await client.initialize()

// Batch operations
const values = [1, 2, 3, 4, 5]
const encrypted = await Promise.all(
  values.map(value => encryptValue(value, publicKey, client))
)

// Contract interaction
const contract = new ethers.Contract(address, abi, signer)
const result = await contract.someFunction(encrypted[0])
```

### Interactive Wizard (Recommended)

```bash
# Interactive setup and testing
pnpm fhevm:wizard

# Choose from:
# - 🏦 Bank Demo (deposit, withdraw, transfer)
# - 🗳️ Voting Demo (create session, vote, decrypt results)  
# - 🔢 Counter Demo (increment, decrement, get count)
# - 🧪 Test Mode (verify environment)
```

### Universal CLI (Advanced Operations)

```bash
# Initialize setup
pnpm fhevm-cli:init

# Basic operations
pnpm fhevm-cli:encrypt --value 5 --public-key 0x...
pnpm fhevm-cli:decrypt --handle 0x... --contract 0x... --public

# Batch operations
pnpm fhevm-cli:batch-encrypt --values "1,2,3" --public-key 0x...
pnpm fhevm-cli:batch-decrypt --handles "0x...,0x..." --contract 0x... --public

# User decryption (EIP-712)
pnpm fhevm-cli:user-decrypt --handle 0x... --contract 0x... --signature 0x...

# Status and testing
pnpm fhevm-cli:status --detailed
pnpm fhevm-cli:test
```

### Demo Operations (Real Blockchain)

```bash
# Counter operations
pnpm demo:counter  # Increment, get count, decrypt

# Bank operations  
pnpm demo:bank     # Deposit, withdraw, transfer, decrypt

# Voting operations
pnpm demo:voting   # Create session, vote, decrypt results

# Run all demos
pnpm demo:all
```

## 🛠️ Available Commands

### Root Commands

```bash
# Quick setup
pnpm quickstart

# Frontend Development
pnpm dev          # Next.js example
pnpm vue:dev      # Vue example

# Interactive Experience
pnpm fhevm:wizard # 🧙‍♂️ Interactive FHEVM Wizard

# Demo Operations
pnpm demo:counter # Counter operations
pnpm demo:bank    # Bank operations
pnpm demo:voting  # Voting operations
pnpm demo:all     # Run all demos

# Universal CLI
pnpm fhevm-cli:init        # Interactive setup
pnpm fhevm-cli:encrypt     # Encrypt values
pnpm fhevm-cli:decrypt     # Decrypt handles
pnpm fhevm-cli:batch-encrypt # Batch encryption
pnpm fhevm-cli:batch-decrypt # Batch decryption
pnpm fhevm-cli:user-decrypt  # User decryption (EIP-712)
pnpm fhevm-cli:status      # Check status
pnpm fhevm-cli:test        # Test operations

# Building
pnpm build:all    # Build everything
pnpm sdk:build    # Build SDK only

# Examples
pnpm examples     # Show all examples
```

### Framework-Specific Commands

```bash
# Next.js
pnpm next:dev     # Development server
pnpm next:build   # Build for production
pnpm next:start   # Start production server

# Vue
pnpm vue:dev      # Development server
pnpm vue:build    # Build for production
pnpm vue:preview  # Preview production build

# Node.js (Legacy - use demo: commands instead)
pnpm node:dev     # Development with hot reload
pnpm node:build   # Build for production
pnpm node:start   # Start production server
```

##  Architecture

```
packages/
├── fhevm-sdk/           # Universal SDK
│   ├── src/             # Core functionality
│   ├── react/           # React hooks & components
│   ├── vue/             # Vue composables
│   └── node/            # Node.js utilities & CLI
├── nextjs-example/      # Next.js showcase
├── vue-example/         # Vue showcase
├── node-example/        # Node.js demos & wizard
│   ├── src/fhevm-wizard.js  # 🧙‍♂️ Interactive wizard
│   ├── src/server-side/     # Demo operations
│   └── src/cli/             # CLI tools
└── hardhat/             # Smart contracts
```

### Key Components

- ** Interactive Wizard**: Guided setup and testing experience
- ** Mock Mode**: Auto-detection for easy development
- ** Universal SDK**: Framework-agnostic core
- ** Comprehensive CLI**: All FHEVM operations
- ** Cross-Framework**: Data compatibility across frameworks

##  Encryption & Decryption

### Public Decryption (No Signature)

```typescript
const decrypted = await client.decrypt({
  handle: encrypted,
  contractAddress: '0x...',
  usePublicDecrypt: true
})
```

### User Decryption (EIP-712 Signature)

```typescript
import { FhevmDecryptionSignature } from '@fhevm/sdk'

// Generate signature
const signature = await FhevmDecryptionSignature.loadOrSign(
  instance,
  [contractAddress],
  signer,
  storage
)

// Decrypt with signature
const decrypted = await client.decrypt({
  handle: encrypted,
  contractAddress: '0x...',
  signature: signature.signature
})
```

##  Reusable Components

### React Components

```tsx
import { FHEVMProvider, EncryptButton, DecryptButton } from '@fhevm/sdk/react'

<FHEVMProvider config={config}>
  <EncryptButton 
    value={42} 
    publicKey="0x..." 
    onEncrypted={handleEncrypted}
  />
  <DecryptButton 
    handle={encrypted} 
    usePublicDecrypt={true}
    onDecrypted={handleDecrypted}
  />
</FHEVMProvider>
```

##  Examples

### Complete Examples

- **Next.js**: `packages/nextjs-example/` - Full React app with wagmi integration
- **Vue**: `packages/vue-example/` - Complete Vue 3 app with composables
- **Node.js**: `packages/node-example/` - CLI tools, wizard, and demos

### **UPSTREAM VS OUR ENHANCEMENT**

```
┌─────────────────────────────────────────────────────────────┐
│                    UPSTREAM (Zama)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   BROWSER   │  │    MOCK     │  │    REACT    │        │
│  │             │  │             │  │             │        │
│  │ • Relayer   │  │ • Basic     │  │ • Hooks     │        │
│  │ • EIP-712   │  │ • Testing   │  │ • Components│        │
│  │ • Types     │  │ • Local     │  │ • Examples  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  OUR ENHANCEMENTS                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    CORE     │  │    REACT    │  │     VUE     │        │
│  │             │  │             │  │             │        │
│  │ • Universal │  │ • Enhanced  │  │ • Composables│        │
│  │ • Cross-Env │  │ • Hooks     │  │ • Vue 3     │        │
│  │ • Storage   │  │ • Components│  │ • Pinia     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    NODE     │  │   HARDHAT   │  │   BATCH     │        │
│  │             │  │             │  │             │        │
│  │ • CLI Tools │  │ • Detection │  │ • Encrypt   │        │
│  │ • Utilities │  │ • Integration│  │ • Decrypt   │        │
│  │ • Server    │  │ • Local Dev │  │ • Efficiency│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Interactive Examples

```bash
# 🧙‍♂️ Interactive Wizard (Recommended)
pnpm fhevm:wizard

# Choose from:
# - 🏦 Bank Demo (deposit, withdraw, transfer)
# - 🗳️ Voting Demo (create session, vote, decrypt results)
# - 🔢 Counter Demo (increment, decrement, get count)
# - 🧪 Test Mode (verify environment)
```

### Quick Examples

```bash
# Frontend examples
pnpm next:dev          # Next.js example
pnpm vue:dev      # Vue example

# Demo operations
pnpm demo:counter # Counter operations
pnpm demo:bank    # Bank operations
pnpm demo:voting  # Voting operations
pnpm demo:all     # Run all demos
```

### Mock Mode Examples

```bash
# Works without real blockchain (perfect for development)
pnpm fhevm-cli:init
# Choose "Mock Mode" for instant setup

# Test encryption/decryption
pnpm fhevm-cli:encrypt --value 42 --public-key 0x123
pnpm fhevm-cli:decrypt --handle 0x... --contract 0x456 --public
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```bash
# Required
RPC_URL=https://sepolia.infura.io/v3/INPUT_YOUR_INFURA_API_KEY_HERE
CHAIN_ID=11155111

# Optional
PRIVATE_KEY=0x...  # For Node.js operations
MNEMONIC="..."     # Alternative to PRIVATE_KEY
```

### SDK Configuration

```typescript
const config = {
  rpcUrl: 'https://sepolia.infura.io/v3/INPUT_YOUR_INFURA_API_KEY_HERE',
  chainId: 11155111,
  mockChains: {
    31337: 'http://localhost:8545' // Local development
  }
}
```

##  Getting Started Checklist

- [ ] Clone repository: `git clone ... && cd fhevm-react-template`
- [ ] Install dependencies: `pnpm install`
- [ ] Quick setup: `pnpm quickstart`
- [ ] Try the wizard: `pnpm fhevm:wizard` (recommended)
- [ ] Or choose environment: `pnpm dev` | `pnpm vue:dev` | `pnpm demo:counter`
- [ ] Start building! 🎉

## 🎯 Why Choose This SDK?

### ✅ **Developer Experience**
- **Interactive Wizard**: Guided setup and testing
- **Mock Mode**: No Windows API headaches
- **Zero Config**: Works out of the box
- **TypeScript First**: Full type safety

### ✅ **Universal Compatibility**
- **Cross-Framework**: Data works everywhere
- **Multiple Environments**: React, Vue, Node.js
- **Real Blockchain**: Production-ready integration
- **Comprehensive CLI**: All operations available

### ✅ **Production Ready**
- **Error Handling**: Robust error recovery

```
- **Security**: EIP-712 signatures, input validation
- **Performance**: Lazy loading, caching, optimization
- **Documentation**: Comprehensive guides and examples

##  Contributing

This is part of the Universal FHEVM SDK. Contributions are welcome!

##  License

BSD-3-Clause-Clear License

---

**Ready to build confidential dApps?** Run `pnpm quickstart` to get started! 