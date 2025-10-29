# Contract Integration Guide

This guide provides comprehensive information about integrating FHEVM smart contracts with the Universal FHEVM SDK.

## 📋 Table of Contents

- [Contract ABIs Overview](#contract-abis-overview)
- [Data Type Mapping](#data-type-mapping)
- [Function Signatures](#function-signatures)
- [Integration Patterns](#integration-patterns)
- [Common Issues & Solutions](#common-issues--solutions)
- [Best Practices](#best-practices)

## 🔍 Contract ABIs Overview

The Universal FHEVM SDK includes three main contract examples:

### 1. FHECounter Contract
**Purpose**: Simple encrypted counter operations
**Data Types**: `externalEuint32`
**Key Functions**:
- `increment(externalEuint32, bytes)` - Increment counter by encrypted value
- `decrement(externalEuint32, bytes)` - Decrement counter by encrypted value
- `getCount()` - Get current encrypted counter value

### 2. FHEVoting Contract
**Purpose**: Confidential voting system
**Data Types**: `externalEbool`
**Key Functions**:
- `castVote(uint256, externalEbool, bytes)` - Cast encrypted vote
- `createVotingSession(string, string, uint256)` - Create new voting session
- `getEncryptedResults(uint256)` - Get encrypted voting results

### 3. FHEBank Contract
**Purpose**: Confidential banking operations
**Data Types**: `externalEuint64`
**Key Functions**:
- `deposit(externalEuint64, bytes)` - Deposit encrypted amount
- `withdraw(externalEuint64, bytes)` - Withdraw encrypted amount
- `transfer(address, externalEuint64, bytes)` - Transfer encrypted amount

## 🎯 Data Type Mapping

| Solidity Type | FHEVM Type | JavaScript Type | Use Case |
|---------------|------------|-----------------|----------|
| `externalEbool` | `externalEbool` | `boolean` | Voting, boolean flags |
| `externalEuint8` | `externalEuint8` | `number` | Small counters, flags |
| `externalEuint16` | `externalEuint16` | `number` | Medium counters |
| `externalEuint32` | `externalEuint32` | `number` | Standard counters |
| `externalEuint64` | `externalEuint64` | `bigint` | Large amounts, balances |
| `externalEuint128` | `externalEuint128` | `bigint` | Very large amounts |
| `externalEuint256` | `externalEuint256` | `bigint` | Maximum precision amounts |
| `externalEaddress` | `externalEaddress` | `string` | Encrypted addresses |

## 🔧 Function Signatures

### Counter Contract Functions

```typescript
// Increment counter
await callWithEncryptedParams('increment', encryptedValue);

// Decrement counter  
await callWithEncryptedParams('decrement', encryptedValue);

// Get current count (returns encrypted value)
const encryptedCount = await contract.getCount();
```

### Voting Contract Functions

```typescript
// Cast vote (sessionId, encryptedVote)
await callWithMixedParams('castVote', [sessionId, encryptedVote]);

// Create voting session
await callWithRegularParams('createVotingSession', [
  'Proposal Title',
  'Proposal Description', 
  86400 // Duration in seconds
]);

// Get encrypted results
const results = await contract.getEncryptedResults(sessionId);
```

### Bank Contract Functions

```typescript
// Deposit encrypted amount
await callWithEncryptedParams('deposit', encryptedAmount);

// Withdraw encrypted amount
await callWithEncryptedParams('withdraw', encryptedAmount);

// Transfer to another address
await callWithMixedParams('transfer', [recipientAddress, encryptedAmount]);

// Get encrypted balance
const encryptedBalance = await contract.getEncryptedBalance(userAddress);
```

## 🚀 Integration Patterns

### 1. Simple Encrypted Parameters

For functions that only take encrypted parameters:

```typescript
// Encrypt the data
const encrypted = await encrypt(value, 'externalEuint32');

// Call contract function
const result = await callWithEncryptedParams('increment', encrypted);
```

### 2. Mixed Parameters (Encrypted + Regular)

For functions that take both encrypted and regular parameters:

```typescript
// Encrypt the data
const encrypted = await encrypt(vote, 'externalEbool');

// Call contract function with mixed parameters
const result = await callWithMixedParams('castVote', [sessionId, encrypted]);
```

### 3. Regular Parameters Only

For functions that don't use encryption:

```typescript
// Call contract function with regular parameters
const result = await callWithRegularParams('createVotingSession', [
  'Title',
  'Description',
  86400
]);
```

## ⚠️ Common Issues & Solutions

### Issue 1: Wrong Data Type
**Problem**: Using `externalEuint256` instead of `externalEuint64` for bank operations
```typescript
// ❌ Wrong
const encrypted = await encrypt(amount, 'externalEuint256');

// ✅ Correct
const encrypted = await encrypt(amount, 'externalEuint64');
```

### Issue 2: Incorrect Parameter Structure
**Problem**: Passing handles and inputProof separately
```typescript
// ❌ Wrong
await callWithEncryptedParams('increment', {
  handles: encrypted.handles,
  inputProof: encrypted.inputProof
});

// ✅ Correct
await callWithEncryptedParams('increment', encrypted);
```

### Issue 3: Missing Regular Parameters
**Problem**: Not passing required regular parameters
```typescript
// ❌ Wrong - Missing sessionId
await callWithEncryptedParams('castVote', encryptedVote);

// ✅ Correct - Include sessionId
await callWithMixedParams('castVote', [sessionId, encryptedVote]);
```

### Issue 4: Contract Address Validation
**Problem**: Using invalid contract addresses
```typescript
// ❌ Wrong
const contractAddress = 'invalid-address';

// ✅ Correct
const contractAddress = '0x6dd89f22f09B3Ce06c6A743C8088A98b0DF522a2';
```

## 🎯 Best Practices

### 1. Data Type Selection
- Use `externalEuint32` for counters and small values
- Use `externalEuint64` for financial amounts and balances
- Use `externalEbool` for voting and boolean operations
- Use `externalEuint256` only for maximum precision requirements

### 2. Error Handling
```typescript
try {
  const encrypted = await encrypt(value, 'externalEuint32');
  const result = await callWithEncryptedParams('increment', encrypted);
  console.log('Success:', result);
} catch (error) {
  console.error('Contract call failed:', error);
  // Handle error appropriately
}
```

### 3. Gas Estimation
```typescript
// Estimate gas before calling
const gasEstimate = await estimateGasForEncrypted('increment', encrypted);
console.log('Estimated gas:', gasEstimate);

// Call with gas limit
const result = await callWithEncryptedParams('increment', encrypted, {
  gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
});
```

### 4. Transaction Confirmation
```typescript
const result = await callWithEncryptedParams('increment', encrypted);
console.log('Transaction hash:', result.hash);

// Wait for confirmation
const receipt = await result.wait();
console.log('Confirmed in block:', receipt.blockNumber);
```

### 5. Batch Operations
```typescript
// Encrypt multiple values
const encryptedValues = await Promise.all([
  encrypt(value1, 'externalEuint32'),
  encrypt(value2, 'externalEuint32'),
  encrypt(value3, 'externalEuint32')
]);

// Call multiple functions
const results = await Promise.all([
  callWithEncryptedParams('increment', encryptedValues[0]),
  callWithEncryptedParams('increment', encryptedValues[1]),
  callWithEncryptedParams('increment', encryptedValues[2])
]);
```

## 🔍 Contract Addresses

### Local Development (Hardhat)
```typescript
export const CONTRACT_ADDRESSES = {
  FHECounter: '0x6dd89f22f09B3Ce06c6A743C8088A98b0DF522a2',
  FHEVoting: '0x686B8f74662749d82359B8170a84717d92Caa9cc',
  FHEBank: '0xba0A99f5227d95cc785cbED6ec7e793316afD759',
};
```

### Sepolia Testnet
```typescript
export const CONTRACT_ADDRESSES = {
  FHECounter: process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ADDRESS,
  FHEVoting: process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
  FHEBank: process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS,
};
```

## 📚 Additional Resources

- [Getting Started Guide](./getting-started.md)
- [Examples Documentation](./examples.md)
- [Architecture Overview](./architecture.md)
- [API Reference](./api-reference.md)

## 🤝 Contributing

Found an issue or want to add a contract example? We'd love your help!

1. Fork the repository
2. Create your feature branch
3. Add your contract integration
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
