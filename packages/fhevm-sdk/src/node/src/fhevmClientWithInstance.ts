import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node'
import type { FhevmInstance, FhevmInstanceConfig } from '../../types.js'
import type { FHEVMConfig, FHEVMEvents, EncryptionOptions, DecryptionOptions } from '../../types.js'
import { FHEVMError, FHEVMNotInitializedError, FHEVMEncryptionError, FHEVMDecryptionError } from '../../types.js'
import { ethers } from 'ethers'

const getZamaEthereumConfig = (chainId: number): FhevmInstanceConfig => {
  if (chainId === 11155111) {
    if (!SepoliaConfig) {
      throw new FHEVMError('SepoliaConfig not available from relayer SDK', 'CONFIG_UNAVAILABLE')
    }
    return SepoliaConfig as FhevmInstanceConfig
  }
  throw new FHEVMError(`Unsupported chainId: ${chainId}`, 'UNSUPPORTED_CHAIN')
}

/**
 * Create an EIP-1193 compatible provider from an RPC URL
 * This is required for Node.js environments where we need to wrap ethers.JsonRpcProvider
 * to match the EIP-1193 interface expected by the relayer SDK
 * 
 * Based on the pattern from the working example that uses SepoliaConfig
 */
function createEIP1193Provider(rpcUrl: string, chainId: number): any {
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const chainIdHex = `0x${chainId.toString(16)}`
  
  return {
    request: async ({ method, params }: { method: string; params?: any[] }) => {
      switch (method) {
        case 'eth_chainId':
          return chainIdHex
        case 'eth_accounts':
          return []
        case 'eth_requestAccounts':
          return []
        case 'eth_call':
          if (params && params[0]) {
            return await provider.call(params[0])
          }
          throw new Error('eth_call requires transaction object')
        case 'eth_sendTransaction':
          if (params && params[0]) {
            throw new Error('eth_sendTransaction requires a signer. Use a wallet provider instead.')
          }
          throw new Error('eth_sendTransaction requires transaction object')
        case 'eth_getBlockByNumber':
        case 'eth_getBlockByHash':
        case 'eth_getTransactionReceipt':
        case 'eth_getCode':
        case 'eth_estimateGas':
        case 'eth_blockNumber':
        case 'eth_getBalance':
          return await provider.send(method, params || [])
        default:
          try {
            return await provider.send(method, params || [])
          } catch (error) {
            throw new Error(`Unsupported method: ${method}`)
          }
      }
    },
    on: () => {},
    removeListener: () => {}
  }
}

/**
 * FHEVM Client with Real Instance - Node.js implementation
 * 
 * This class wraps a real FhevmInstance from the relayer SDK
 * and provides the same interface as the core FHEVMClient.
 */
export class FHEVMClientWithInstance {
  private _instance: FhevmInstance
  private _config: FHEVMConfig
  private _isInitialized: boolean = false

  constructor(instance: FhevmInstance, config: FHEVMConfig, _events?: FHEVMEvents) {
    this._instance = instance
    this._config = config
    this._isInitialized = true
  }

  /**
   * Initialize the client (already initialized with real instance)
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      return
    }
    throw new FHEVMError("Client already initialized with real instance", "ALREADY_INITIALIZED")
  }

  /**
   * Encrypt a value using the real FhevmInstance
   */
  async encrypt(value: number, options: EncryptionOptions): Promise<{ handles: string[], inputProof: string }> {
    this._ensureInitialized()

    try {
      const { publicKey, contractAddress } = options
      
      if (!contractAddress) {
        throw new FHEVMEncryptionError("Contract address is required for encryption")
      }

      const input = this._instance.createEncryptedInput(contractAddress, publicKey)
      input.add32(value)
      const encrypted = await input.encrypt()
      
      if (!encrypted || !encrypted.handles || !encrypted.handles[0]) {
        throw new FHEVMEncryptionError("Encryption failed - no handle returned")
      }
      
      if (!encrypted.inputProof) {
        throw new FHEVMEncryptionError("Encryption failed - no inputProof returned")
      }

      const toHex = (data: Uint8Array) => {
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }

      return {
        handles: encrypted.handles.map(handle => toHex(handle)),
        inputProof: toHex(encrypted.inputProof)
      }
    } catch (error) {
      throw new FHEVMEncryptionError(
        `Failed to encrypt value: ${error instanceof Error ? error.message : String(error)}`,
        error
      )
    }
  }

