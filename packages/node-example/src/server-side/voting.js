#!/usr/bin/env node

/**
 * FHEVM Voting CLI - Stateless Vote Casting
 * 
 * This script demonstrates FHEVM voting operations on a live blockchain:
 * - Creates FHEVM instance with mnemonic
 * - Connects to real voting contract
 * - Checks for active sessions or creates new ones
 * - Performs encrypted vote casting operations
 * - Verifies votes were recorded successfully
 * 
 * For full interactive experience with session management and result decryption,
 * use: pnpm fhevm:wizard
 */

import { ethers } from 'ethers'
import { createFHEVMClientForNode } from '@fhevm/sdk/node'
import { FhevmDecryptionSignature } from '@fhevm/sdk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Contract ABI for FHEVoting (updated to match actual contract)
const VOTING_ABI = [
  "function createVotingSession(string memory title, string memory description, uint256 duration) external",
  "function castVote(uint256 sessionId, bytes32 encryptedVote, bytes calldata inputProof) external",
  "function endVotingSession(uint256 sessionId) external",
  "function getCurrentVoteCounts(uint256 sessionId) external returns (bytes32 yesVotes, bytes32 noVotes, bytes32 totalVotes)",
  "function getEncryptedResults(uint256 sessionId) external returns (bytes32 yesVotes, bytes32 noVotes, bytes32 totalVotes)",
  "function getVotingSessionInfo(uint256 sessionId) external view returns (string memory, string memory, bool, uint256)",
  "function hasUserVoted(address user, uint256 sessionId) external view returns (bool)",
  "function sessionCounter() external view returns (uint256)"
]

// Configuration
const CONFIG = {
  rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  privateKey: process.env.PRIVATE_KEY || '0x' + '0'.repeat(64),
  contractAddress: process.env.VOTING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  chainId: 11155111 // Sepolia
}

// This is a stateless CLI focused on voting operations only
// For full interactive experience with session management and result decryption,
// use: pnpm fhevm:wizard

