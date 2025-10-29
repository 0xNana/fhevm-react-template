import { batchEncrypt } from '../utilities.js'
import type { FHEVMConfig } from '../../../types.js'
import type { BatchEncryptResult } from './types.js'

/**
 * Batch encrypt hook for Node.js
 * 
 * Provides a React-like hook interface for batch encryption operations.
 * Similar to wagmi's useBatchEncrypt but for Node.js environments.
 */
export function useBatchEncrypt(config: FHEVMConfig): BatchEncryptResult {
  let isPending = false
  let error: Error | null = null
  let handles: string[] | null = null
  let progress = 0

  const batchEncryptValues = async (values: number[], publicKey: string): Promise<string[]> => {
    isPending = true
    error = null
    progress = 0

    try {
      const encryptedHandles = await batchEncrypt(values, publicKey, config)
      handles = encryptedHandles
      progress = 1
      isPending = false
      return encryptedHandles
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      isPending = false
      progress = 0
      throw error
    }
  }

  const reset = (): void => {
    isPending = false
    error = null
    handles = null
    progress = 0
  }

  return {
    batchEncrypt: batchEncryptValues,
    isPending,
    error,
    handles,
    progress,
    reset
  }
}
