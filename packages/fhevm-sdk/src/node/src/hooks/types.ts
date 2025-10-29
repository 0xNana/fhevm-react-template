import type { FHEVMConfig } from '../../../types.js'

/**
 * Configuration for FHEVM hooks
 */
export interface FHEVMHookConfig extends FHEVMConfig {
  /** Enable automatic initialization */
  autoInit?: boolean
  /** Retry configuration */
  retry?: {
    attempts: number
    delay: number
  }
}

/**
 * Configuration for contract hooks
 */
export interface ContractHookConfig {
  /** Contract address */
  address: string
  /** Contract ABI */
  abi: any[]
  /** Provider configuration */
  provider?: {
    rpcUrl: string
    chainId: number
  }
}

/**
 * Options for reading from contract
 */
export interface ReadContractOptions {
  /** Function name to call */
  functionName: string
  /** Arguments to pass to function */
  args?: any[]
  /** Account address (optional) */
  account?: string
  /** Block number or tag */
  blockTag?: 'latest' | 'earliest' | 'pending' | number
  /** Enable caching */
  cache?: boolean
  /** Cache TTL in milliseconds */
  cacheTime?: number
}

/**
 * Options for writing to contract
 */
export interface WriteContractOptions {
  /** Function name to call */
  functionName: string
  /** Arguments to pass to function */
  args?: any[]
  /** Value to send (in wei) */
  value?: bigint
  /** Gas limit */
  gasLimit?: bigint
  /** Gas price */
  gasPrice?: bigint
  /** Max fee per gas */
  maxFeePerGas?: bigint
  /** Max priority fee per gas */
  maxPriorityFeePerGas?: bigint
  /** Account private key */
  privateKey: string
}

/**
 * Options for encryption
 */
export interface EncryptOptions {
  /** Value to encrypt */
  value: number
  /** Public key for encryption */
  publicKey: string
  /** Enable caching */
  cache?: boolean
}

/**
 * Options for decryption
 */
export interface DecryptOptions {
  /** Encrypted handle */
  handle: string
  /** Contract address */
  contractAddress: string
  /** User signature (for userDecrypt) */
  signature?: string
  /** Use public decryption */
  usePublicDecrypt?: boolean
  /** Enable caching */
  cache?: boolean
}

/**
 * Options for batch encryption
 */
export interface BatchEncryptOptions {
  /** Values to encrypt */
  values: number[]
  /** Public key for encryption */
  publicKey: string
  /** Enable parallel processing */
  parallel?: boolean
  /** Batch size for parallel processing */
  batchSize?: number
}

/**
 * Options for batch decryption
 */
export interface BatchDecryptOptions {
  /** Encrypted handles */
  handles: string[]
  /** Contract address */
  contractAddress: string
  /** User signatures (for userDecrypt) */
  signatures?: string[]
  /** Use public decryption */
  usePublicDecrypt?: boolean
  /** Enable parallel processing */
  parallel?: boolean
  /** Batch size for parallel processing */
  batchSize?: number
}


/**
 * Result from FHEVM hook
 */
export interface FHEVMHookResult {
  /** FHEVM client instance */
  client: any
  /** Whether client is ready */
  isReady: boolean
  /** Whether client is loading */
  isLoading: boolean
  /** Error if any */
  error: Error | null
  /** Initialize function */
  initialize: () => Promise<void>
  /** Reset function */
  reset: () => void
}

/**
 * Result from contract hook
 */
export interface ContractHookResult {
  /** Contract instance */
  contract: any
  /** Whether contract is ready */
  isReady: boolean
  /** Error if any */
  error: Error | null
  /** Contract address */
  address: string
  /** Contract ABI */
  abi: any[]
}

/**
 * Result from read contract hook
 */
export interface ReadContractResult<T = any> {
  /** Read data */
  data: T | undefined
  /** Whether data is loading */
  isLoading: boolean
  /** Error if any */
  error: Error | null
  /** Refetch function */
  refetch: () => Promise<T | undefined>
  /** Whether data is stale */
  isStale: boolean
  /** Last fetch time */
  lastFetchTime: number | null
}

/**
 * Result from write contract hook
 */
export interface WriteContractResult {
  /** Write function */
  write: (options?: Partial<WriteContractOptions>) => Promise<any>
  /** Whether write is pending */
  isPending: boolean
  /** Error if any */
  error: Error | null
  /** Transaction hash if any */
  hash: string | null
  /** Transaction receipt if any */
  receipt: any | null
  /** Reset function */
  reset: () => void
}

/**
 * Result from encrypt hook
 */
export interface EncryptResult {
  /** Encrypt function */
  encrypt: (value: number, publicKey: string) => Promise<string>
  /** Whether encryption is pending */
  isPending: boolean
  /** Error if any */
  error: Error | null
  /** Last encrypted handle */
  handle: string | null
  /** Reset function */
  reset: () => void
}

/**
 * Result from decrypt hook
 */
export interface DecryptResult {
  /** Decrypt function */
  decrypt: (options: DecryptOptions) => Promise<number>
  /** Whether decryption is pending */
  isPending: boolean
  /** Error if any */
  error: Error | null
  /** Last decrypted value */
  value: number | null
  /** Reset function */
  reset: () => void
}

/**
 * Result from batch encrypt hook
 */
export interface BatchEncryptResult {
  /** Batch encrypt function */
  batchEncrypt: (values: number[], publicKey: string) => Promise<string[]>
  /** Whether batch encryption is pending */
  isPending: boolean
  /** Error if any */
  error: Error | null
  /** Last encrypted handles */
  handles: string[] | null
  /** Progress (0-1) */
  progress: number
  /** Reset function */
  reset: () => void
}

/**
 * Result from batch decrypt hook
 */
export interface BatchDecryptResult {
  /** Batch decrypt function */
  batchDecrypt: (options: BatchDecryptOptions) => Promise<number[]>
  /** Whether batch decryption is pending */
  isPending: boolean
  /** Error if any */
  error: Error | null
  /** Last decrypted values */
  values: number[] | null
  /** Progress (0-1) */
  progress: number
  /** Reset function */
  reset: () => void
}

