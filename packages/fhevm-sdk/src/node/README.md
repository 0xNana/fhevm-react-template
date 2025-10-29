# @fhevm/sdk/node

Node.js utilities for FHEVM - FHEVM SDK

## Overview

The `@fhevm/sdk/node` package provides Node.js-specific utilities for working with FHEVM (Fully Homomorphic Encryption Virtual Machine). It includes both programmatic APIs and CLI tools for encryption, decryption, and voting operations.

## Features

- 🔐 **FHEVM Client for Node.js** - Easy-to-use client with Node.js-appropriate defaults
- 🗳️ **Voting Utilities** - Specialized functions for encrypted voting operations
- 📦 **Batch Operations** - Efficient batch encryption and decryption
- 🖥️ **CLI Tool** - Command-line interface for FHEVM operations
- 📊 **Voting Results** - Decrypt and analyze voting results

## Installation

```bash
pnpm add @fhevm/sdk
```

## Quick Start

### Programmatic Usage

```typescript
import { 
  createFHEVMClientForNode, 
  encryptVote, 
  decryptVotingResults,
  type FHEVMConfig 
} from "@fhevm/sdk/node";

// Configure FHEVM client
const config: FHEVMConfig = {
  rpcUrl: "https://sepolia.infura.io/v3/MR_ELEGANT",
  chainId: 11155111, // Sepolia
  mockChains: {
    31337: "http://localhost:8545" // Local development
  }
};

// Encrypt a vote
const vote = await encryptVote(
  true, // true = yes, false = no
  "0x...", // Contract address
  "0x...", // User address
  config
);

// Decrypt voting results
const results = await decryptVotingResults(
  {
    yesVotes: "0x...", // Handle from contract
    noVotes: "0x...",  // Handle from contract
    totalVotes: "0x..." // Handle from contract
  },
  "0x...", // Contract address
  config,
  { usePublicDecrypt: true }
);
```

### CLI Usage

```bash
# Encrypt a vote
pnpm fhevm-cli:encrypt --value 1 --public-key 0x... --contract 0x...

# Decrypt voting results
pnpm fhevm-cli:decrypt --handle 0x... --contract 0x... --public

# Check FHEVM status
pnpm fhevm-cli:status

# Interactive wizard
pnpm fhevm:wizard
```

## API Reference

### Core Functions

#### `createFHEVMClientForNode(config, events?)`

Creates a FHEVM client optimized for Node.js environments.

**Parameters:**
- `config: FHEVMConfig` - FHEVM configuration
- `events?: FHEVMEvents` - Optional event handlers

**Returns:** `FHEVMClient` - Configured FHEVM client

#### `encryptValue(value, publicKey, config)`

Encrypt a numeric value using FHEVM.

**Parameters:**
- `value: number` - Value to encrypt
- `publicKey: string` - Public key for encryption
- `config: FHEVMConfig` - FHEVM configuration

**Returns:** `Promise<string>` - Encrypted handle

#### `decryptValue(handle, contractAddress, config, options?)`

Decrypt a handle using FHEVM.

**Parameters:**
- `handle: string` - Encrypted handle to decrypt
- `contractAddress: string` - Contract address
- `config: FHEVMConfig` - FHEVM configuration
- `options?: DecryptionOptions` - Optional decryption options

**Returns:** `Promise<number>` - Decrypted value

### Voting Functions

#### `encryptVote(vote, contractAddress, userAddress, config)`

Encrypt a vote for the FHEVoting contract.

**Parameters:**
- `vote: boolean` - Vote choice (true = yes, false = no)
- `contractAddress: string` - Voting contract address
- `userAddress: string` - User's wallet address
- `config: FHEVMConfig` - FHEVM configuration

**Returns:** `Promise<{ handle: string; inputProof: string }>` - Encrypted vote data

#### `decryptVotingResults(handles, contractAddress, config, options?)`

Decrypt voting results from the FHEVoting contract.

**Parameters:**
- `handles: { yesVotes: string; noVotes: string; totalVotes: string }` - Vote count handles
- `contractAddress: string` - Voting contract address
- `config: FHEVMConfig` - FHEVM configuration
- `options?: DecryptionOptions` - Optional decryption options

**Returns:** `Promise<{ yesVotes: number; noVotes: number; totalVotes: number }>` - Decrypted results

### Batch Functions

#### `batchEncrypt(values, publicKey, config)`

Encrypt multiple values efficiently.

#### `batchDecrypt(handles, contractAddress, config, options?)`

Decrypt multiple handles efficiently.

## CLI Commands

### **Universal CLI Commands**

```bash
# Initialize FHEVM client
pnpm fhevm-cli:init

# Encrypt a value
pnpm fhevm-cli:encrypt --value <number> --public-key <string> [--contract <address>]

# Decrypt a handle
pnpm fhevm-cli:decrypt --handle <string> --contract <address> [--signature <string>] [--public]

# Batch operations
pnpm fhevm-cli:batch-encrypt --values "1,2,3" --public-key <string>
pnpm fhevm-cli:batch-decrypt --handles "0x...,0x...,0x..." --contract <address>

# User decryption (requires signature)
pnpm fhevm-cli:user-decrypt --handle <string> --contract <address> --signature <string>

# Public decryption (no signature required)
pnpm fhevm-cli:public-decrypt --handle <string> --contract <address>

# Check status
pnpm fhevm-cli:status

# Test operations
pnpm fhevm-cli:test

# Show info
pnpm fhevm-cli:info
```

### **Interactive Wizard**

```bash
# Start interactive wizard
pnpm fhevm:wizard

# Or use global command
pnpm fhevm:wizard
```

The wizard provides:
- **Guided demos** for Counter, Bank, and Voting
- **Real-time feedback** and error handling
- **Session management** for voting operations
- **Beautiful CLI interface** with colors and spinners

## Configuration

### Environment Variables

- `FHEVM_RPC_URL` - RPC URL for the blockchain network
- `FHEVM_CHAIN_ID` - Chain ID for the network

### FHEVMConfig

```typescript
interface FHEVMConfig {
  rpcUrl: string;
  chainId: number;
  mockChains?: Record<number, string>;
}
```

## Examples

See the examples directory for complete working examples:

- **Node.js Example**: `packages/node-example/` - Complete demos and wizard
- **Next.js Example**: `packages/nextjs-example/` - React app with three demos
- **Vue Example**: `packages/vue-example/` - Vue app with three demos

## Development

```bash
# Build the package
pnpm build

# Run tests
pnpm test

# Watch mode for development
pnpm watch
```

## License

BSD-3-Clause-Clear
