#!/usr/bin/env node

/**
 * FHEVM Wizard - Interactive Demo Experience
 * 
 * A beautiful, context-aware CLI wizard that showcases the Universal FHEVM SDK
 * through guided interactive demos. Perfect for judges and developers to experience
 * the full power of confidential computing on blockchain.
 */

import { ethers } from 'ethers'
import { createFHEVMClientForNode } from '@fhevm/sdk/node'
import { FhevmDecryptionSignature } from '@fhevm/sdk'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config()

// Configuration
const CONFIG = {
  rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/8800e5d43f644529846d90ee5c29adcf',
  privateKey: process.env.PRIVATE_KEY || '0x' + '0'.repeat(64),
  bankContractAddress: process.env.BANK_CONTRACT_ADDRESS || '0xA020287B1670453919C2f49e2e8c2C09B96101B8',
  votingContractAddress: process.env.VOTING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  counterContractAddress: process.env.COUNTER_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  recipientAddress: process.env.RECIPIENT_ADDRESS || '0x52F016116508986c6ef2419266075cD7C4C01434',
  chainId: 11155111
}

// Contract ABIs
const BANK_ABI = [
  "function deposit(bytes32 amount, bytes calldata inputProof) public",
  "function withdraw(bytes32 amount, bytes calldata inputProof) public", 
  "function transfer(address to, bytes32 amount, bytes calldata inputProof) public",
  "function getEncryptedBalance(address account) public view returns (bytes32)",
  "function getEncryptedTotalSupply() public view returns (bytes32)"
]

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

const COUNTER_ABI = [
  "function getCount() external view returns (bytes32)",
  "function increment(bytes32 inputEuint32, bytes calldata inputProof) external",
  "function decrement(bytes32 inputEuint32, bytes calldata inputProof) external"
]

class FHEVMWizard {
  constructor() {
    this.fhevmClient = null
    this.signer = null
    this.sessionData = {
      startTime: new Date(),
      demos: [],
      transactions: [],
      errors: []
    }
    this.recordMode = process.argv.includes('--record')
  }

  // Helper function to try to decode revert reason
  async tryDecodeRevertReason(contract, functionName, args, error) {
    try {
      // Try to call the function with static call to get revert reason
      await contract[functionName].staticCall(...args)
    } catch (staticError) {
      if (staticError.reason) {
        return staticError.reason
      }
      if (staticError.data) {
        // Try to decode the revert data
        try {
          const decoded = contract.interface.parseError(staticError.data)
          return decoded?.name || 'Unknown revert'
        } catch {
          return 'Revert data: ' + staticError.data
        }
      }
    }
    return 'Unknown revert reason'
  }

