#!/usr/bin/env node

/**
 * FHEVM Counter Demo - Real Blockchain Operations
 * 
 * This script demonstrates real FHEVM operations on a live blockchain:
 * - Connects to real contract
 * - Performs encrypted increment/decrement operations
 * - Decrypts results using EIP-712 signatures
 */

import { ethers } from 'ethers'
import { createFHEVMClientForNode } from '@fhevm/sdk/node'
import { FhevmDecryptionSignature } from '@fhevm/sdk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Configuration
const CONFIG = {
  rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  privateKey: process.env.PRIVATE_KEY || '0x' + '0'.repeat(64),
  contractAddress: process.env.COUNTER_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  chainId: 11155111 // Sepolia
}

// Contract ABI (minimal for counter operations)
const COUNTER_ABI = [
  "function getCount() external view returns (bytes32)",
  "function increment(bytes32 inputEuint32, bytes calldata inputProof) external",
  "function decrement(bytes32 inputEuint32, bytes calldata inputProof) external"
]

async function main() {
  try {
  console.log('🚀 FHEVM Counter Demo - Real Blockchain Operations')
    console.log('============================================================')
  
    // Validate configuration
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0x' + '0'.repeat(64)) {
      throw new Error('Please set PRIVATE_KEY in your .env file')
    }
    
    if (!process.env.COUNTER_CONTRACT_ADDRESS || process.env.COUNTER_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('Please set COUNTER_CONTRACT_ADDRESS in your .env file')
    }
    
    // Setup wallet and contract
    console.log('\n📄 Setting up wallet and contract...')
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
    const signer = new ethers.Wallet(CONFIG.privateKey, provider)
    const contract = new ethers.Contract(CONFIG.contractAddress, COUNTER_ABI, signer)
    
    console.log('✅ Wallet created:', await signer.getAddress())
    console.log('✅ Contract connected:', CONFIG.contractAddress)
    
    // Create FHEVM client using enhanced SDK
    console.log('\n🔐 Creating FHEVM client using enhanced SDK...')
    const fhevmConfig = {
      rpcUrl: CONFIG.rpcUrl,
      chainId: CONFIG.chainId
    }
    
    const fhevmClient = await createFHEVMClientForNode(fhevmConfig)
    console.log('✅ FHEVM client created and ready!')
    console.log('🔍 Client type:', fhevmClient.constructor.name)
    
    // Step 1: Get initial count (might be from previous runs)
    console.log('\n📊 Step 1: Reading initial encrypted count...')
    const initialCountHandle = await contract.getCount()
    console.log('✅ Initial encrypted count handle:', initialCountHandle)
    console.log('ℹ️  Note: This handle might be from previous runs and may not be decryptable by current user')
    
    // Step 2: Create new encrypted state by incrementing
    console.log('\n➕ Step 2: Creating new encrypted state with increment operation...')
    const incrementValue = 5
    
    // Create encrypted input using enhanced SDK
    console.log('🔐 Creating encrypted input using SDK...')
    
    const userAddress = await signer.getAddress()
    const encryptedResult = await fhevmClient.encrypt(incrementValue, {
      publicKey: userAddress,
      contractAddress: CONFIG.contractAddress
    })
    
    console.log('✅ Encrypted input created successfully')
    
    if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
      throw new Error("Encryption failed - no handle returned")
    }
    
    if (!encryptedResult.inputProof) {
      throw new Error("Encryption failed - no inputProof returned")
    }
    
    const externalEuint32 = encryptedResult.handles[0]
    const inputProof = encryptedResult.inputProof
    
    // Execute increment transaction
    console.log('\n📝 Executing increment transaction...')
    
    try {
    const incrementTx = await contract.increment(
        externalEuint32,
        inputProof
    )
      
    console.log('✅ Increment transaction sent:', incrementTx.hash)
      const incrementReceipt = await incrementTx.wait()
      console.log('✅ Increment transaction confirmed:', incrementReceipt?.hash)
    } catch (txError) {
      console.error('❌ Transaction error:', txError.message)
      throw txError
    }
    
    // Wait for state to be updated
    console.log('\n⏳ Waiting for state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 3: Get updated count (this should be decryptable by us)
    console.log('\n📊 Step 3: Reading updated encrypted count...')
    const updatedCountHandle = await contract.getCount()
    console.log('✅ Updated encrypted count handle:', updatedCountHandle)
    console.log('ℹ️  This handle should be decryptable since we just created it')
    
    // Step 4: Decrypt the new count using EIP-712 signature
    console.log('\n🔓 Step 4: Decrypting new count with EIP-712 signature...')
    
    // Create in-memory storage for decryption signatures (Node.js equivalent)
    const decryptionSignatureStorage = new Map()
    
    // Generate EIP-712 signature using SDK's proven method
    const contractAddresses = [CONFIG.contractAddress]
    console.log('🔐 Generating EIP-712 signature...')
    
    const decryptionSignature = await FhevmDecryptionSignature.loadOrSign(
      fhevmClient.getInstance(),
      contractAddresses,
      signer,
      decryptionSignatureStorage
    )
    
    console.log('✅ EIP-712 signature created successfully')
    
    // Decrypt using the SDK
    const updatedDecrypted = await fhevmClient.decrypt({
      handle: updatedCountHandle,
      contractAddress: CONFIG.contractAddress,
      signature: decryptionSignature
    })
    
    
    // Helper function to safely stringify objects with BigInt
    const safeStringify = (obj) => {
      return JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    }
    
    // SDK returns a number directly
    const decryptedValue = Number(updatedDecrypted)
    
    console.log('✅ Updated decrypted count:', decryptedValue)
    console.log('🎉 Successfully decrypted the count we just created!')
    
    // Step 5: Test decrement operation
    console.log('\n➖ Step 5: Testing decrement operation...')
    const decrementValue = 2
    
    // Create encrypted input for decrement using SDK
    console.log('🔐 Creating encrypted input for decrement...')
    const decrementEncryptedResult = await fhevmClient.encrypt(decrementValue, {
      publicKey: userAddress,
      contractAddress: CONFIG.contractAddress
    })
    
    if (!decrementEncryptedResult || !decrementEncryptedResult.handles || !decrementEncryptedResult.handles[0]) {
      throw new Error("Decrement encryption failed - no handle returned")
    }
    
    if (!decrementEncryptedResult.inputProof) {
      throw new Error("Decrement encryption failed - no inputProof returned")
    }
    
    const decrementExternalEuint32 = decrementEncryptedResult.handles[0]
    const decrementInputProof = decrementEncryptedResult.inputProof
    
    console.log('✅ Encrypted decrement input created successfully')
    
    // Send decrement transaction
    console.log('\n📝 Executing decrement transaction...')
    const decrementTx = await contract.decrement(
      decrementExternalEuint32,
      decrementInputProof
    )
    console.log('✅ Decrement transaction sent:', decrementTx.hash)
    
    // Wait for confirmation
    const decrementReceipt = await decrementTx.wait()
    console.log('✅ Decrement transaction confirmed:', decrementReceipt?.hash)
    
    // Wait for state update
    console.log('\n⏳ Waiting for state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 6: Read final count and decrypt
    console.log('\n📊 Step 6: Reading final encrypted count...')
    const finalCountHandle = await contract.getCount()
    console.log('✅ Final encrypted count handle:', finalCountHandle)
    
    // Decrypt final count using SDK
    console.log('\n🔓 Step 7: Decrypting final count...')
    const finalDecrypted = await fhevmClient.decrypt({
      handle: finalCountHandle,
      contractAddress: CONFIG.contractAddress,
      signature: decryptionSignature
    })
    
    
    // SDK returns a number directly
    const finalDecryptedValue = Number(finalDecrypted)
    
    console.log('✅ Final decrypted count:', finalDecryptedValue)
    
    console.log('\n🎉 Interactive FHEVM Counter Demo Completed!')
    console.log('✅ Real FHEVM functionality verified')
    console.log('✅ Interactive flow: getCount → increment → getCount → decrypt')
    console.log('✅ EIP-712 signature generation and decryption working')
    console.log('✅ Our Universal FHEVM SDK works in Node.js environment fully functional')
    console.log('✅ Complete workflow: initial state → create new state → decrypt new state')
    
  } catch (error) {
    console.error('❌ Error during FHEVM Counter Demo:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run the demo
main()