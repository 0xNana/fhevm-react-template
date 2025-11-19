import { createInstance } from '@zama-fhe/relayer-sdk/node'
import type { FhevmInstance, FhevmInstanceConfig } from '../../types.js'
import type { FHEVMConfig, FHEVMEvents, EncryptionOptions, DecryptionOptions } from '../../types.js'
import { FHEVMError, FHEVMNotInitializedError, FHEVMEncryptionError, FHEVMDecryptionError } from '../../types.js'
import { ethers } from 'ethers'

// ZamaEthereumConfig addresses for Sepolia (chainId 11155111)
// These addresses are dynamically resolved by ZamaEthereumConfig based on chainId
const getZamaEthereumConfig = (chainId: number): FhevmInstanceConfig => {
  // For Sepolia (11155111) - default for now
  // In v0.9, ZamaEthereumConfig dynamically resolves based on chainId
  if (chainId === 11155111) {
    return {
      aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
      kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
      inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
      verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
      verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
      chainId: 11155111,
      gatewayChainId: 55815,
      relayerUrl: 'https://relayer.testnet.zama.cloud',
    } as FhevmInstanceConfig
  }
  // For other chains, you may need to add their addresses
  throw new FHEVMError(`Unsupported chainId: ${chainId}`, 'UNSUPPORTED_CHAIN')
}

/**
 * Create an EIP-1193 compatible provider from an RPC URL
 * This is required for Node.js environments where we need to wrap ethers.JsonRpcProvider
 * to match the EIP-1193 interface expected by the relayer SDK
 */
