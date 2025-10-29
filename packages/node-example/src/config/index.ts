import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { ethers } from 'ethers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Configuration management for Node.js FHEVM tools
 * 
 * Loads environment variables and provides configuration utilities
 */
export interface AppConfig {
  rpcUrl: string
  chainId: number
  contracts: {
    counter: string
    bank: string
    voting: string
  }
  server: {
    port: number
    host: string
  }
  privateKey?: string | undefined
  mnemonic?: string | undefined
  verbose: boolean
  dryRun: boolean
}

/**
 * Load configuration from environment
 */
export function loadConfig(configPath?: string): AppConfig {
  // Load environment variables
  if (configPath) {
    config({ path: configPath })
  } else {
    config()
  }

  // Validate required environment variables
  const requiredVars = [
    'RPC_URL',
    'CHAIN_ID',
    'COUNTER_CONTRACT_ADDRESS',
    'BANK_CONTRACT_ADDRESS',
    'VOTING_CONTRACT_ADDRESS'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Check for either PRIVATE_KEY or MNEMONIC
  const hasPrivateKey = !!process.env.PRIVATE_KEY
  const hasMnemonic = !!process.env.MNEMONIC
  
  if (!hasPrivateKey && !hasMnemonic) {
    throw new Error('Please set either PRIVATE_KEY or MNEMONIC in .env file')
  }

  // Derive private key from mnemonic if needed
  let privateKey = process.env.PRIVATE_KEY
  if (!privateKey && process.env.MNEMONIC) {
    try {
      const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC)
      privateKey = wallet.privateKey
    } catch (error) {
      throw new Error(`Invalid mnemonic: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return {
    rpcUrl: process.env.RPC_URL!,
    chainId: parseInt(process.env.CHAIN_ID!),
    contracts: {
      counter: process.env.COUNTER_CONTRACT_ADDRESS!,
      bank: process.env.BANK_CONTRACT_ADDRESS!,
      voting: process.env.VOTING_CONTRACT_ADDRESS!
    },
    server: {
      port: parseInt(process.env.PORT || '3002'),
      host: process.env.HOST || 'localhost'
    },
    privateKey: privateKey,
    mnemonic: process.env.MNEMONIC,
    verbose: process.env.VERBOSE === 'true',
    dryRun: process.env.DRY_RUN === 'true'
  }
}

/**
 * Get contract configuration
 */
export function getContractConfig(contractName: keyof AppConfig['contracts'], appConfig: AppConfig) {
  return {
    address: appConfig.contracts[contractName],
    rpcUrl: appConfig.rpcUrl,
    privateKey: appConfig.privateKey
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = []

  if (!config.rpcUrl) {
    errors.push('RPC_URL is required')
  }

  if (!config.chainId || isNaN(config.chainId)) {
    errors.push('CHAIN_ID must be a valid number')
  }

  if (!config.contracts.counter) {
    errors.push('COUNTER_CONTRACT_ADDRESS is required')
  }

  if (!config.contracts.bank) {
    errors.push('BANK_CONTRACT_ADDRESS is required')
  }

  if (!config.contracts.voting) {
    errors.push('VOTING_CONTRACT_ADDRESS is required')
  }

  return errors
}
