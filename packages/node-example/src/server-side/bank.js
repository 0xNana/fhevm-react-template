#!/usr/bin/env node

/**
 * FHEVM Bank Demo - Real Blockchain Operations
 * 
 * This script demonstrates real FHEVM bank operations on a live blockchain:
 * - Creates FHEVM instance with mnemonic
 * - Connects to real bank contract
 * - Performs encrypted deposit/withdraw/transfer operations
 * - Decrypts balances using EIP-712 signatures
 */

import { ethers } from 'ethers'
import { createFHEVMClientForNode } from '@fhevm/sdk/node'
import { FhevmDecryptionSignature } from '@fhevm/sdk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Contract ABI for FHEBank (matching actual contract interface)
const BANK_ABI = [
  "function deposit(bytes32 amount, bytes calldata inputProof) public",
  "function withdraw(bytes32 amount, bytes calldata inputProof) public", 
  "function transfer(address to, bytes32 amount, bytes calldata inputProof) public",
  "function getEncryptedBalance(address account) public view returns (bytes32)",
  "function getEncryptedTotalSupply() public view returns (bytes32)"
]

// Configuration
const CONFIG = {
  rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  privateKey: process.env.PRIVATE_KEY || '0x' + '0'.repeat(64),
  contractAddress: process.env.BANK_CONTRACT_ADDRESS || '0xA020287B1670453919C2f49e2e8c2C09B96101B8',
  recipientAddress: process.env.RECIPIENT_ADDRESS || '0x52F016116508986c6ef2419266075cD7C4C01434',
  chainId: 11155111 
}

