# Universal FHEVM SDK Examples

This document provides comprehensive examples and tutorials for using the Universal FHEVM SDK across different frameworks and use cases.

## 📚 Table of Contents

- [Framework Examples](#framework-examples)
- [Core Use Cases](#core-use-cases)
- [Cross-Framework Compatibility](#cross-framework-compatibility)
- [Advanced Patterns](#advanced-patterns)
- [Integration Guides](#integration-guides)
- [Troubleshooting](#troubleshooting)

## 🚀 Framework Examples

### Next.js Example (Required Showcase)

The Next.js example demonstrates a complete confidential dApp with multiple demos:

```bash
# Start the Next.js demo
pnpm dev
```

**Features:**
- **Counter Demo**: Encrypt, increment, and decrypt confidential counter values
- **Bank Demo**: Private banking operations (deposit, withdraw, transfer)
- **Voting Demo**: Democratic governance with private votes
- **SDK Status**: Real-time SDK health monitoring
- **Wallet Integration**: RainbowKit for wallet connection

**Key Components:**
```tsx
import { FHEVMProvider, useFHEVM, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

function App() {
  return (
    <FHEVMProvider config={{
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
      chainId: 11155111
    }}>
      <ConfidentialApp />
    </FHEVMProvider>
  );
}

function ConfidentialApp() {
  const { instance, isReady } = useFHEVM(config);
  const { encrypt } = useEncrypt(instance, options);
  const { decrypt } = useDecrypt(instance, options);
  
  // Your confidential dApp logic here
}
```

### Vue.js Example (Optional)

The Vue.js example shows the same functionality with Vue 3 Composition API:

```bash
# Start the Vue demo
pnpm vue:dev
```

**Features:**
- **Vue 3 Composition API**: Modern reactive patterns
- **Same Demos**: Counter, Bank, Voting
- **Pinia State Management**: Clean state handling
- **Tailwind CSS**: Modern styling

**Key Components:**
```vue
<script setup>
import { useFHEVM, useEncrypt, useDecrypt } from '@fhevm/sdk/vue'

const { instance, isReady } = useFHEVM(config)
const { encrypt } = useEncrypt(instance, options)
const { decrypt } = useDecrypt(instance, options)
</script>
```

### Node.js Example (Optional)

The Node.js example provides CLI tools and server utilities:

```bash
# Start the Node.js API
pnpm cli:start

# Or use CLI commands
pnpm fhevm-node counter increment --value 5
```

**Features:**
- **Universal CLI**: Command-line interface for all operations
- **API Server**: RESTful API for FHEVM operations
- **Batch Operations**: Efficient bulk processing
- **Production Ready**: Error handling and logging

**Key Components:**
```typescript
import { createFHEVMClientForNode, encryptValue, decryptValue } from '@fhevm/sdk/node'

const client = createFHEVMClientForNode(config)
await client.initialize()

const encrypted = await encryptValue(42, publicKey, config)
const decrypted = await decryptValue(encrypted, contractAddress, config)
```

## 🔄 Cross-Framework Compatibility

The Universal FHEVM SDK ensures data created in one framework can be used in another:

### **Same Data Types**
All frameworks use identical data structures:
```typescript
// Same across React, Vue, Node.js
interface FHEVMConfig {
  rpcUrl: string
  chainId: number
  mockChains?: Record<number, string>
}

interface EncryptionOptions {
  publicKey: string
  contractAddress: string
}
```

### **Same API Patterns**
Consistent patterns across all frameworks:
```typescript
// React
const { encrypt, decrypt } = useEncrypt(instance, options)

// Vue
const { encrypt, decrypt } = useEncrypt(instance, options)

// Node.js
const encrypted = await encryptValue(value, publicKey, config)
const decrypted = await decryptValue(handle, contractAddress, config)
```

### **Cross-Framework Data Flow**
```typescript
// Data encrypted in React can be decrypted in Vue
// Data encrypted in Node.js can be decrypted in React
// Data encrypted in Vue can be decrypted in Node.js

// Example: Counter value encrypted in React
const reactEncrypted = await encrypt(42, { publicKey, contractAddress })

// Same value decrypted in Vue
const vueDecrypted = await decrypt(reactEncrypted, { contractAddress })

// Same value decrypted in Node.js
const nodeDecrypted = await decryptValue(reactEncrypted, contractAddress, config)
```

### **Testing Cross-Framework Compatibility**
```bash
# Test all frameworks work together
pnpm test:cross-framework

# Individual framework tests
pnpm fhevm-node:test      # Node.js
pnpm next:build          # React
pnpm vue:build           # Vue
```

## 🎯 Core Use Cases

### **1. Counter Demo**
Confidential counter operations across all frameworks:

```typescript
// Encrypt a value
const encrypted = await encrypt(42, { publicKey, contractAddress })

// Increment the counter
const tx = await contract.increment(encrypted, inputProof)

// Decrypt the result
const result = await decrypt(encrypted, { contractAddress })
```

### **2. Bank Demo**
Private banking operations:

```typescript
// Deposit funds
const deposit = await encrypt(100, { publicKey, contractAddress })
await contract.deposit(deposit, inputProof)

// Withdraw funds
const withdraw = await encrypt(50, { publicKey, contractAddress })
await contract.withdraw(withdraw, inputProof)

// Check balance
const balance = await contract.getBalance(userAddress)
```

### **3. Voting Demo**
Democratic governance with private votes:

```typescript
// Create voting session
await contract.createSession("Election 2024", "Choose your leader")

// Cast encrypted vote
const vote = await encrypt(1, { publicKey, contractAddress }) // 1 = Yes
await contract.castVote(sessionId, vote, inputProof)

// Get encrypted results
const results = await contract.getEncryptedResults(sessionId)
const decrypted = await decrypt(results.yesVotes, { contractAddress })
```

## 🚀 Advanced Patterns

### **Batch Operations**
Process multiple values efficiently:

```typescript
// Batch encrypt
const values = [42, 100, 255]
const encrypted = await batchEncrypt(values, publicKey, config)

// Batch decrypt
const decrypted = await batchDecrypt(encrypted, contractAddress, config)
```

### **Error Handling**
Comprehensive error management:

```typescript
try {
  const encrypted = await encrypt(value, options)
} catch (error) {
  if (error instanceof FHEVMEncryptionError) {
    console.error('Encryption failed:', error.message)
  } else if (error instanceof FHEVMNotInitializedError) {
    console.error('SDK not initialized:', error.message)
  }
}
```

### **State Management**
Persistent state across sessions:

```typescript
// React
const { state, isReady, error } = useFHEVM(config)

// Vue
const { state, isReady, error } = useFHEVM(config)

// Node.js
const client = createFHEVMClientForNode(config)
const status = client.getStatus()
```

## 🔧 Integration Guides

### **React Integration**
```tsx
import { FHEVMProvider, useFHEVM } from '@fhevm/sdk/react'

function App() {
  return (
    <FHEVMProvider config={config}>
      <YourApp />
    </FHEVMProvider>
  )
}
```

### **Vue Integration**
```vue
<script setup>
import { useFHEVM } from '@fhevm/sdk/vue'

const { instance, isReady } = useFHEVM(config)
</script>
```

### **Node.js Integration**
```typescript
import { createFHEVMClientForNode } from '@fhevm/sdk/node'

const client = createFHEVMClientForNode(config)
await client.initialize()
```

## 🛠️ Troubleshooting

### **Common Issues**

**1. SDK Not Initialized**
```typescript
// Check if SDK is ready
if (!isReady) {
  console.log('SDK is not ready yet')
  return
}
```

**2. Contract Not Deployed**
```typescript
// Verify contract address
const contractAddress = '0x...'
if (!contractAddress) {
  throw new Error('Contract not deployed')
}
```

**3. Wallet Not Connected**
```typescript
// Check wallet connection
if (!address) {
  console.log('Please connect your wallet')
  return
}
```

### **Debug Mode**
Enable detailed logging:

```typescript
const config = {
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  chainId: 11155111,
  debug: true // Enable debug logging
}
```

### **Getting Help**
- **Documentation**: Check the README and examples
- **Issues**: Report bugs on GitHub
- **Community**: Join our Discord for support

## 🎉 Next Steps

1. **Try the examples**: Run `pnpm dev` to see the Next.js demo
2. **Explore the code**: Check out the source code in `packages/`
3. **Build your own**: Use the SDK to create confidential dApps
4. **Contribute**: Help improve the SDK with your feedback

The Universal FHEVM SDK makes building confidential dApps simple, consistent, and developer-friendly across any framework! 🚀

```bash
cd examples/vue-demo
pnpm install
pnpm dev
```

**Features:**
- **Wallet Integration**: MetaMask connection
- **Encryption Demo**: Encrypt user data
- **SDK Status**: Real-time status monitoring

**Key Implementation:**
```vue
<script setup>
import { UniversalFHEVMSDK } from '@fhevm-sdk/core';

const sdk = new UniversalFHEVMSDK();
await sdk.initialize({ provider });

const result = await sdk.encrypt({
  contractAddress: '0x...',
  userAddress: userAddress.value,
  data: counterValue.value,
  dataType: 'externalEuint32'
});
</script>
```

### Node.js Example

The Node.js example demonstrates server-side FHEVM operations:

```bash
cd examples/node-demo
pnpm install
pnpm start
```

**Features:**
- **Server-side Encryption**: Encrypt data on the server
- **Batch Operations**: Process multiple encrypted values
- **CLI Integration**: Command-line interface for FHEVM operations

**Key Implementation:**
```javascript
import { UniversalFHEVMSDK } from '@fhevm-sdk/core';

const sdk = new UniversalFHEVMSDK();
await sdk.initialize({ provider });

// Encrypt data
const encrypted = await sdk.encrypt({
  contractAddress: '0x...',
  userAddress: '0x...',
  data: 42,
  dataType: 'externalEuint32'
});

// Decrypt data
const decrypted = await sdk.decrypt(requests, signer);
```

## 🎯 Core Use Cases

### 1. Confidential Counter

A simple counter that keeps values encrypted on-chain:

```tsx
function ConfidentialCounter() {
  const { sdk, isReady } = useFHEVM();
  const { encrypt } = useFHEVMEncryption({ sdk, signer, contractAddress });
  const { callWithEncryptedParams } = useFHEVMContract({ sdk, signer, contractAddress, abi });

  const handleIncrement = async () => {
    // Encrypt the increment value
    const encrypted = await encrypt(1, 'externalEuint32');
    
    // Call contract with encrypted parameter
    await callWithEncryptedParams('increment', encrypted);
  };

  return (
    <button onClick={handleIncrement} disabled={!isReady}>
      Increment (Confidential)
    </button>
  );
}
```

### 2. Private Voting

A voting system where votes remain encrypted:

```tsx
function PrivateVoting() {
  const { encrypt } = useFHEVMEncryption({ sdk, signer, contractAddress });
  const { decrypt } = useFHEVMDecryption({ sdk, signer, chainId, requests });

  const handleVote = async (vote: boolean) => {
    // Encrypt the vote (true/false)
    const encryptedVote = await encrypt(vote, 'externalEbool');
    
    // Submit encrypted vote to contract
    await callWithEncryptedParams('vote', encryptedVote);
  };

  const handleTally = async () => {
    // Decrypt the results
    const results = await decrypt([{
      handle: '0x...',
      contractAddress: '0x...'
    }]);
    
    console.log('Vote results:', results);
  };

  return (
    <div>
      <button onClick={() => handleVote(true)}>Vote Yes</button>
      <button onClick={() => handleVote(false)}>Vote No</button>
      <button onClick={handleTally}>Tally Results</button>
    </div>
  );
}
```

### 3. Confidential Banking

A banking system with encrypted balances:

```tsx
function ConfidentialBank() {
  const { encrypt } = useFHEVMEncryption({ sdk, signer, contractAddress });
  const { callWithEncryptedParams } = useFHEVMContract({ sdk, signer, contractAddress, abi });

  const handleDeposit = async (amount: number) => {
    // Encrypt the deposit amount
    const encryptedAmount = await encrypt(amount, 'externalEuint64');
    
    // Deposit encrypted amount
    await callWithEncryptedParams('deposit', encryptedAmount);
  };

  const handleTransfer = async (amount: number, recipient: string) => {
    // Encrypt the transfer amount
    const encryptedAmount = await encrypt(amount, 'externalEuint64');
    
    // Transfer encrypted amount
    await callWithEncryptedParams('transfer', [encryptedAmount, recipient]);
  };

  return (
    <div>
      <input type="number" placeholder="Amount" />
      <button onClick={() => handleDeposit(amount)}>Deposit</button>
      <button onClick={() => handleTransfer(amount, recipient)}>Transfer</button>
    </div>
  );
}
```

## 🔧 Advanced Patterns

### 1. Batch Encryption

Encrypt multiple values at once:

```tsx
function BatchEncryption() {
  const { encrypt } = useFHEVMEncryption({ sdk, signer, contractAddress });

  const handleBatchEncrypt = async () => {
    const values = [42, 100, 255];
    const dataTypes = ['externalEuint32', 'externalEuint32', 'externalEuint8'];
    
    const encrypted = await Promise.all(
      values.map((value, index) => 
        encrypt(value, dataTypes[index])
      )
    );
    
    console.log('Batch encrypted:', encrypted);
  };

  return <button onClick={handleBatchEncrypt}>Batch Encrypt</button>;
}
```

### 2. Custom Storage Adapter

Use custom storage for decryption signatures:

```tsx
import { UniversalStorage } from '@fhevm-sdk/core';

const customStorage = new UniversalStorage({
  get: async (key) => localStorage.getItem(key),
  set: async (key, value) => localStorage.setItem(key, value),
  remove: async (key) => localStorage.removeItem(key)
});

function App() {
  return (
    <FHEVMProvider 
      provider={window.ethereum} 
      chainId={31337}
      storage={customStorage}
    >
      <MyApp />
    </FHEVMProvider>
  );
}
```

### 3. Error Handling

Comprehensive error handling:

```tsx
function RobustEncryption() {
  const { encrypt, error } = useFHEVMEncryption({ sdk, signer, contractAddress });

  const handleEncrypt = async () => {
    try {
      const result = await encrypt(42, 'externalEuint32');
      console.log('Encryption successful:', result);
    } catch (error) {
      if (error.code === 'ENCRYPTION_FAILED') {
        console.error('Encryption failed:', error.message);
      } else if (error.code === 'INVALID_DATA_TYPE') {
        console.error('Invalid data type:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  return (
    <div>
      <button onClick={handleEncrypt}>Encrypt</button>
      {error && <div className="error">{error.message}</div>}
    </div>
  );
}
```

## 🔗 Integration Guides

### 1. Wagmi Integration

Integrate with Wagmi for wallet management:

```tsx
import { useAccount, useWalletClient } from 'wagmi';
import { useFHEVM } from '@fhevm-sdk/react';

function WagmiIntegration() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const { sdk, isReady } = useFHEVM({
    provider: walletClient,
    chainId: 31337
  });

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <p>SDK Ready: {isReady ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 2. RainbowKit Integration

Use with RainbowKit for wallet connection:

```tsx
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { FHEVMProvider } from '@fhevm-sdk/react';

function App() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <FHEVMProvider provider={window.ethereum} chainId={31337}>
          <MyApp />
        </FHEVMProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
```

### 3. TypeScript Integration

Full TypeScript support:

```typescript
import { 
  UniversalFHEVMSDK, 
  EncryptResult, 
  DecryptRequest,
  FhevmDataType 
} from '@fhevm-sdk/core';

interface MyEncryptionOptions {
  data: number;
  dataType: FhevmDataType;
  contractAddress: `0x${string}`;
}

class MyConfidentialApp {
  private sdk: UniversalFHEVMSDK;

  constructor() {
    this.sdk = new UniversalFHEVMSDK();
  }

  async encryptData(options: MyEncryptionOptions): Promise<EncryptResult> {
    return await this.sdk.encrypt({
      contractAddress: options.contractAddress,
      userAddress: '0x...' as `0x${string}`,
      data: options.data,
      dataType: options.dataType
    });
  }

  async decryptData(requests: DecryptRequest[]): Promise<any> {
    return await this.sdk.decrypt(requests, signer);
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. SDK Not Initializing

**Problem**: SDK status remains "loading" or "error"

**Solutions**:
```tsx
// Check provider
const { sdk, status, error } = useFHEVM({
  provider: window.ethereum, // Make sure this exists
  chainId: 31337,
  enabled: true
});

// Debug status
console.log('SDK Status:', status);
console.log('SDK Error:', error);
```

#### 2. Encryption Failing

**Problem**: Encryption returns null or throws error

**Solutions**:
```tsx
// Check prerequisites
const { encrypt, error } = useFHEVMEncryption({
  sdk, // Must be ready
  signer, // Must be connected
  contractAddress: '0x...' // Must be valid
});

// Handle errors
if (error) {
  console.error('Encryption error:', error);
}
```

#### 3. Contract Calls Failing

**Problem**: Contract calls with encrypted parameters fail

**Solutions**:
```tsx
// Verify contract setup
const { callWithEncryptedParams, error } = useFHEVMContract({
  sdk,
  signer,
  contractAddress: '0x...',
  abi: contractABI // Must match deployed contract
});

// Check gas estimation
try {
  const gasEstimate = await estimateGasForEncrypted('functionName', encryptedParams);
  console.log('Gas estimate:', gasEstimate);
} catch (error) {
  console.error('Gas estimation failed:', error);
}
```

### Debug Mode

Enable debug mode for detailed logging:

```tsx
const { sdk } = useFHEVM({
  provider: window.ethereum,
  chainId: 31337,
  onStatusChange: (status) => console.log('Status changed:', status),
  onError: (error) => console.error('SDK error:', error)
});
```

### Performance Optimization

#### 1. Lazy Loading

Load SDK only when needed:

```tsx
const { sdk, isReady } = useFHEVM({
  provider: window.ethereum,
  chainId: 31337,
  enabled: isWalletConnected // Only initialize when wallet is connected
});
```

#### 2. Memoization

Memoize expensive operations:

```tsx
const encryptedData = useMemo(() => {
  if (!data || !sdk) return null;
  return encrypt(data, 'externalEuint32');
}, [data, sdk, encrypt]);
```

## 📖 Additional Resources

- [Getting Started Guide](./getting-started.md)
- [Architecture Documentation](./architecture.md)
- [API Reference](./api-reference.md)

## 🤝 Contributing

Found an issue or want to add an example? We'd love your help!

1. Fork the repository
2. Create your feature branch
3. Add your example
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
