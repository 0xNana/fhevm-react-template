import { batchDecrypt, batchUserDecryptWithSignatures, batchPublicDecrypt } from '../utilities.js'
import type { FHEVMConfig } from '../../../types.js'
import type { BatchDecryptOptions, BatchDecryptResult } from './types.js'

/**
 * Batch decrypt hook for Node.js
 * 
 * Provides a React-like hook interface for batch decryption operations.
 * Similar to wagmi's useBatchDecrypt but for Node.js environments.
 */
export function useBatchDecrypt(config: FHEVMConfig): BatchDecryptResult {
  let isPending = false
  let error: Error | null = null
  let values: number[] | null = null
  let progress = 0

  const batchDecryptValues = async (options: BatchDecryptOptions): Promise<number[]> => {
    isPending = true
    error = null
    progress = 0

    try {
      let decryptedValues: number[]

      if (options.usePublicDecrypt) {
        decryptedValues = await batchPublicDecrypt(
          options.handles,
          options.contractAddress,
          config
        )
      } else if (options.signatures) {
        decryptedValues = await batchUserDecryptWithSignatures(
          options.handles,
          options.contractAddress,
          options.signatures,
          config
        )
      } else {
        const batchOptions: any = {}
        if (options.signatures && (options.signatures as string[]).length > 0) {
          batchOptions.signature = options.signatures[0]
        }
        if (options.usePublicDecrypt !== undefined) {
          batchOptions.usePublicDecrypt = options.usePublicDecrypt
        }
        
        decryptedValues = await batchDecrypt(
          options.handles,
          options.contractAddress,
          config,
          batchOptions
        )
      }

      values = decryptedValues
      progress = 1
      isPending = false
      return decryptedValues
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
    values = null
    progress = 0
  }

  return {
    batchDecrypt: batchDecryptValues,
    isPending,
    error,
    values,
    progress,
    reset
  }
}