async function main() {
  console.log('🏦 FHEVM Bank Demo - Real Blockchain Operations')
  console.log('=' .repeat(60))
  
  try {
    // Validate configuration
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0x' + '0'.repeat(64)) {
      throw new Error('Please set PRIVATE_KEY in your .env file')
    }
    
    if (!process.env.BANK_CONTRACT_ADDRESS || process.env.BANK_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('Please set BANK_CONTRACT_ADDRESS in your .env file')
    }
    
    // Setup wallet and contract
    console.log('\n📄 Setting up wallet and contract...')
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
    const signer = new ethers.Wallet(CONFIG.privateKey, provider)
    const contract = new ethers.Contract(CONFIG.contractAddress, BANK_ABI, signer)
    
    console.log('✅ Wallet created:', await signer.getAddress())
    console.log('✅ Bank contract connected:', CONFIG.contractAddress)
    
    // Create FHEVM client using enhanced SDK
    console.log('\n🔐 Creating FHEVM client using enhanced SDK...')
    const fhevmConfig = {
      rpcUrl: CONFIG.rpcUrl,
      chainId: CONFIG.chainId
    }
    
    const fhevmClient = await createFHEVMClientForNode(fhevmConfig)
    console.log('✅ FHEVM client created and ready!')
    console.log('🔍 Client type:', fhevmClient.constructor.name)
    
    // Step 1: Get initial balance (might be from previous runs)
    console.log('\n💰 Step 1: Reading initial encrypted balance...')
    const userAddress = await signer.getAddress()
    const initialBalanceHandle = await contract.getEncryptedBalance(userAddress)
    console.log('✅ Initial encrypted balance handle:', initialBalanceHandle)
    console.log('ℹ️  Note: This handle might be from previous runs and may not be decryptable by current user')
    
    // Step 2: Deposit 6969 tokens
    console.log('\n💳 Step 2: Depositing 6969 tokens...')
    const depositAmount = 6969
    
    // Create encrypted input for deposit using FHEVM pattern (64-bit for FHEBank)
    const input = fhevmClient.getInstance().createEncryptedInput(CONFIG.contractAddress, userAddress)
    input.add64(depositAmount) // Bank uses 64-bit
    const depositEncryptedResult = await input.encrypt()
    
    if (!depositEncryptedResult || !depositEncryptedResult.handles || !depositEncryptedResult.handles[0]) {
      throw new Error("Deposit encryption failed - no handle returned")
    }
    
    if (!depositEncryptedResult.inputProof) {
      throw new Error("Deposit encryption failed - no inputProof returned")
    }
    
    // Convert to hex strings like Vue/Next.js examples
    const toHex = (data) => {
      return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
    }
    
    const depositExternalEuint64 = toHex(depositEncryptedResult.handles[0])
    const depositInputProof = toHex(depositEncryptedResult.inputProof)
    
    console.log('✅ Encrypted deposit input created successfully')
    
    
    console.log('\n📝 Executing deposit transaction...')
    
    const depositTx = await contract.deposit(
      depositExternalEuint64, 
      depositInputProof,      
      {
        gasLimit: 2000000 
      }
    )
    console.log('✅ Deposit transaction sent:', depositTx.hash)
    const depositReceipt = await depositTx.wait()
    console.log('✅ Deposit transaction confirmed:', depositReceipt?.hash)
    
    // Wait for state update
    console.log('\n⏳ Waiting for state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('✅ State update wait completed, continuing to balance check...')
    
    // Step 3: Get balance after deposit and decrypt
    console.log('\n💰 Step 3: Reading balance after deposit...')
    const balanceAfterDeposit = await contract.getEncryptedBalance(userAddress)
    console.log('✅ Balance handle after deposit:', balanceAfterDeposit)
    
    // Generate EIP-712 signature for decryption
    console.log('\n🔓 Step 4: Decrypting balance with EIP-712 signature...')
    const decryptionSignatureStorage = new Map()
    const contractAddresses = [CONFIG.contractAddress]
    
    const decryptionSignature = await FhevmDecryptionSignature.loadOrSign(
      fhevmClient.getInstance(),
      contractAddresses,
      signer,
      decryptionSignatureStorage
    )
    
    console.log('✅ EIP-712 signature created successfully')
    
    // Decrypt balance after deposit using SDK
    console.log('🔓 Attempting to decrypt balance after deposit...')
    const balanceAfterDepositDecrypted = await fhevmClient.decrypt({
      handle: balanceAfterDeposit,
      contractAddress: CONFIG.contractAddress,
      signature: decryptionSignature
    })
    console.log('✅ Balance decryption completed')
    
    // SDK returns a number directly
    const depositDecryptedValue = Number(balanceAfterDepositDecrypted)
    
    console.log('✅ Balance after deposit:', depositDecryptedValue)
    
    // Step 5: Transfer 69 tokens
    console.log('\n🔄 Step 5: Transferring 69 tokens...')
    const transferAmount = 69
    
    // Create encrypted input for transfer using FHEVM pattern (64-bit for FHEBank)
    const transferInput = fhevmClient.getInstance().createEncryptedInput(CONFIG.contractAddress, userAddress)
    transferInput.add64(transferAmount) // Bank uses 64-bit
    const transferEncryptedResult = await transferInput.encrypt()
    
    if (!transferEncryptedResult || !transferEncryptedResult.handles || !transferEncryptedResult.handles[0]) {
      throw new Error("Transfer encryption failed - no handle returned")
    }
    
    if (!transferEncryptedResult.inputProof) {
      throw new Error("Transfer encryption failed - no inputProof returned")
    }
    
    const transferExternalEuint64 = toHex(transferEncryptedResult.handles[0])
    const transferInputProof = toHex(transferEncryptedResult.inputProof)
    
    console.log('✅ Encrypted transfer input created successfully')
    
    // Execute transfer transaction
    console.log('\n📝 Executing transfer transaction...')
    const transferTx = await contract.transfer(
      CONFIG.recipientAddress, 
      transferExternalEuint64, // externalEuint64 as hex string
      transferInputProof,      // inputProof as separate parameter
      {
        gasLimit: 2000000 // Increased gas limit for FHEVM operations
      }
    )
    console.log('✅ Transfer transaction sent:', transferTx.hash)
    const transferReceipt = await transferTx.wait()
    console.log('✅ Transfer transaction confirmed:', transferReceipt?.hash)
    
    // Wait for state update
    console.log('\n⏳ Waiting for state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 6: Withdraw 69 tokens
    console.log('\n💸 Step 6: Withdrawing 69 tokens...')
    const withdrawAmount = 69
    
    // Create encrypted input for withdraw using FHEVM pattern (64-bit for FHEBank)
    const withdrawInput = fhevmClient.getInstance().createEncryptedInput(CONFIG.contractAddress, userAddress)
    withdrawInput.add64(withdrawAmount) // Bank uses 64-bit
    const withdrawEncryptedResult = await withdrawInput.encrypt()
    
    if (!withdrawEncryptedResult || !withdrawEncryptedResult.handles || !withdrawEncryptedResult.handles[0]) {
      throw new Error("Withdraw encryption failed - no handle returned")
    }
    
    if (!withdrawEncryptedResult.inputProof) {
      throw new Error("Withdraw encryption failed - no inputProof returned")
    }
    
    const withdrawExternalEuint64 = toHex(withdrawEncryptedResult.handles[0])
    const withdrawInputProof = toHex(withdrawEncryptedResult.inputProof)
    
    console.log('✅ Encrypted withdraw input created successfully')
    
    // Execute withdraw transaction
    console.log('\n📝 Executing withdraw transaction...')
    const withdrawTx = await contract.withdraw(
      withdrawExternalEuint64, // externalEuint64 as hex string
      withdrawInputProof,      // inputProof as separate parameter
      {
        gasLimit: 2000000 // Increased gas limit for FHEVM operations
      }
    )
    console.log('✅ Withdraw transaction sent:', withdrawTx.hash)
    const withdrawReceipt = await withdrawTx.wait()
    console.log('✅ Withdraw transaction confirmed:', withdrawReceipt?.hash)
    
    // Wait for state update
    console.log('\n⏳ Waiting for state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 7: Get final balance and decrypt
    console.log('\n💰 Step 7: Reading final balance...')
    const finalBalance = await contract.getEncryptedBalance(userAddress)
    console.log('✅ Final balance handle:', finalBalance)
    
    // Decrypt final balance using SDK
    console.log('\n🔓 Step 8: Decrypting final balance...')
    const finalBalanceDecrypted = await fhevmClient.decrypt({
      handle: finalBalance,
      contractAddress: CONFIG.contractAddress,
      signature: decryptionSignature
    })
    
    // SDK returns a number directly
    const finalDecryptedValue = Number(finalBalanceDecrypted)
    
    console.log('✅ Final balance:', finalDecryptedValue)
    
    console.log('\n🎉 Interactive FHEVM Bank Demo Completed!')
    console.log('✅ Real FHEVM functionality verified')
    console.log('✅ Interactive flow: getBalance → deposit → getBalance → decrypt → transfer → withdraw → getBalance → decrypt')
    console.log('✅ EIP-712 signature generation and decryption working')
    console.log('✅ Our Universal FHEVM SDK works in Node.js environment fully functional')
    console.log('✅ Complete workflow: deposit 6969 → transfer 69 → withdraw 69 → decrypt final balance')
    
    console.log('\n📈 Operation Summary:')
    console.log(`   After +${depositAmount} deposit: ${depositDecryptedValue}`)
    console.log(`   After -${transferAmount} transfer: [balance updated]`)
    console.log(`   After -${withdrawAmount} withdraw: ${finalDecryptedValue}`)
    console.log(`   Expected final: ${depositDecryptedValue - transferAmount - withdrawAmount}`)
    
  } catch (error) {
    console.error('❌ Error during FHEVM Bank Demo:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run the demo
main().catch(console.error)