  async init() {
    console.log(chalk.blue.bold('\n🧙‍♂️  Welcome to FHEVM Wizard!'))
    console.log(chalk.gray('Universal FHEVM SDK - Interactive Demo Experience\n'))
    
    // Check for record mode
    if (this.recordMode) {
      console.log(chalk.yellow('📹 Record mode enabled - session will be saved to transcript\n'))
    }

    const spinner = ora('Initializing FHEVM environment...').start()
    
    try {
      // Validate configuration
      if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0x' + '0'.repeat(64)) {
        throw new Error('Please set PRIVATE_KEY in your .env file')
      }

      // Setup wallet
      const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
      this.signer = new ethers.Wallet(CONFIG.privateKey, provider)
      
      // Create FHEVM client
      const fhevmConfig = {
        rpcUrl: CONFIG.rpcUrl,
        chainId: CONFIG.chainId
      }
      
      this.fhevmClient = await createFHEVMClientForNode(fhevmConfig)
      
      spinner.succeed(chalk.green('FHEVM environment ready!'))
      console.log(chalk.gray(`   Wallet: ${await this.signer.getAddress()}`))
      console.log(chalk.gray(`   Network: Sepolia (${CONFIG.chainId})`))
      console.log(chalk.gray(`   RPC: ${CONFIG.rpcUrl.substring(0, 30)}...`))
      
    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize FHEVM environment'))
      console.error(chalk.red(`   Error: ${error.message}`))
      process.exit(1)
    }
  }

  async showMainMenu() {
    const { demo } = await inquirer.prompt([
      {
        type: 'list',
        name: 'demo',
        message: chalk.cyan('Choose your FHEVM demo:'),
        choices: [
          {
            name: '🏦  Bank Demo - Deposit, Transfer, Withdraw',
            value: 'bank',
            short: 'Bank Demo'
          },
          {
            name: '🗳️  Voting Demo - Encrypted Voting System',
            value: 'voting',
            short: 'Voting Demo'
          },
          {
            name: '🔢 Counter Demo - Increment/Decrement Operations',
            value: 'counter',
            short: 'Counter Demo'
          },
          {
            name: '🔍 Test Mode - Verify Setup Only',
            value: 'test',
            short: 'Test Mode'
          },
          {
            name: '🎯 Run All Demos',
            value: 'all',
            short: 'All Demos'
          },
          {
            name: '❌ Exit Wizard',
            value: 'exit',
            short: 'Exit'
          }
        ]
      }
    ])

    return demo
  }

  async runBankDemo() {
    console.log(chalk.blue.bold('\n🏦 FHEVM Bank Demo'))
    console.log(chalk.gray('Experience confidential banking operations\n'))

    const demoData = {
      name: 'Bank Demo',
      startTime: new Date(),
      operations: []
    }

    try {
      // Check contract address
      if (!process.env.BANK_CONTRACT_ADDRESS || process.env.BANK_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.log(chalk.yellow('⚠️  BANK_CONTRACT_ADDRESS not set in .env'))
        console.log(chalk.gray('   Using default address (may not work)'))
      }

      const contract = new ethers.Contract(CONFIG.bankContractAddress, BANK_ABI, this.signer)
      const userAddress = await this.signer.getAddress()

      // Verify contract is accessible
      console.log(chalk.cyan('\n🔍 Step 1: Verifying contract accessibility...'))
      const spinner1 = ora('Checking contract...').start()
      
      try {
        // Try to call a view function first to verify contract exists
        const initialBalanceHandle = await contract.getEncryptedBalance(userAddress)
        spinner1.succeed(chalk.green('Contract accessible'))
        console.log(chalk.gray(`   Contract: ${CONFIG.bankContractAddress}`))
        console.log(chalk.gray(`   Encrypted handle: ${initialBalanceHandle.substring(0, 20)}...`))
        
        // Verify contract has the expected interface
        console.log(chalk.gray('   Verifying contract interface...'))
        const hasDeposit = typeof contract.deposit === 'function'
        const hasWithdraw = typeof contract.withdraw === 'function'
        const hasTransfer = typeof contract.transfer === 'function'
        
        if (!hasDeposit || !hasWithdraw || !hasTransfer) {
          throw new Error('Contract missing expected functions (deposit, withdraw, transfer)')
        }
        
        console.log(chalk.green('   ✅ Contract interface verified'))
      } catch (contractError) {
        spinner1.fail(chalk.red('Contract not accessible'))
        console.log(chalk.red(`   Error: ${contractError.message}`))
        console.log(chalk.gray(`   Contract: ${CONFIG.bankContractAddress}`))
        
        if (contractError.message.includes('missing expected functions')) {
          console.log(chalk.yellow('   ⚠️  Contract may not be the correct FHEBank contract'))
          console.log(chalk.yellow('   💡 Check if the contract address is correct'))
        } else {
          console.log(chalk.yellow('   Make sure BANK_CONTRACT_ADDRESS is set correctly in .env'))
        }
        
        throw contractError
      }

      // Deposit amount
      const { depositAmount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'depositAmount',
          message: 'Enter deposit amount:',
          default: 6969,
          validate: (value) => value > 0 || 'Amount must be positive'
        }
      ])

      // Create encrypted deposit using FHEVM pattern (64-bit for FHEBank)
      console.log(chalk.cyan('\n🔐 Step 2: Creating encrypted deposit...'))
      const spinner2 = ora('Encrypting deposit amount...').start()
      
      const input = this.fhevmClient.getInstance().createEncryptedInput(CONFIG.bankContractAddress, userAddress)
      input.add64(depositAmount) // Bank uses 64-bit
      const depositEncryptedResult = await input.encrypt()
      
      if (!depositEncryptedResult?.handles?.[0] || !depositEncryptedResult.inputProof) {
        throw new Error('Deposit encryption failed')
      }
      
      // Convert to hex strings like Vue/Next.js examples
      const toHex = (data) => {
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      
      const depositExternalEuint64 = toHex(depositEncryptedResult.handles[0])
      const depositInputProof = toHex(depositEncryptedResult.inputProof)
      
      spinner2.succeed(chalk.green('Deposit encrypted successfully'))

      // Execute deposit
      console.log(chalk.cyan('\n📤 Step 3: Executing deposit transaction...'))
      const spinner3 = ora('Sending deposit transaction...').start()
      
      let depositTx
      try {
        // Estimate gas first
        console.log(chalk.gray('   Estimating gas...'))
        const gasEstimate = await contract.deposit.estimateGas(
          depositEncryptedResult.handles[0],
          depositEncryptedResult.inputProof
        )
        console.log(chalk.gray(`   Gas estimate: ${gasEstimate.toString()}`))
        
        // Use estimated gas + 20% buffer
        const gasLimit = (gasEstimate * 120n) / 100n
        console.log(chalk.gray(`   Gas limit: ${gasLimit.toString()}`))
        
        depositTx = await contract.deposit(
          depositExternalEuint64,
          depositInputProof,
          { gasLimit }
        )
        
        spinner3.succeed(chalk.green('Deposit transaction sent'))
        console.log(chalk.gray(`   Transaction: ${depositTx.hash}`))
        
        const depositReceipt = await depositTx.wait()
        console.log(chalk.green(`   Confirmed: ${depositReceipt.hash}`))
        console.log(chalk.gray(`   Gas used: ${depositReceipt.gasUsed.toString()}`))
      } catch (txError) {
        spinner3.fail(chalk.red('Deposit transaction failed'))
        
        // Better error reporting
        if (txError.code === 'CALL_EXCEPTION') {
          console.log(chalk.red(`   Contract call failed`))
          console.log(chalk.gray(`   Contract: ${CONFIG.bankContractAddress}`))
          console.log(chalk.gray(`   Function: deposit`))
          console.log(chalk.gray(`   Args: [${depositEncryptedResult.handles[0].substring(0, 20)}..., ${depositEncryptedResult.inputProof.substring(0, 20)}...]`))
          
          // Try to get more details about the revert
          if (txError.receipt) {
            console.log(chalk.red(`   Gas used: ${txError.receipt.gasUsed}`))
            console.log(chalk.red(`   Status: ${txError.receipt.status}`))
          }
          
          // Try to decode revert reason
          console.log(chalk.gray('   Attempting to decode revert reason...'))
          const revertReason = await this.tryDecodeRevertReason(
            contract, 
            'deposit', 
            [depositEncryptedResult.handles[0], depositEncryptedResult.inputProof],
            txError
          )
          console.log(chalk.red(`   Revert reason: ${revertReason}`))
          
          // Check if it's a common issue
          if (txError.receipt && txError.receipt.gasUsed < 100000) {
            console.log(chalk.yellow(`   ⚠️  Low gas usage suggests contract revert`))
            console.log(chalk.yellow(`   💡 Try checking: contract address, function signature, or input validation`))
          }
        } else {
          console.log(chalk.red(`   Error: ${txError.message}`))
        }
        
        throw txError
      }
      
      demoData.operations.push({
        type: 'deposit',
        amount: depositAmount,
        txHash: depositTx.hash
      })

      // Wait for state update
      console.log(chalk.cyan('\n⏳ Step 4: Waiting for state update...'))
      const spinner4 = ora('Waiting for blockchain state update...').start()
      await new Promise(resolve => setTimeout(resolve, 3000))
      spinner4.succeed(chalk.green('State updated'))

      // Decrypt balance
      console.log(chalk.cyan('\n🔓 Step 5: Decrypting new balance...'))
      const spinner5 = ora('Generating EIP-712 signature...').start()
      
      const decryptionSignatureStorage = new Map()
      const contractAddresses = [CONFIG.bankContractAddress]
      
      const decryptionSignature = await FhevmDecryptionSignature.loadOrSign(
        this.fhevmClient.getInstance(),
        contractAddresses,
        this.signer,
        decryptionSignatureStorage
      )
      
      spinner5.succeed(chalk.green('EIP-712 signature ready'))
      
      const balanceAfterDeposit = await contract.getEncryptedBalance(userAddress)
      const decryptedBalance = await this.fhevmClient.decrypt({
        handle: balanceAfterDeposit,
        contractAddress: CONFIG.bankContractAddress,
        signature: decryptionSignature
      })
      
      const finalBalance = Number(decryptedBalance)
      console.log(chalk.green(`   Balance after deposit: ${finalBalance}`))

      // Ask for transfer
      const { doTransfer } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'doTransfer',
          message: 'Would you like to transfer some tokens?',
          default: true
        }
      ])

      if (doTransfer) {
        const { transferAmount } = await inquirer.prompt([
          {
            type: 'number',
            name: 'transferAmount',
            message: 'Enter transfer amount:',
            default: 69,
            validate: (value) => value > 0 && value <= finalBalance || 'Amount must be positive and not exceed balance'
          }
        ])

        // Create encrypted transfer using FHEVM pattern (64-bit for FHEBank)
        console.log(chalk.cyan('\n🔄 Step 6: Creating encrypted transfer...'))
        const spinner6 = ora('Encrypting transfer amount...').start()
        
        const transferInput = this.fhevmClient.getInstance().createEncryptedInput(CONFIG.bankContractAddress, userAddress)
        transferInput.add64(transferAmount) // Bank uses 64-bit
        const transferEncryptedResult = await transferInput.encrypt()
        
        if (!transferEncryptedResult?.handles?.[0] || !transferEncryptedResult.inputProof) {
          throw new Error('Transfer encryption failed')
        }
        
        const transferExternalEuint64 = toHex(transferEncryptedResult.handles[0])
        const transferInputProof = toHex(transferEncryptedResult.inputProof)
        
        spinner6.succeed(chalk.green('Transfer encrypted successfully'))

        // Execute transfer
        console.log(chalk.cyan('\n📤 Step 7: Executing transfer transaction...'))
        const spinner7 = ora('Sending transfer transaction...').start()
        
        let transferTx
        try {
          transferTx = await contract.transfer(
            CONFIG.recipientAddress,
            transferExternalEuint64,
            transferInputProof,
            { gasLimit: 2000000 }
          )
          
          spinner7.succeed(chalk.green('Transfer transaction sent'))
          console.log(chalk.gray(`   Transaction: ${transferTx.hash}`))
          
          const transferReceipt = await transferTx.wait()
          console.log(chalk.green(`   Confirmed: ${transferReceipt.hash}`))
        } catch (txError) {
          spinner7.fail(chalk.red('Transfer transaction failed'))
          console.log(chalk.red(`   Error: ${txError.message}`))
          console.log(chalk.gray(`   Contract: ${CONFIG.bankContractAddress}`))
          console.log(chalk.gray(`   Recipient: ${CONFIG.recipientAddress}`))
          throw txError
        }
        
        demoData.operations.push({
          type: 'transfer',
          amount: transferAmount,
          to: CONFIG.recipientAddress,
          txHash: transferTx.hash
        })
      }

      // Final balance
      console.log(chalk.cyan('\n💰 Step 8: Reading final balance...'))
      const finalBalanceHandle = await contract.getEncryptedBalance(userAddress)
      const finalDecryptedBalance = await this.fhevmClient.decrypt({
        handle: finalBalanceHandle,
        contractAddress: CONFIG.bankContractAddress,
        signature: decryptionSignature
      })
      
      const finalBalanceValue = Number(finalDecryptedBalance)
      console.log(chalk.green(`   Final balance: ${finalBalanceValue}`))

      demoData.endTime = new Date()
      demoData.success = true
      demoData.finalBalance = finalBalanceValue
      
      console.log(chalk.green.bold('\n🎉 Bank Demo Completed Successfully!'))
      console.log(chalk.gray('   ✅ Encrypted deposit operations'))
      console.log(chalk.gray('   ✅ EIP-712 signature generation'))
      console.log(chalk.gray('   ✅ Confidential balance decryption'))
      console.log(chalk.gray('   ✅ Secure transfer operations'))

    } catch (error) {
      demoData.endTime = new Date()
      demoData.success = false
      demoData.error = error.message
      
      console.log(chalk.red.bold('\n❌ Bank Demo Failed'))
      console.log(chalk.red(`   Error: ${error.message}`))
    }

    this.sessionData.demos.push(demoData)
    return demoData
  }

  async runVotingDemo() {
    console.log(chalk.blue.bold('\n🗳️ FHEVM Voting Demo'))
    console.log(chalk.gray('Experience confidential voting operations\n'))

    const demoData = {
      name: 'Voting Demo',
      startTime: new Date(),
      operations: []
    }

    try {
      // Check contract address
      if (!process.env.VOTING_CONTRACT_ADDRESS || process.env.VOTING_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.log(chalk.yellow('⚠️  VOTING_CONTRACT_ADDRESS not set in .env'))
        console.log(chalk.gray('   Using default address (may not work)'))
      }

      const contract = new ethers.Contract(CONFIG.votingContractAddress, VOTING_ABI, this.signer)
      const userAddress = await this.signer.getAddress()

      // Check for existing sessions or create new one
      console.log(chalk.cyan('\n🗳️ Step 1: Managing voting session...'))
      const spinner1 = ora('Checking for active sessions...').start()
      
      let sessionId
      let sessionCreated = false
      
      try {
        const sessionCounter = await contract.sessionCounter()
        if (sessionCounter > 0) {
          const latestSessionId = Number(sessionCounter) - 1
          const sessionInfo = await contract.getVotingSessionInfo(latestSessionId)
          const isActive = sessionInfo[2]
          const endTime = Number(sessionInfo[3])
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (isActive && currentTime < endTime) {
            sessionId = latestSessionId
            console.log(chalk.green(`   Found active session: ${sessionId}`))
          } else if (!isActive || currentTime >= endTime) {
            console.log(chalk.yellow(`   Latest session is ended (active: ${isActive}, ended: ${currentTime >= endTime})`))
            console.log(chalk.gray('   Will create new session...'))
          }
        }
      } catch (error) {
        console.log(chalk.yellow(`   Session check failed: ${error.message}`))
        console.log(chalk.gray('   Will create new session...'))
      }
      
      if (sessionId === undefined) {
        console.log(chalk.yellow('   No active session found, creating new one...'))
        
        const createSessionTx = await contract.createVotingSession(
          "FHEVM Wizard Demo Election",
          "Interactive voting demonstration",
          300 // 5 minutes
        )
        
        const createSessionReceipt = await createSessionTx.wait()
        const newSessionCounter = await contract.sessionCounter()
        sessionId = Number(newSessionCounter) - 1
        sessionCreated = true
        
        console.log(chalk.green(`   New session created: ${sessionId}`))
      }
      
      spinner1.succeed(chalk.green('Voting session ready'))

      // Get vote choice
      const { voteChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'voteChoice',
          message: 'Choose your vote:',
          choices: [
            { name: '✅ Yes', value: 1 },
            { name: '❌ No', value: 0 }
          ]
        }
      ])

      // Create encrypted vote
      console.log(chalk.cyan('\n🔐 Step 2: Creating encrypted vote...'))
      const spinner2 = ora('Encrypting vote...').start()
      
      const encryptedVote = await this.fhevmClient.encrypt(voteChoice, {
        publicKey: userAddress,
        contractAddress: CONFIG.votingContractAddress
      })
      
      if (!encryptedVote?.handles?.[0] || !encryptedVote.inputProof) {
        throw new Error('Vote encryption failed')
      }
      
      spinner2.succeed(chalk.green('Vote encrypted successfully'))

      // Cast vote
      console.log(chalk.cyan('\n📤 Step 3: Casting encrypted vote...'))
      const spinner3 = ora('Sending vote transaction...').start()
      
      const voteTx = await contract.castVote(
        sessionId,
        encryptedVote.handles[0],
        encryptedVote.inputProof,
        { gasLimit: 2000000 }
      )
      
      spinner3.succeed(chalk.green('Vote cast successfully'))
      console.log(chalk.gray(`   Transaction: ${voteTx.hash}`))
      
      const voteReceipt = await voteTx.wait()
      console.log(chalk.green(`   Confirmed: ${voteReceipt.hash}`))
      
      demoData.operations.push({
        type: 'vote',
        choice: voteChoice === 1 ? 'Yes' : 'No',
        sessionId,
        txHash: voteTx.hash
      })

      // Wait for state update
      console.log(chalk.cyan('\n⏳ Step 4: Waiting for state update...'))
      const spinner4 = ora('Waiting for blockchain state update...').start()
      await new Promise(resolve => setTimeout(resolve, 3000))
      spinner4.succeed(chalk.green('State updated'))

      // Step 5: Wait for session to end with countdown
      console.log(chalk.cyan('\n⏰ Step 5: Waiting for voting session to end...'))
      const waitTime = 120 // 120 seconds
      const { skipWait } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'skipWait',
          message: `Wait ${waitTime} seconds for session to end naturally? (or skip to end manually)`,
          default: false
        }
      ])

      if (!skipWait) {
        console.log(chalk.gray(`   Waiting ${waitTime} seconds for session to end...`))
        const countdownSpinner = ora(`Session ends in ${waitTime} seconds...`).start()
        
        for (let i = waitTime; i > 0; i--) {
          countdownSpinner.text = `Session ends in ${i} seconds... (Press Ctrl+C to skip)`
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        countdownSpinner.succeed(chalk.green('Session wait completed'))
      } else {
        console.log(chalk.yellow('   Skipping wait, ending session manually...'))
        
        // End session manually
        const endSessionTx = await contract.endVotingSession(sessionId)
        console.log('✅ End session transaction sent:', endSessionTx.hash)
        
        const endSessionReceipt = await endSessionTx.wait()
        console.log('✅ End session transaction confirmed:', endSessionReceipt?.hash)
      }

      // Decrypt results
      console.log(chalk.cyan('\n🔓 Step 6: Decrypting voting results...'))
      const spinner5 = ora('Generating EIP-712 signature...').start()
      
      const decryptionSignatureStorage = new Map()
      const contractAddresses = [CONFIG.votingContractAddress]
      
      const decryptionSignature = await FhevmDecryptionSignature.loadOrSign(
        this.fhevmClient.getInstance(),
        contractAddresses,
        this.signer,
        decryptionSignatureStorage
      )
      
      spinner5.succeed(chalk.green('EIP-712 signature ready'))
      
      const results = await contract.getEncryptedResults(sessionId)
      
      const yesVotesDecrypted = await this.fhevmClient.decrypt({
        handle: results[0],
        contractAddress: CONFIG.votingContractAddress,
        signature: decryptionSignature
      })
      
      const noVotesDecrypted = await this.fhevmClient.decrypt({
        handle: results[1],
        contractAddress: CONFIG.votingContractAddress,
        signature: decryptionSignature
      })
      
      const totalVotesDecrypted = await this.fhevmClient.decrypt({
        handle: results[2],
        contractAddress: CONFIG.votingContractAddress,
        signature: decryptionSignature
      })
      
      const yesVotes = Number(yesVotesDecrypted)
      const noVotes = Number(noVotesDecrypted)
      const totalVotes = Number(totalVotesDecrypted)
      
      console.log(chalk.green('   Voting Results:'))
      console.log(chalk.gray(`     Yes votes: ${yesVotes}`))
      console.log(chalk.gray(`     No votes: ${noVotes}`))
      console.log(chalk.gray(`     Total votes: ${totalVotes}`))

      demoData.endTime = new Date()
      demoData.success = true
      demoData.results = { yesVotes, noVotes, totalVotes }
      
      console.log(chalk.green.bold('\n🎉 Voting Demo Completed Successfully!'))
      console.log(chalk.gray('   ✅ Encrypted vote casting'))
      console.log(chalk.gray('   ✅ EIP-712 signature generation'))
      console.log(chalk.gray('   ✅ Confidential result decryption'))
      console.log(chalk.gray('   ✅ Session management'))

    } catch (error) {
      demoData.endTime = new Date()
      demoData.success = false
      demoData.error = error.message
      
      console.log(chalk.red.bold('\n❌ Voting Demo Failed'))
      console.log(chalk.red(`   Error: ${error.message}`))
    }

    this.sessionData.demos.push(demoData)
    return demoData
  }

  async runCounterDemo() {
    console.log(chalk.blue.bold('\n🔢 FHEVM Counter Demo'))
    console.log(chalk.gray('Experience confidential counter operations\n'))

    const demoData = {
      name: 'Counter Demo',
      startTime: new Date(),
      operations: []
    }

    try {
      // Check contract address
      if (!process.env.COUNTER_CONTRACT_ADDRESS || process.env.COUNTER_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.log(chalk.yellow('⚠️  COUNTER_CONTRACT_ADDRESS not set in .env'))
        console.log(chalk.gray('   Using default address (may not work)'))
      }

      const contract = new ethers.Contract(CONFIG.counterContractAddress, COUNTER_ABI, this.signer)
      const userAddress = await this.signer.getAddress()

      // Get initial count
      console.log(chalk.cyan('\n📊 Step 1: Reading initial count...'))
      const spinner1 = ora('Fetching encrypted count...').start()
      
      const initialCountHandle = await contract.getCount()
      spinner1.succeed(chalk.green('Initial count retrieved'))
      console.log(chalk.gray(`   Encrypted handle: ${initialCountHandle.substring(0, 20)}...`))

      // Get increment amount
      const { incrementAmount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'incrementAmount',
          message: 'Enter increment amount:',
          default: 5,
          validate: (value) => value > 0 || 'Amount must be positive'
        }
      ])

      // Create encrypted increment
      console.log(chalk.cyan('\n🔐 Step 2: Creating encrypted increment...'))
      const spinner2 = ora('Encrypting increment amount...').start()
      
      const incrementEncryptedResult = await this.fhevmClient.encrypt(incrementAmount, {
        publicKey: userAddress,
        contractAddress: CONFIG.counterContractAddress
      })
      
      if (!incrementEncryptedResult?.handles?.[0] || !incrementEncryptedResult.inputProof) {
        throw new Error('Increment encryption failed')
      }
      
      spinner2.succeed(chalk.green('Increment encrypted successfully'))

      // Execute increment
      console.log(chalk.cyan('\n📤 Step 3: Executing increment transaction...'))
      const spinner3 = ora('Sending increment transaction...').start()
      
      const incrementTx = await contract.increment(
        incrementEncryptedResult.handles[0],
        incrementEncryptedResult.inputProof
      )
      
      spinner3.succeed(chalk.green('Increment transaction sent'))
      console.log(chalk.gray(`   Transaction: ${incrementTx.hash}`))
      
      const incrementReceipt = await incrementTx.wait()
      console.log(chalk.green(`   Confirmed: ${incrementReceipt.hash}`))
      
      demoData.operations.push({
        type: 'increment',
        amount: incrementAmount,
        txHash: incrementTx.hash
      })

      // Wait for state update
      console.log(chalk.cyan('\n⏳ Step 4: Waiting for state update...'))
      const spinner4 = ora('Waiting for blockchain state update...').start()
      await new Promise(resolve => setTimeout(resolve, 3000))
      spinner4.succeed(chalk.green('State updated'))

      // Decrypt count
      console.log(chalk.cyan('\n🔓 Step 5: Decrypting new count...'))
      const spinner5 = ora('Generating EIP-712 signature...').start()
      
      const decryptionSignatureStorage = new Map()
      const contractAddresses = [CONFIG.counterContractAddress]
      
      const decryptionSignature = await FhevmDecryptionSignature.loadOrSign(
        this.fhevmClient.getInstance(),
        contractAddresses,
        this.signer,
        decryptionSignatureStorage
      )
      
      spinner5.succeed(chalk.green('EIP-712 signature ready'))
      
      const updatedCountHandle = await contract.getCount()
      const decryptedCount = await this.fhevmClient.decrypt({
        handle: updatedCountHandle,
        contractAddress: CONFIG.counterContractAddress,
        signature: decryptionSignature
      })
      
      const finalCount = Number(decryptedCount)
      console.log(chalk.green(`   Count after increment: ${finalCount}`))

      // Ask for decrement
      const { doDecrement } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'doDecrement',
          message: 'Would you like to test decrement operation?',
          default: true
        }
      ])

      if (doDecrement) {
        const { decrementAmount } = await inquirer.prompt([
          {
            type: 'number',
            name: 'decrementAmount',
            message: 'Enter decrement amount:',
            default: 2,
            validate: (value) => value > 0 || 'Amount must be positive'
          }
        ])

        // Create encrypted decrement
        console.log(chalk.cyan('\n🔐 Step 6: Creating encrypted decrement...'))
        const spinner6 = ora('Encrypting decrement amount...').start()
        
        const decrementEncryptedResult = await this.fhevmClient.encrypt(decrementAmount, {
          publicKey: userAddress,
          contractAddress: CONFIG.counterContractAddress
        })
        
        if (!decrementEncryptedResult?.handles?.[0] || !decrementEncryptedResult.inputProof) {
          throw new Error('Decrement encryption failed')
        }
        
        spinner6.succeed(chalk.green('Decrement encrypted successfully'))

        // Execute decrement
        console.log(chalk.cyan('\n📤 Step 7: Executing decrement transaction...'))
        const spinner7 = ora('Sending decrement transaction...').start()
        
        const decrementTx = await contract.decrement(
          decrementEncryptedResult.handles[0],
          decrementEncryptedResult.inputProof
        )
        
        spinner7.succeed(chalk.green('Decrement transaction sent'))
        console.log(chalk.gray(`   Transaction: ${decrementTx.hash}`))
        
        const decrementReceipt = await decrementTx.wait()
        console.log(chalk.green(`   Confirmed: ${decrementReceipt.hash}`))
        
        demoData.operations.push({
          type: 'decrement',
          amount: decrementAmount,
          txHash: decrementTx.hash
        })

        // Wait for state update
        console.log(chalk.cyan('\n⏳ Step 8: Waiting for state update...'))
        const spinner8 = ora('Waiting for blockchain state update...').start()
        await new Promise(resolve => setTimeout(resolve, 3000))
        spinner8.succeed(chalk.green('State updated'))

        // Final count
        console.log(chalk.cyan('\n📊 Step 9: Reading final count...'))
        const finalCountHandle = await contract.getCount()
        const finalDecryptedCount = await this.fhevmClient.decrypt({
          handle: finalCountHandle,
          contractAddress: CONFIG.counterContractAddress,
          signature: decryptionSignature
        })
        
        const finalCountValue = Number(finalDecryptedCount)
        console.log(chalk.green(`   Final count: ${finalCountValue}`))
      }

      demoData.endTime = new Date()
      demoData.success = true
      
      console.log(chalk.green.bold('\n🎉 Counter Demo Completed Successfully!'))
      console.log(chalk.gray('   ✅ Encrypted increment operations'))
      console.log(chalk.gray('   ✅ EIP-712 signature generation'))
      console.log(chalk.gray('   ✅ Confidential count decryption'))
      console.log(chalk.gray('   ✅ Secure decrement operations'))

    } catch (error) {
      demoData.endTime = new Date()
      demoData.success = false
      demoData.error = error.message
      
      console.log(chalk.red.bold('\n❌ Counter Demo Failed'))
      console.log(chalk.red(`   Error: ${error.message}`))
    }

    this.sessionData.demos.push(demoData)
    return demoData
  }

  async runTestMode() {
    console.log(chalk.blue.bold('\n🔍 FHEVM Test Mode'))
    console.log(chalk.gray('Verify your setup and configuration\n'))

    const demoData = {
      name: 'Test Mode',
      startTime: new Date(),
      operations: []
    }

    try {
      console.log(chalk.cyan('🔧 Testing configuration...'))
      
      // Test 1: Environment variables
      console.log(chalk.gray('\n1. Environment Variables:'))
      const requiredVars = ['PRIVATE_KEY', 'RPC_URL']
      const optionalVars = ['BANK_CONTRACT_ADDRESS', 'VOTING_CONTRACT_ADDRESS', 'COUNTER_CONTRACT_ADDRESS']
      
      requiredVars.forEach(varName => {
        if (process.env[varName] && process.env[varName] !== '0x' + '0'.repeat(64)) {
          console.log(chalk.green(`   ✅ ${varName}: Set`))
        } else {
          console.log(chalk.red(`   ❌ ${varName}: Not set or invalid`))
        }
      })
      
      optionalVars.forEach(varName => {
        if (process.env[varName] && process.env[varName] !== '0x0000000000000000000000000000000000000000') {
          console.log(chalk.green(`   ✅ ${varName}: ${process.env[varName]}`))
        } else {
          console.log(chalk.yellow(`   ⚠️  ${varName}: Not set (using default)`))
        }
      })

      // Test 2: Network connection
      console.log(chalk.gray('\n2. Network Connection:'))
      const spinner2 = ora('Testing RPC connection...').start()
      
      try {
        const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
        const network = await provider.getNetwork()
        const blockNumber = await provider.getBlockNumber()
        
        spinner2.succeed(chalk.green('RPC connection successful'))
        console.log(chalk.gray(`   Network: ${network.name} (${network.chainId})`))
        console.log(chalk.gray(`   Block: ${blockNumber}`))
      } catch (networkError) {
        spinner2.fail(chalk.red('RPC connection failed'))
        console.log(chalk.red(`   Error: ${networkError.message}`))
        throw networkError
      }

      // Test 3: Wallet setup
      console.log(chalk.gray('\n3. Wallet Setup:'))
      const spinner3 = ora('Testing wallet...').start()
      
      try {
        const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
        const signer = new ethers.Wallet(CONFIG.privateKey, provider)
        const address = await signer.getAddress()
        const balance = await provider.getBalance(address)
        
        spinner3.succeed(chalk.green('Wallet setup successful'))
        console.log(chalk.gray(`   Address: ${address}`))
        console.log(chalk.gray(`   Balance: ${ethers.formatEther(balance)} ETH`))
        
        if (balance === 0n) {
          console.log(chalk.yellow('   ⚠️  Wallet has no ETH - transactions may fail'))
        }
      } catch (walletError) {
        spinner3.fail(chalk.red('Wallet setup failed'))
        console.log(chalk.red(`   Error: ${walletError.message}`))
        throw walletError
      }

      // Test 4: FHEVM client
      console.log(chalk.gray('\n4. FHEVM Client:'))
      const spinner4 = ora('Testing FHEVM client...').start()
      
      try {
        const fhevmConfig = {
          rpcUrl: CONFIG.rpcUrl,
          chainId: CONFIG.chainId
        }
        
        const fhevmClient = await createFHEVMClientForNode(fhevmConfig)
        
        spinner4.succeed(chalk.green('FHEVM client created successfully'))
        console.log(chalk.gray(`   Client type: ${fhevmClient.constructor.name}`))
      } catch (fhevmError) {
        spinner4.fail(chalk.red('FHEVM client creation failed'))
        console.log(chalk.red(`   Error: ${fhevmError.message}`))
        throw fhevmError
      }

      // Test 5: Contract accessibility (if addresses are set)
      console.log(chalk.gray('\n5. Contract Accessibility:'))
      
      const contracts = [
        { name: 'Bank', address: CONFIG.bankContractAddress, abi: BANK_ABI },
        { name: 'Voting', address: CONFIG.votingContractAddress, abi: VOTING_ABI },
        { name: 'Counter', address: CONFIG.counterContractAddress, abi: COUNTER_ABI }
      ]
      
      for (const contract of contracts) {
        if (contract.address && contract.address !== '0x0000000000000000000000000000000000000000') {
          const spinner = ora(`Testing ${contract.name} contract...`).start()
          
          try {
            const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
            const signer = new ethers.Wallet(CONFIG.privateKey, provider)
            const contractInstance = new ethers.Contract(contract.address, contract.abi, signer)
            
            // Try to call a view function
            if (contract.name === 'Bank') {
              await contractInstance.getEncryptedBalance(await signer.getAddress())
            } else if (contract.name === 'Voting') {
              await contractInstance.sessionCounter()
            } else if (contract.name === 'Counter') {
              await contractInstance.getCount()
            }
            
            spinner.succeed(chalk.green(`${contract.name} contract accessible`))
            console.log(chalk.gray(`   Address: ${contract.address}`))
          } catch (contractError) {
            spinner.fail(chalk.red(`${contract.name} contract not accessible`))
            console.log(chalk.red(`   Error: ${contractError.message}`))
          }
        } else {
          console.log(chalk.yellow(`   ⚠️  ${contract.name} contract address not set`))
        }
      }

      demoData.endTime = new Date()
      demoData.success = true
      
      console.log(chalk.green.bold('\n🎉 Test Mode Completed!'))
      console.log(chalk.gray('   ✅ Configuration verified'))
      console.log(chalk.gray('   ✅ Network connection working'))
      console.log(chalk.gray('   ✅ Wallet setup correct'))
      console.log(chalk.gray('   ✅ FHEVM client ready'))
      console.log(chalk.gray('   ✅ Contract accessibility checked'))

    } catch (error) {
      demoData.endTime = new Date()
      demoData.success = false
      demoData.error = error.message
      
      console.log(chalk.red.bold('\n❌ Test Mode Failed'))
      console.log(chalk.red(`   Error: ${error.message}`))
    }

    this.sessionData.demos.push(demoData)
    return demoData
  }

  async showSessionSummary() {
    console.log(chalk.blue.bold('\n📊 Session Summary'))
    console.log(chalk.gray('=' .repeat(50)))
    
    const totalDemos = this.sessionData.demos.length
    const successfulDemos = this.sessionData.demos.filter(d => d.success).length
    const failedDemos = totalDemos - successfulDemos
    
    console.log(chalk.gray(`   Total demos: ${totalDemos}`))
    console.log(chalk.green(`   Successful: ${successfulDemos}`))
    if (failedDemos > 0) {
      console.log(chalk.red(`   Failed: ${failedDemos}`))
    }
    
    const duration = new Date() - this.sessionData.startTime
    console.log(chalk.gray(`   Duration: ${Math.round(duration / 1000)}s`))
    
    // Show demo details
    this.sessionData.demos.forEach((demo, index) => {
      const status = demo.success ? chalk.green('✅') : chalk.red('❌')
      const duration = demo.endTime - demo.startTime
      console.log(chalk.gray(`   ${index + 1}. ${demo.name} ${status} (${Math.round(duration / 1000)}s)`))
      
      if (!demo.success && demo.error) {
        console.log(chalk.red(`      Error: ${demo.error}`))
      }
    })

    // Save transcript if in record mode
    if (this.recordMode) {
      await this.saveTranscript()
    }
  }

  async saveTranscript() {
    const transcript = {
      session: this.sessionData,
      timestamp: new Date().toISOString(),
      config: {
        rpcUrl: CONFIG.rpcUrl,
        chainId: CONFIG.chainId,
        wallet: await this.signer.getAddress()
      }
    }

    const filename = `fhevm-wizard-session-${Date.now()}.json`
    const filepath = path.join(process.cwd(), filename)
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(transcript, null, 2))
      console.log(chalk.green(`\n📄 Session transcript saved: ${filename}`))
    } catch (error) {
      console.log(chalk.yellow(`\n⚠️  Could not save transcript: ${error.message}`))
    }
  }

  async run() {
    try {
      await this.init()
      
      while (true) {
        const demo = await this.showMainMenu()
        
        if (demo === 'exit') {
          break
        }
        
        if (demo === 'all') {
          await this.runBankDemo()
          await this.runVotingDemo()
          await this.runCounterDemo()
        } else if (demo === 'bank') {
          await this.runBankDemo()
        } else if (demo === 'voting') {
          await this.runVotingDemo()
        } else if (demo === 'counter') {
          await this.runCounterDemo()
        } else if (demo === 'test') {
          await this.runTestMode()
        }
        
        // Ask if user wants to continue
        const { continueWizard } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continueWizard',
            message: 'Would you like to run another demo?',
            default: true
          }
        ])
        
        if (!continueWizard) {
          break
        }
      }
      
      await this.showSessionSummary()
      
      console.log(chalk.blue.bold('\n👋 Thanks for using FHEVM Wizard!'))
      console.log(chalk.gray('   Universal FHEVM SDK - Making confidential computing accessible'))
      
    } catch (error) {
      console.error(chalk.red.bold('\n💥 Wizard crashed!'))
      console.error(chalk.red(`   Error: ${error.message}`))
      process.exit(1)
    }
  }
}

// Run the wizard
const wizard = new FHEVMWizard()
wizard.run().catch(console.error)
