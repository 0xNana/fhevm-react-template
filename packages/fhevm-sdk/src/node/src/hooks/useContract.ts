import { ethers } from 'ethers'
import type { ContractHookConfig, ContractHookResult } from './types.js'

/**
 * Contract hook for Node.js
 * 
 * Provides a React-like hook interface for contract interactions.
 * Similar to wagmi's useContract but for Node.js environments.
 */
export function useContract(config: ContractHookConfig): ContractHookResult {
  let contract: any = null
  let isReady = false
  let error: Error | null = null

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(
      config.provider?.rpcUrl || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      {
        chainId: config.provider?.chainId || 11155111,
        name: 'sepolia'
      }
    )

    // Create contract instance
    contract = new ethers.Contract(
      config.address,
      config.abi,
      provider
    )

    isReady = true
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err))
    isReady = false
  }

  return {
    contract,
    isReady,
    error,
    address: config.address,
    abi: config.abi
  }
}
