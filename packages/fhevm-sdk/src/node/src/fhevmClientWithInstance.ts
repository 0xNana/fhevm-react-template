import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node'
import type { FhevmInstance } from '../../types.js'
import type { FHEVMConfig, FHEVMEvents, EncryptionOptions, DecryptionOptions } from '../../types.js'
import { FHEVMError, FHEVMNotInitializedError, FHEVMEncryptionError, FHEVMDecryptionError } from '../../types.js'
import { ethers } from 'ethers'
import type { Eip1193Provider } from 'ethers'

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

      // Create encrypted input using the real instance (following our working pattern)
      const input = this._instance.createEncryptedInput(contractAddress, publicKey)
      input.add32(value)
      const encrypted = await input.encrypt()
      
      if (!encrypted || !encrypted.handles || !encrypted.handles[0]) {
        throw new FHEVMEncryptionError("Encryption failed - no handle returned")
      }
      
      if (!encrypted.inputProof) {
        throw new FHEVMEncryptionError("Encryption failed - no inputProof returned")
      }

      // Convert Uint8Array to hex strings (following our working pattern)
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
        // Use public decryption (no signature required)
        const decrypted = await this._instance.publicDecrypt([handle])
        return Number(decrypted)
      } else if (signature) {
        // Use user decryption with signature (following our working pattern)
        if (typeof signature === 'string') {
          // If signature is a string, we can't extract the keys - this is an error
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
        
        // Handle different possible result structures (following our working pattern)
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

  /**
   * Get the current error (if any)
   */
  getError(): Error | null {
    return null // Real instance doesn't have errors in this context
  }

  /**
   * Refresh/reinitialize the client
   */
  async refresh(): Promise<void> {
    // For real instances, we need to recreate
    const eip1193Provider = createEip1193Provider(this._config.rpcUrl, this._config.chainId)
    const config = {
      ...SepoliaConfig,
      network: eip1193Provider
    }
    const newInstance = await createInstance(config)
    this._instance = newInstance
  }

  /**
   * Destroy the client
   */
  destroy(): void {
    this._isInitialized = false
    // Note: FhevmInstance doesn't have a destroy method
  }

  // Private methods

  private _ensureInitialized(): void {
    if (!this._isInitialized || !this._instance) {
      throw new FHEVMNotInitializedError()
    }
  }
}

/**
 * Create an EIP-1193 compatible provider wrapper for Node.js
 * This is required by the relayer SDK to interact with the blockchain
 */
function createEip1193Provider(rpcUrl: string, chainId: number): Eip1193Provider {
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  
  return {
    request: async ({ method, params }: { method: string; params?: any[] }) => {
      switch (method) {
        case 'eth_chainId':
          return `0x${chainId.toString(16)}`
        case 'eth_accounts':
          return []
        case 'eth_requestAccounts':
          return []
        case 'eth_call':
          if (!params || !params[0]) {
            throw new Error('eth_call requires transaction object')
          }
          return await provider.call(params[0])
        case 'eth_sendTransaction':
          if (!params || !params[0]) {
            throw new Error('eth_sendTransaction requires transaction object')
          }
          // Note: This is a simplified implementation
          // In practice, you'd need a signer to send transactions
          throw new Error('eth_sendTransaction not supported in read-only provider')
        case 'eth_getBlockByNumber':
        case 'eth_getBlockByHash':
          if (!params) {
            throw new Error(`${method} requires parameters`)
          }
          return await provider.send(method, params)
        case 'eth_getTransactionReceipt':
          if (!params || !params[0]) {
            throw new Error('eth_getTransactionReceipt requires transaction hash')
          }
          return await provider.getTransactionReceipt(params[0])
        default:
          // Fallback to provider.send for other methods
          return await provider.send(method, params || [])
      }
    },
    on: () => {},
    removeListener: () => {}
  } as Eip1193Provider
}

/**
 * Create a real FHEVM client for Node.js using the relayer SDK
 */
export async function createRealFHEVMClientForNode(
  config: FHEVMConfig, 
  events?: FHEVMEvents
): Promise<FHEVMClientWithInstance> {
  try {
    console.log('[FHEVM] Creating real FHEVM instance...')
    
    // Create EIP-1193 provider wrapper (required by relayer SDK)
    const eip1193Provider = createEip1193Provider(config.rpcUrl, config.chainId)
    
    // Use SepoliaConfig from relayer SDK and override network with EIP-1193 provider
    const fhevmConfig = {
      ...SepoliaConfig,
      network: eip1193Provider
    }
    
    const fhevmInstance = await createInstance(fhevmConfig)
    console.log('[FHEVM] Real FHEVM instance created successfully!')
    
    return new FHEVMClientWithInstance(fhevmInstance, config, events)
  } catch (error) {
    console.error('[FHEVM] Failed to create real instance:', error)
    throw new FHEVMError(
      `Failed to create real FHEVM instance: ${error instanceof Error ? error.message : String(error)}`,
      "REAL_INSTANCE_CREATION_FAILED",
      error
    )
  }
}