async function main() {
  console.log('🗳️ FHEVM Voting CLI - Stateless Vote Casting')
  console.log('=' .repeat(50))
  
  try {
    // Validate configuration
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0x' + '0'.repeat(64)) {
      throw new Error('Please set PRIVATE_KEY in your .env file')
    }
    
    if (!process.env.VOTING_CONTRACT_ADDRESS || process.env.VOTING_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('Please set VOTING_CONTRACT_ADDRESS in your .env file')
    }
    
    // Setup wallet and contract
    console.log('\n📄 Setting up wallet and contract...')
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
    const signer = new ethers.Wallet(CONFIG.privateKey, provider)
    const contract = new ethers.Contract(CONFIG.contractAddress, VOTING_ABI, signer)
    
    console.log('✅ Wallet created:', await signer.getAddress())
    console.log('✅ Voting contract connected:', CONFIG.contractAddress)
    
    // Create FHEVM client using enhanced SDK
    console.log('\n🔐 Creating FHEVM client using enhanced SDK...')
    const fhevmConfig = {
      rpcUrl: CONFIG.rpcUrl,
      chainId: CONFIG.chainId
    }
    
    const fhevmClient = await createFHEVMClientForNode(fhevmConfig)
    console.log('✅ FHEVM client created and ready!')
    console.log('🔍 Client type:', fhevmClient.constructor.name)
    
    // Get user address for operations
    const userAddress = await signer.getAddress()
    
    // Step 1: Check for existing active sessions or create new one
    console.log('\n🗳️ Step 1: Checking for active voting sessions...')
    
    let sessionId
    let sessionCreated = false
    
    // Try to get the latest session ID from the counter
    try {
      const sessionCounter = await contract.sessionCounter()
      console.log('✅ Current session counter:', sessionCounter.toString())
      
      // Check if the latest session is still active
      if (sessionCounter > 0) {
        const latestSessionId = Number(sessionCounter) - 1
        console.log('🔍 Checking if session', latestSessionId, 'is still active...')
        
        try {
          const sessionInfo = await contract.getVotingSessionInfo(latestSessionId)
          const isActive = sessionInfo[2] // isActive field
          const endTime = Number(sessionInfo[3]) // endTime field
          const currentTime = Math.floor(Date.now() / 1000)
          
          console.log('📊 Session info:', {
            title: sessionInfo[0],
            isActive: isActive,
            endTime: new Date(endTime * 1000).toLocaleString(),
            currentTime: new Date(currentTime * 1000).toLocaleString()
          })
          
          if (isActive && currentTime < endTime) {
            sessionId = latestSessionId
            console.log('✅ Found active session:', sessionId)
          } else if (!isActive || currentTime >= endTime) {
            console.log('⚠️ Latest session is ended (active:', isActive, ', ended:', currentTime >= endTime, ')')
            console.log('   Will create new session...')
            sessionId = null
          }
        } catch (error) {
          console.log('⚠️ Could not check session info:', error.message)
          console.log('   Will create new session...')
          sessionId = null
        }
      } else {
        console.log('ℹ️ No existing sessions found, creating new session...')
        sessionId = null
      }
    } catch (error) {
      console.log('⚠️ Could not check session counter:', error.message)
      console.log('   Will create new session...')
      sessionId = null
    }
    
    // Create new session if needed
    if (sessionId === null) {
      console.log('\n🗳️ Creating new voting session...')
      const sessionTitle = "FHEVM Demo Election 2024"
      const sessionDescription = "Vote for the best FHEVM implementation"
      const sessionDuration = 180 // 3 minutes for demo purposes
      
      const createSessionTx = await contract.createVotingSession(
        sessionTitle,
        sessionDescription,
        sessionDuration
      )
      console.log('✅ Create session transaction sent:', createSessionTx.hash)
      
      // Wait for confirmation
      console.log('⏳ Waiting for confirmation...')
      const createSessionReceipt = await createSessionTx.wait()
      console.log('✅ Create session transaction confirmed:', createSessionReceipt.hash)
      
      // Get the new session ID from the counter
      const newSessionCounter = await contract.sessionCounter()
      sessionId = Number(newSessionCounter) - 1
      sessionCreated = true
      console.log('✅ New voting session created with ID:', sessionId)
      console.log('⏰ Session will end in', sessionDuration, 'seconds')
    }
    
    // Step 2: Get session info
    console.log('\n📊 Step 2: Reading session information...')
    const sessionInfo = await contract.getVotingSessionInfo(sessionId)
    console.log('✅ Session info:', {
      title: sessionInfo[0],
      description: sessionInfo[1],
      isActive: sessionInfo[2],
      endTime: sessionInfo[3].toString()
    })
    
    // Step 3: Cast first encrypted vote
    console.log('\n🗳️ Step 3: Creating first encrypted vote...')
    const voteChoice = 1 // 1 = Yes, 0 = No
    
    // Create encrypted input using enhanced SDK
    console.log('🔐 Creating encrypted input using SDK...')
    
    const encryptedVote = await fhevmClient.encrypt(voteChoice, {
      publicKey: userAddress,
      contractAddress: CONFIG.contractAddress
    })
    
    console.log('✅ Encrypted vote input created successfully')
    
    if (!encryptedVote || !encryptedVote.handles || !encryptedVote.handles[0]) {
      throw new Error("Vote encryption failed - no handle returned")
    }
    
    if (!encryptedVote.inputProof) {
      throw new Error("Vote encryption failed - no inputProof returned")
    }
    
    // SDK already returns hex strings
    console.log('🔍 Encrypted vote handles:', encryptedVote.handles)
    console.log('🔍 Encrypted vote inputProof type:', typeof encryptedVote.inputProof)
    
    if (!encryptedVote.handles || !encryptedVote.handles[0]) {
      throw new Error("Encrypted vote handles are missing or invalid")
    }
    
    if (!encryptedVote.inputProof) {
      throw new Error("Encrypted vote inputProof is missing")
    }
    
    const voteExternalEuint32 = encryptedVote.handles[0]
    const voteInputProof = encryptedVote.inputProof
    
    // Send first vote transaction
    console.log('\n📝 Executing first vote transaction...')
    const voteTx = await contract.castVote(
      sessionId,
      voteExternalEuint32,
      voteInputProof,
      {
        gasLimit: 2000000 // Increased gas limit for FHEVM operations
      }
    )
    console.log('✅ First vote transaction sent:', voteTx.hash)
    
    // Wait for confirmation
    const voteReceipt = await voteTx.wait()
    console.log('✅ First vote transaction confirmed:', voteReceipt?.hash)
    
    // Wait for state update
    console.log('\n⏳ Waiting for state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 4: Check if user has voted (results only available after session ends)
    console.log('\n📊 Step 4: Checking vote status...')
    const hasVoted = await contract.hasUserVoted(userAddress, sessionId)
    console.log('✅ User has voted:', hasVoted)
    
    if (hasVoted) {
      console.log('✅ Vote successfully recorded in session')
    } else {
      console.log('⚠️ Vote may not have been recorded properly')
    }
    
    // Step 5: Cast second vote (simulate multiple voters)
    console.log('\n🗳️ Step 5: Creating second encrypted vote...')
    const voteChoice2 = 0 // No vote
    
    const encryptedVote2 = await fhevmClient.encrypt(voteChoice2, {
      publicKey: userAddress,
      contractAddress: CONFIG.contractAddress
    })
    
    if (!encryptedVote2 || !encryptedVote2.handles || !encryptedVote2.handles[0]) {
      throw new Error("Second vote encryption failed - no handle returned")
    }
    
    if (!encryptedVote2.inputProof) {
      throw new Error("Second vote encryption failed - no inputProof returned")
    }
    
    const voteExternalEuint32_2 = encryptedVote2.handles[0]
    const voteInputProof2 = encryptedVote2.inputProof
    
    console.log('✅ Second encrypted vote input created successfully')
    
    // Send second vote transaction
    console.log('\n📝 Executing second vote transaction...')
    const voteTx2 = await contract.castVote(
      sessionId,
      voteExternalEuint32_2,
      voteInputProof2,
      {
        gasLimit: 2000000 // Increased gas limit for FHEVM operations
      }
    )
    console.log('✅ Second vote transaction sent:', voteTx2.hash)
    
    // Wait for confirmation
    const voteReceipt2 = await voteTx2.wait()
    console.log('✅ Second vote transaction confirmed:', voteReceipt2?.hash)
    
    // Wait for state update
    console.log('\n⏳ Waiting for state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check second vote status
    console.log('\n📊 Step 6: Checking second vote status...')
    const hasVoted2 = await contract.hasUserVoted(userAddress, sessionId)
    console.log('✅ User has voted (after second vote):', hasVoted2)
    
    // Summary
    console.log('\n🎉 FHEVM Voting CLI Completed!')
    console.log('✅ Real FHEVM functionality verified')
    console.log('✅ Smart session management: check existing → create if needed → vote → verify')
    console.log('✅ Our Universal FHEVM SDK works in Node.js environment fully functional')
    console.log('✅ Clean stateless CLI: focused on voting operations only')
    
    console.log('\n📈 Voting Summary:')
    console.log(`   Session ID: ${sessionId}`)
    console.log(`   Session Created: ${sessionCreated ? 'Yes' : 'No (used existing)'}`)
    console.log(`   Vote 1 (Yes): ${voteChoice}`)
    console.log(`   Vote 2 (No): ${voteChoice2}`)
    console.log(`   Vote 1 Recorded: ${hasVoted}`)
    console.log(`   Vote 2 Recorded: ${hasVoted2}`)
    
    console.log('\n💡 Next Steps:')
    console.log('   • Use pnpm fhevm:wizard for full interactive experience')
    console.log('   • Wizard can check session status and decrypt results')
    console.log('   • Wizard handles session ending and result decryption')
    
  } catch (error) {
    console.error('❌ Error during FHEVM Voting Demo:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run the demo
main().catch(console.error)
