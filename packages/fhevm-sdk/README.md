# @fhevm/sdk

FHEVM SDK - The complete toolkit for building confidential dApps with fully homomorphic encryption on Ethereum.

## 🚀 Features

- **🔐 Universal SDK** - Works in React, Vue, Node.js, and vanilla JavaScript
- **🎯 Wagmi-like API** - Intuitive, modular interface familiar to Web3 developers
- **🔑 EIP-712 Signing** - Secure user decryption with wallet signatures
- **🌐 Multi-Environment** - Next.js, Vue, and Node.js examples included
- **📦 Zero Config** - Works out of the box with sensible defaults
- **🛠️ CLI Tools** - Command-line interface for quick development
- **📚 TypeScript First** - Full type safety and IntelliSense support
- **🔄 Cross-Framework** - Data encrypted in one framework works in another
- **🧙‍♂️ Interactive Wizard** - Guided demo experience for all operations
- **🎭 Mock Mode** - Local development without real blockchain
- **📊 Batch Operations** - Efficient batch encryption and decryption

## 📦 Installation

```bash
# Install the complete FHEVM SDK
pnpm install @fhevm/sdk

# Or install specific frameworks
pnpm install @fhevm/sdk/react    # React only
pnpm install @fhevm/sdk/vue      # Vue only
pnpm install @fhevm/sdk/node     # Node.js only
```

## 🎯 Quick Start

```typescript
import { createFHEVMClient } from '@fhevm/sdk'

// Create client
const client = createFHEVMClient({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY',
  chainId: 11155111
})

// Initialize
await client.initialize()

// Encrypt
const encrypted = await client.encrypt(42, { publicKey: '0x...' })

// Decrypt
const decrypted = await client.decrypt({
  handle: encrypted,
  contractAddress: '0x...',
  usePublicDecrypt: true
})
```

## 📚 API Reference

### `createFHEVMClient(config, events?)`

Creates a new FHEVM client instance.

**Parameters:**
- `config`: FHEVMConfig - Client configuration
- `events?`: FHEVMEvents - Optional event handlers

**Returns:** FHEVMClient

### `FHEVMClient`

The main client class for FHEVM operations.

#### Methods

- `initialize()`: Promise<void> - Initialize the client
- `encrypt(value, options)`: Promise<string> - Encrypt a value
- `decrypt(options)`: Promise<number> - Decrypt a value
- `getState()`: FHEVMState - Get current client state
- `getInstance()`: FhevmInstance | null - Get the FHEVM instance
- `isReady()`: boolean - Check if client is ready
- `getStatus()`: FHEVMStatus - Get current status
- `getError()`: Error | null - Get current error
- `refresh()`: Promise<void> - Refresh/reinitialize
- `destroy()`: void - Cleanup resources

## 🔧 Configuration

### FHEVMConfig

```typescript
interface FHEVMConfig {
  rpcUrl: string;                    // RPC URL for the network
  chainId: number;                   // Chain ID
  mockChains?: Record<number, string>; // Mock chains for local dev
  storage?: FHEVMStorage;            // Custom storage implementation
  signal?: AbortSignal;              // Abort signal for cancellation
}
```

### Storage Options

```typescript
// Default (IndexedDB)
const client = createFHEVMClient(config)

// In-memory storage
import { createInMemoryStorage } from '@fhevm/sdk'
const client = createFHEVMClient({
  ...config,
  storage: createInMemoryStorage()
})

// localStorage
import { createLocalStorage } from '@fhevm/sdk'
const client = createFHEVMClient({
  ...config,
  storage: createLocalStorage()
})
```

## 🎨 Event Handling

```typescript
const client = createFHEVMClient(config, {
  onStatusChange: (status) => {
    console.log('Status:', status)
  },
  onError: (error) => {
    console.error('Error:', error)
  },
  onReady: (instance) => {
    console.log('Ready!')
  }
})
```

## 🔐 Encryption & Decryption

### Encryption

```typescript
const encrypted = await client.encrypt(42, {
  publicKey: '0x...',
  contractAddress: '0x...', // Optional
  params: { /* additional params */ }
})
```

### Decryption

```typescript
// Public decryption (no signature required)
const decrypted = await client.decrypt({
  handle: encrypted,
  contractAddress: '0x...',
  usePublicDecrypt: true
})

// User decryption (requires signature)
const decrypted = await client.decrypt({
  handle: encrypted,
  contractAddress: '0x...',
  signature: '0x...'
})
```

## 🛠️ Error Handling

```typescript
import { 
  FHEVMError, 
  FHEVMNotInitializedError,
  FHEVMEncryptionError,
  FHEVMDecryptionError 
} from '@fhevm/sdk'

try {
  await client.encrypt(42, { publicKey: '0x...' })
} catch (error) {
  if (error instanceof FHEVMEncryptionError) {
    console.error('Encryption failed:', error.message)
  }
}
```

## 🌐 Framework Integration

This core package is designed to work with framework-specific adapters:

- **React**: `@fhevm/sdk/react` - Hooks and components
- **Vue**: `@fhevm/sdk/vue` - Composables and utilities  
- **Node.js**: `@fhevm/sdk/node` - Server-side utilities

## 📖 Examples

See the examples directory for complete usage examples:

- **Next.js Example**: `packages/nextjs-example/` - React app with three demos
- **Vue Example**: `packages/vue-example/` - Vue app with three demos  
- **Node.js Example**: `packages/node-example/` - Node.js demos and wizard

## 🤝 Contributing

This package is part of the FHEVM SDK. See the main repository for contribution guidelines.

## 📄 License

BSD-3-Clause-Clear License