  /**
   * Decrypt an encrypted value using the real FhevmInstance
   */
  async decrypt(options: DecryptionOptions): Promise<number> {
    this._ensureInitialized()

    try {
      const { handle, contractAddress, signature, usePublicDecrypt } = options

      if (usePublicDecrypt) {
        const result = await this._instance.publicDecrypt([handle])
        
        let decryptedValue: number | bigint | undefined
        
        if (result && typeof result === 'object') {
          if (result.clearValues && typeof result.clearValues === 'object') {
            const clearValues = result.clearValues as Record<string, number | bigint>
            decryptedValue = clearValues[handle] || Object.values(clearValues)[0]
          } else if (Array.isArray(result)) {
            decryptedValue = result[0]
          } else {
            const resultObj = result as unknown as Record<string, number | bigint>
            decryptedValue = resultObj[handle] || Object.values(resultObj)[0]
          }
        } else {
          decryptedValue = result as number | bigint
        }
        
        if (decryptedValue === undefined || decryptedValue === null) {
          throw new FHEVMDecryptionError('Decryption returned no value')
        }
        
        return typeof decryptedValue === 'bigint' ? Number(decryptedValue) : Number(decryptedValue)
      } else if (signature) {
        if (typeof signature === 'string') {
          throw new FHEVMDecryptionError('String signature not supported - please use FhevmDecryptionSignature object')
        }
        
        const decrypted = await this._instance.userDecrypt(
          [{ handle, contractAddress }],
          signature.privateKey,
          signature.publicKey,
          signature.signature,
          signature.contractAddresses,
          signature.userAddress,
          signature.startTimestamp,
          signature.durationDays
        )
        
        let decryptedValue: number
        if (decrypted && typeof decrypted === 'object' && !Array.isArray(decrypted)) {
          const handleKeys = Object.keys(decrypted)
          if (handleKeys.length > 0) {
            const firstKey = handleKeys[0]
            if (firstKey) {
              decryptedValue = (decrypted as any)[firstKey]
            } else {
              throw new FHEVMDecryptionError('Decryption result object has no valid keys')
            }
          } else {
            throw new FHEVMDecryptionError('Decryption result object has no keys')
          }
        } else if (Array.isArray(decrypted) && decrypted.length > 0) {
          decryptedValue = decrypted[0]
        } else if (typeof decrypted === 'number') {
          decryptedValue = decrypted
        } else if (typeof decrypted === 'bigint') {
          decryptedValue = Number(decrypted)
        } else {
          throw new FHEVMDecryptionError(`Unexpected decryption result structure: ${JSON.stringify(decrypted)}`)
        }
        
        return decryptedValue
      } else {
        throw new FHEVMDecryptionError("Either signature or usePublicDecrypt must be provided")
      }
    } catch (error) {
      throw new FHEVMDecryptionError(
        `Failed to decrypt value: ${error instanceof Error ? error.message : String(error)}`,
        error
      )
    }
  }

  /**
   * Get the FhevmInstance (for advanced usage)
   */
  getInstance(): FhevmInstance {
    return this._instance
  }

  /**
   * Check if the client is ready
   */
  isReady(): boolean {
    return this._isInitialized && this._instance !== null
  }

  /**
   * Get the current status
   */
  getStatus(): string {
    return this.isReady() ? "ready" : "error"
  }

  getError(): Error | null {
    return null
  }

  async refresh(): Promise<void> {
    const baseConfig = getZamaEthereumConfig(this._config.chainId)
    const eip1193Provider = createEIP1193Provider(this._config.rpcUrl, this._config.chainId)
    const newInstance = await createInstance({
      ...baseConfig,
      network: eip1193Provider
    })
    this._instance = newInstance
  }

  destroy(): void {
    this._isInitialized = false
  }

