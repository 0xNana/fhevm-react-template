# Getting Started with Universal FHEVM SDK

This guide will help you get up and running with Universal FHEVM SDK in just a few minutes.

## Prerequisites

- Node.js 20+ 
- pnpm (recommended) or npm
- Basic knowledge of React/JavaScript/Vue
- Understanding of blockchain concepts

## 🚀 Quick Start (2 minutes)

### Option 1: Using the Template (Recommended)

The easiest way to get started is using our complete template:

```bash
# Clone the repository
git clone https://github.com/0xNana/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
pnpm install

# Quick setup (configures everything)
pnpm quickstart

# Start the Next.js demo (Required)
pnpm dev

# Or start other examples
pnpm vue:dev      # Vue demo
pnpm cli:start    # Node.js API
```

### Option 2: Using the Universal CLI

For quick development and testing:

```bash
# Use the Universal FHEVM CLI
pnpm fhevm-node:init

# Test the setup
pnpm fhevm-node:test

# Use CLI commands
pnpm fhevm-node counter increment --value 5
pnpm fhevm-node bank deposit --amount 100
```

### Option 3: Manual Installation

If you prefer to set up your project manually:

```bash
# Create a new project
mkdir my-confidential-app
cd my-confidential-app

# Initialize package.json
pnpm init

# Install Universal FHEVM SDK packages
pnpm install @fhevm/sdk ethers

# Install development dependencies
pnpm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react
```

## Quick Start Example

Here's a minimal example to get you started:

### 1. Basic Setup

```tsx
// src/App.tsx
import React from 'react';
import { FHEVMProvider, useFHEVM, useFHEVMEncryption } from '@fhevm-sdk/react';
import { ethers } from 'ethers';

function App() {
  // In a real app, you'd get this from a wallet connection
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const chainId = 31337; // Local development chain

  return (
    <FHEVMProvider provider={provider} chainId={chainId}>
      <ConfidentialCounter />
    </FHEVMProvider>
  );
}

function ConfidentialCounter() {
  const { sdk, isReady } = useFHEVM();
  const [count, setCount] = React.useState(0);
  const [encryptedCount, setEncryptedCount] = React.useState(null);

  // Mock signer - in real app, get from wallet
  const signer = React.useMemo(() => {
    if (!sdk) return undefined;
    // This would be your wallet signer
    return new ethers.Wallet('0x...', sdk.getInstance()?.getProvider());
  }, [sdk]);

  const { encrypt } = useFHEVMEncryption({
    sdk,
    signer,
    contractAddress: '0xelegant3456789012345678901234567890' // Your contract address
  });

  const handleEncrypt = async () => {
    if (!encrypt) return;
    
    try {
      const result = await encrypt(count, 'externalEuint32');
      setEncryptedCount(result);
      console.log('Encrypted count:', result);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  if (!isReady) {
    return <div>Initializing Universal FHEVM SDK...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Confidential Counter</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Count: </label>
        <input 
          type="number" 
          value={count} 
          onChange={(e) => setCount(parseInt(e.target.value) || 0)}
          style={{ margin: '0 10px', padding: '5px' }}
        />
        <button onClick={handleEncrypt} style={{ padding: '5px 10px' }}>
          Encrypt Count
        </button>
      </div>

      {encryptedCount && (
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>Encrypted Data:</strong><br/>
          Handles: {encryptedCount.handles.length} items<br/>
          Input Proof: {encryptedCount.inputProof.length} bytes
        </div>
      )}
    </div>
  );
}

export default App;
```

### 2. Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3. Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['ethers']
  }
});
```

## Understanding the Basics

### 1. FHEVMProvider

The `FHEVMProvider` component initializes the SDK and provides context to your app:

```tsx
<FHEVMProvider 
  provider={provider}     // RPC provider or EIP-1193 provider
  chainId={chainId}       // Chain ID for the network
  // Chain ID is automatically resolved from the provider
>
  <YourApp />