function createEIP1193Provider(rpcUrl: string, chainId: number): any {
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
          if (params && params[0]) {
            return await provider.call(params[0])
          }
          throw new Error('eth_call requires transaction object')
        case 'eth_sendTransaction':
          if (params && params[0]) {
            // Note: This requires a signer, which should be handled by the caller
            throw new Error('eth_sendTransaction requires a signer. Use a wallet provider instead.')
          }
          throw new Error('eth_sendTransaction requires transaction object')
        case 'eth_getBlockByNumber':
        case 'eth_getBlockByHash':
        case 'eth_getTransactionReceipt':
        case 'eth_getCode':
        case 'eth_estimateGas':
          // Delegate to ethers provider
          return await provider.send(method, params || [])
        default:
          throw new Error(`Unsupported method: ${method}`)
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
        // SDK 0.3.0-5 returns: { clearValues: {...}, abiEncodedClearValues: '...', decryptionProof: '...' }
        const result = await this._instance.publicDecrypt([handle])
        
        // Handle different result structures
        let decryptedValue: number | bigint | undefined
        
        if (result && typeof result === 'object') {
          // Check for SDK 0.3.0-5 format with clearValues
          if (result.clearValues && typeof result.clearValues === 'object') {
            const clearValues = result.clearValues as Record<string, number | bigint>
            decryptedValue = clearValues[handle] || Object.values(clearValues)[0]
          } else if (Array.isArray(result)) {
            // Legacy array format
            decryptedValue = result[0]
          } else {
            // Try direct handle lookup (legacy format)
            const resultObj = result as unknown as Record<string, number | bigint>
            decryptedValue = resultObj[handle] || Object.values(resultObj)[0]
          }
        } else {
          // Direct value
          decryptedValue = result as number | bigint
        }
        
        if (decryptedValue === undefined || decryptedValue === null) {
          throw new FHEVMDecryptionError('Decryption returned no value')
        }
        
        // Convert BigInt or number to regular number
        return typeof decryptedValue === 'bigint' ? Number(decryptedValue) : Number(decryptedValue)
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
    const baseConfig = getZamaEthereumConfig(this._config.chainId)
    const eip1193Provider = createEIP1193Provider(this._config.rpcUrl, this._config.chainId)
    const newInstance = await createInstance({
      ...baseConfig,
      network: eip1193Provider
    })
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
 * Health check function to test relayer URL accessibility
 */
async function checkRelayerHealth(relayerUrl: string, timeoutMs: number = 5000): Promise<{ healthy: boolean; error?: string; statusCode?: number; responseText?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    try {
      const response = await fetch(relayerUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FHEVM-SDK-Node'
        }
      })
      
      clearTimeout(timeoutId)
      
      const statusCode = response.status
      let responseText: string | undefined
      
      try {
        responseText = await response.text()
      } catch {
        // Ignore text parsing errors
      }
      
      // Check if response is JSON
      let isJson = false
      if (responseText) {
        try {
          JSON.parse(responseText)
          isJson = true
        } catch {
          // Not JSON
        }
      }
      
      return {
        healthy: response.ok && isJson,
        statusCode,
        ...(responseText && { responseText: responseText.substring(0, 200) }) // Limit to first 200 chars
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return { healthy: false, error: 'Request timeout' }
        }
        return { healthy: false, error: fetchError.message }
      }
      return { healthy: false, error: String(fetchError) }
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Retry helper function with exponential backoff
 */
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
      
      // Don't retry on non-retryable errors
      if (errorMessage.includes('UNSUPPORTED_CHAIN') || 
          errorMessage.includes('Invalid RPC') ||
          errorMessage.includes('Invalid configuration')) {
        throw error
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs)
      console.log(`[FHEVM] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

/**
 * Create a real FHEVM client for Node.js using the relayer SDK
 * 
 * This function creates an EIP-1193 compatible provider wrapper around
 * the RPC URL and initializes the FHEVM instance with proper configuration.
 * Includes retry logic with exponential backoff for transient relayer failures.
 * 
 * @param config FHEVM configuration with RPC URL and chain ID
 * @param events Optional event handlers
 * @param retryOptions Optional retry configuration
 * @returns FHEVM client with real instance
 */
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
    
    // Get base configuration for the chain
    const baseConfig = getZamaEthereumConfig(config.chainId)
    
    console.log(`[FHEVM] Relayer URL: ${baseConfig.relayerUrl}`)
    console.log(`[FHEVM] ACL Contract: ${baseConfig.aclContractAddress}`)
    
    // Perform health check on relayer before attempting to create instance
    console.log('[FHEVM] Checking relayer health...')
    const healthCheck = await checkRelayerHealth(baseConfig.relayerUrl || '')
    if (!healthCheck.healthy) {
      console.warn(`[FHEVM] Relayer health check failed: ${healthCheck.error || 'Unknown error'}`)
      if (healthCheck.statusCode) {
        console.warn(`[FHEVM] Relayer returned status code: ${healthCheck.statusCode}`)
      }
      if (healthCheck.responseText) {
        console.warn(`[FHEVM] Relayer response (first 200 chars): ${healthCheck.responseText}`)
      }
      console.warn('[FHEVM] Continuing with instance creation attempt (may fail)...')
    } else {
      console.log('[FHEVM] Relayer health check passed')
    }
    
    // Create EIP-1193 provider wrapper (required for Node.js)
    // The relayer SDK expects an EIP-1193 provider, not just an RPC URL string
    const eip1193Provider = createEIP1193Provider(config.rpcUrl, config.chainId)
    
    const fhevmConfig: FhevmInstanceConfig = {
      ...baseConfig,
      network: eip1193Provider
    }
    
    // Attempt to create instance with retry logic
    const fhevmInstance = await retryWithBackoff(
      async () => {
        try {
          return await createInstance(fhevmConfig)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          // Log more details about the error for debugging
          if (errorMessage.includes('Bad JSON') || errorMessage.includes("didn't response correctly")) {
            console.error(`[FHEVM] Relayer communication error: ${errorMessage}`)
            // Try to extract more error details if available
            if (error && typeof error === 'object') {
              // Log the full error object structure for debugging
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
                // Ignore JSON stringify errors
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
    
    // Provide more helpful error messages for common issues
    if (errorMessage.includes('Bad JSON') || errorMessage.includes("didn't response correctly") || errorMessage.includes('fetch')) {
      const relayerUrl = getZamaEthereumConfig(config.chainId).relayerUrl
      
      // Perform a final health check to provide diagnostic information
      console.log('[FHEVM] Performing diagnostic health check...')
      const diagnosticCheck = await checkRelayerHealth(relayerUrl || '', 10000)
      
      let diagnosticInfo = ''
      if (!diagnosticCheck.healthy) {
        diagnosticInfo = `\nDiagnostic information:\n` +
          `  - Relayer URL: ${relayerUrl}\n` +
          `  - Status: ${diagnosticCheck.statusCode ? `HTTP ${diagnosticCheck.statusCode}` : 'Connection failed'}\n` +
          `  - Error: ${diagnosticCheck.error || 'Unknown'}\n`
        if (diagnosticCheck.responseText) {
          diagnosticInfo += `  - Response preview: ${diagnosticCheck.responseText}\n`
        }
      }
      
      throw new FHEVMError(
        `Relayer service communication failed after ${maxRetries} attempts. This may indicate:\n` +
        `  1. The relayer service at ${relayerUrl} is temporarily unavailable or returning invalid responses\n` +
        `  2. Network connectivity issues\n` +
        `  3. Invalid RPC URL: ${config.rpcUrl}\n` +
        `  4. CORS or firewall blocking the request\n` +
        diagnosticInfo +
        `\nTo troubleshoot:\n` +
        `  - Check if ${relayerUrl} is accessible from your network (try: curl ${relayerUrl})\n` +
        `  - Verify your RPC URL is correct and accessible\n` +
        `  - Check for network/firewall restrictions\n` +
        `  - Try again later if the relayer service is experiencing issues\n` +
        `  - Check Zama's status page or documentation for service updates\n` +
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