  private _ensureInitialized(): void {
    if (!this._isInitialized || !this._instance) {
      throw new FHEVMNotInitializedError()
    }
  }
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  maxDelayMs: number = 10000
): Promise<T> {
  let lastError: Error | unknown
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes('UNSUPPORTED_CHAIN') || 
          errorMessage.includes('Invalid RPC') ||
          errorMessage.includes('Invalid configuration')) {
        throw error
      }
      
      if (attempt === maxRetries - 1) {
        throw error
      }
      
      const delay = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs)
      console.log(`[FHEVM] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}
  
export async function createRealFHEVMClientForNode(
  config: FHEVMConfig, 
  events?: FHEVMEvents,
  retryOptions?: { maxRetries?: number; initialDelayMs?: number; maxDelayMs?: number }
): Promise<FHEVMClientWithInstance> {
  const maxRetries = retryOptions?.maxRetries ?? 3
  const initialDelayMs = retryOptions?.initialDelayMs ?? 1000
  const maxDelayMs = retryOptions?.maxDelayMs ?? 10000

  try {
    console.log('[FHEVM] Creating real FHEVM instance...')
    console.log(`[FHEVM] RPC URL: ${config.rpcUrl}`)
    console.log(`[FHEVM] Chain ID: ${config.chainId}`)

    const baseConfig = getZamaEthereumConfig(config.chainId)
    
    console.log(`[FHEVM] Relayer URL: ${baseConfig.relayerUrl}`)
    console.log(`[FHEVM] ACL Contract: ${baseConfig.aclContractAddress}`)
    
    const eip1193Provider = createEIP1193Provider(config.rpcUrl, config.chainId)
    
    const fhevmConfig: FhevmInstanceConfig = {
      ...baseConfig,
      network: eip1193Provider
    }
    
    const fhevmInstance = await retryWithBackoff(
      async () => {
        try {
          return await createInstance(fhevmConfig)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('Bad JSON') || errorMessage.includes("didn't response correctly")) {
            console.error(`[FHEVM] Relayer communication error: ${errorMessage}`)
            if (error && typeof error === 'object') {
              try {
                const errorDetails: Record<string, unknown> = {}
                if ('cause' in error) {
                  errorDetails.cause = (error as { cause?: unknown }).cause
                }
                if ('stack' in error) {
                  errorDetails.stack = (error as { stack?: unknown }).stack
                }
                if ('code' in error) {
                  errorDetails.code = (error as { code?: unknown }).code
                }
                console.error(`[FHEVM] Error details:`, JSON.stringify(errorDetails, null, 2))
              } catch {
              }
            }
          }
          throw error
        }
      },
      maxRetries,
      initialDelayMs,
      maxDelayMs
    )
    
    console.log('[FHEVM] Real FHEVM instance created successfully!')
    
    return new FHEVMClientWithInstance(fhevmInstance, config, events)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[FHEVM] Failed to create real instance after retries:', errorMessage)
    
    if (errorMessage.includes('Bad JSON') || errorMessage.includes("didn't response correctly") || errorMessage.includes('fetch')) {
      const relayerUrl = getZamaEthereumConfig(config.chainId).relayerUrl
      
      throw new FHEVMError(
        `Relayer service communication failed after ${maxRetries} attempts. This may indicate:\n` +
        `  1. The relayer service at ${relayerUrl} is temporarily unavailable\n` +
        `  2. Network connectivity issues\n` +
        `  3. Invalid RPC URL: ${config.rpcUrl}\n` +
        `\nTo troubleshoot:\n` +
        `  - Verify your RPC URL is correct and accessible\n` +
        `  - Check for network/firewall restrictions\n` +
        `  - Try again later if the relayer service is experiencing issues\n` +
        `\nThe application will continue in mock mode for testing purposes.`,
        "REAL_INSTANCE_CREATION_FAILED",
        error
      )
    }
    
    throw new FHEVMError(
      `Failed to create real FHEVM instance after ${maxRetries} attempts: ${errorMessage}`,
      "REAL_INSTANCE_CREATION_FAILED",
      error
    )
  }
}