</FHEVMProvider>
```

### 2. Core Hooks

- `useFHEVM()` - Access the SDK instance and status
- `useFHEVMEncryption()` - Encrypt data for smart contracts
- `useFHEVMDecryption()` - Decrypt encrypted data
- `useFHEVMContract()` - Interact with smart contracts

### 3. Data Types

Universal FHEVM SDK supports these FHEVM data types:

```typescript
type FhevmDataType = 
  | "externalEbool"      // Encrypted boolean
  | "externalEuint8"     // Encrypted 8-bit integer
  | "externalEuint16"    // Encrypted 16-bit integer
  | "externalEuint32"    // Encrypted 32-bit integer
  | "externalEuint64"    // Encrypted 64-bit integer
  | "externalEuint128"   // Encrypted 128-bit integer
  | "externalEuint256"   // Encrypted 256-bit integer
  | "externalEaddress";  // Encrypted address
```

## Next Steps

### 1. Connect a Real Wallet

Replace the mock provider with a real wallet connection:

```tsx
import { useAccount, useConnect } from 'wagmi';

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  if (!isConnected) {
    return (
      <div>
        <h1>Connect Your Wallet</h1>
        {connectors.map((connector) => (
          <button key={connector.id} onClick={() => connect({ connector })}>
            Connect {connector.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <FHEVMProvider provider={provider} chainId={chainId}>
      <ConfidentialApp />
    </FHEVMProvider>
  );
}
```

### 2. Deploy a Smart Contract

Use the CLI to deploy your first contract:

```bash
# Create a simple contract
echo 'contract Counter {
    function increment(uint32 encryptedValue) public returns (uint32) {
        return encryptedValue + 1;
    }
}' > contracts/Counter.sol

# Deploy to localhost
fhevm deploy --network localhost
```

### 3. Interact with Your Contract

```tsx
import { useFHEVMContract } from '@fhevm-sdk/react';

function ContractInteraction() {
  const { callWithEncryptedParams } = useFHEVMContract({
    sdk,
    signer,
    contractAddress: '0x...',
    abi: [/* your contract ABI */]
  });

  const handleIncrement = async () => {
    const encryptedResult = await encrypt(1, 'externalEuint32');
    const result = await callWithEncryptedParams('increment', encryptedResult);
    console.log('Contract result:', result);
  };

  return <button onClick={handleIncrement}>Increment</button>;
}
```

## Common Patterns

### 1. Error Handling

```tsx
function MyComponent() {
  const { encrypt, error } = useFHEVMEncryption({...});

  const handleEncrypt = async () => {
    try {
      const result = await encrypt(data, dataType);
      // Handle success
    } catch (err) {
      console.error('Encryption failed:', err);
      // Handle error
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <button onClick={handleEncrypt}>Encrypt</button>;
}
```

### 2. Loading States

```tsx
function MyComponent() {
  const { sdk, isReady } = useFHEVM();
  const { encrypt, isEncrypting } = useFHEVMEncryption({...});

  if (!isReady) {
    return <div>Initializing...</div>;
  }

  return (
    <button disabled={isEncrypting} onClick={handleEncrypt}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt'}
    </button>
  );
}
```

### 3. Multiple Data Types

```tsx
function MultiEncrypt() {
  const { encryptMultiple } = useFHEVMEncryption({...});

  const handleEncryptMultiple = async () => {
    const result = await encryptMultiple([
      { data: true, dataType: 'externalEbool' },
      { data: 42, dataType: 'externalEuint32' },
      { data: '0x1234...', dataType: 'externalEaddress' }
    ]);
    console.log('Multiple encrypted:', result);
  };

  return <button onClick={handleEncryptMultiple}>Encrypt Multiple</button>;
}
```

## Troubleshooting

### Common Issues

1. **"SDK not initialized"**
   - Make sure you're using `FHEVMProvider`
   - Check that your provider is valid
   - Ensure the network is supported

2. **"Encryption not ready"**
   - Verify your signer is connected
   - Check that the contract address is valid
   - Ensure the SDK is ready (`isReady === true`)

3. **"Invalid data type"**
   - Make sure you're using a supported FHEVM data type
   - Check that your data matches the expected type

### Getting Help

- Check the [API Documentation](./api-reference.md)
- Look at [Examples](./examples.md)
- Join our [Discord](https://discord.gg/cloak-sdk)
- Open an [Issue](https://github.com/your-org/cloak-sdk/issues)

## What's Next?

Now that you have the basics down, explore:

- [Advanced Usage](./advanced-usage.md)
- [Smart Contract Integration](./smart-contracts.md)
- [Performance Optimization](./performance.md)
- [Deployment Guide](./deployment.md)
