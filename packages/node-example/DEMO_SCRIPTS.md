# FHEVM Real Blockchain Demo Scripts

This directory contains demonstration scripts that showcase **real FHEVM operations** on live blockchains, proving that FHEVM works in Node.js environments beyond just browser/mockchains.

## 🚀 Available Demo Scripts

Located in the `src/server-side/` directory:

### 1. Counter Demo (`src/server-side/counter.js`)
Demonstrates real FHEVM counter operations:
- Creates FHEVM instance with mnemonic
- Connects to real counter contract
- Performs encrypted increment/decrement operations
- Decrypts results using EIP-712 signatures

### 2. Bank Demo (`src/server-side/bank.js`)
Demonstrates real FHEVM bank operations:
- Creates FHEVM instance with mnemonic
- Connects to real bank contract
- Performs encrypted deposit/withdraw/transfer operations
- Decrypts balances using EIP-712 signatures

### 3. Voting Demo (`src/server-side/voting.js`)
Demonstrates real FHEVM voting operations:
- Creates FHEVM instance with mnemonic
- Connects to real voting contract
- Performs encrypted vote casting operations
- Decrypts results using EIP-712 signatures

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   The `.env` file is already configured with:
   ```env
   MNEMONIC="match bullet rude alone winter wave hunt shrimp room cube shell purpose"
   RPC_URL="https://sepolia.infura.io/v3/8800e5d43f644529846d90ee5c29adcf"
   CHAIN_ID="11155111"
   COUNTER_CONTRACT_ADDRESS="0xaD920A4E9ACD84aA5F094e128b0d811eDB12F57F"
   BANK_CONTRACT_ADDRESS="0xA020287B1670453919C2f49e2e8c2C09B96101B8"
   VOTING_CONTRACT_ADDRESS="0x8eAf5350f6E26051f7902109BD3a8709abB6Fb14"
   RECIPIENT_ADDRESS="0x..." # For bank transfer demo (optional)
   ```

3. **Run demos:**
   ```bash
   # Individual demos
   pnpm demo:counter
   pnpm demo:bank
   pnpm demo:voting
   
   # Run all demos
   pnpm demo:all
   
   # From root directory
   pnpm demo:counter
   pnpm demo:bank
   pnpm demo:voting
   pnpm demo:all
   ```

## 🎯 What These Scripts Prove

### ✅ Real FHEVM Functionality
- **Encrypted Operations**: Creating encrypted inputs for contract interactions
- **Blockchain Transactions**: Real transactions sent and confirmed on-chain
- **EIP-712 Decryption**: Proper decryption using user signatures
- **Complete Workflows**: Full confidential computing cycles

### ✅ Node.js Environment Success
- **No Mockchains**: Running against real blockchains
- **Real Contract Addresses**: Actual deployed contracts
- **Real Transactions**: Actual transaction hashes and confirmations
- **Real Decryption**: EIP-712 signature-based decryption

### ✅ Universal FHEVM SDK Validation
- **Framework Agnostic**: Works in Node.js (not just browser)
- **Real Environment**: Actual blockchain, not mockchains
- **Complete SDK**: All FHEVM operations working
- **Production Ready**: Real transactions and confirmations
- **Developer Friendly**: Clear, detailed output with success indicators

## 📊 Expected Output

Each demo script will show:
- ✅ FHEVM instance creation
- ✅ Contract connection
- ✅ Encrypted operation creation
- ✅ Transaction sending and confirmation
- ✅ Result decryption
- ✅ Complete workflow verification

## 🔧 Troubleshooting

1. **Missing MNEMONIC**: Ensure you have a valid mnemonic in `.env`
2. **Contract Addresses**: Update contract addresses in `.env` for your network
3. **RPC Issues**: Check RPC_URL is accessible and correct
4. **Insufficient Funds**: Ensure wallet has enough tokens for gas fees

## 🎉 Success Indicators

When working correctly, you'll see:
- ✅ Real transaction hashes
- ✅ Transaction confirmations
- ✅ Decrypted results
- ✅ Complete workflow verification
- ✅ "Node.js environment fully functional" message

These scripts **prove that FHEVM works in real Node.js environments** and demonstrate the **universal FHEVM SDK** capabilities beyond browser/mockchains!
