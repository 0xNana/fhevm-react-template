import { encryptValue } from '../utilities.js'
import type { FHEVMConfig } from '../../../types.js'
import type { EncryptResult } from './types.js'

/**
 * Encrypt hook for Node.js
 * 
 * Provides a React-like hook interface for encryption operations.
 * Similar to wagmi's useEncrypt but for Node.js environments.
 */
export function useEncrypt(config: FHEVMConfig): EncryptResult {
  let isPending = false
  let error: Error | null = null
  let handle: string | null = null

  const encrypt = async (value: number, publicKey: string): Promise<string> => {
    isPending = true
    error = null

    try {
      const encryptedHandle = await encryptValue(value, publicKey, config)
      handle = encryptedHandle
      isPending = false
      return encryptedHandle
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      isPending = false
      throw error
    }
  }

  const reset = (): void => {
    isPending = false
    error = null
    handle = null
  }

  return {
    encrypt,
    isPending,
    error,
    handle,
    reset
  }
}
