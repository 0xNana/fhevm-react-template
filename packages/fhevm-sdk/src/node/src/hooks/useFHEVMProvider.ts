import { createFHEVMClient } from '../../../client.js'
import type { FHEVMEvents } from '../../../types.js'
import type { FHEVMHookConfig, FHEVMHookResult } from './types.js'

/**
 * FHEVM Provider hook for Node.js
 * 
 * Provides a React-like hook interface for FHEVM provider operations.
 * Similar to wagmi's useFHEVMProvider but for Node.js environments.
 */
export function useFHEVMProvider(config: FHEVMHookConfig): FHEVMHookResult {
  let client: any = null
  let isReady = false
  let isLoading = false
  let error: Error | null = null

  const initialize = async (): Promise<void> => {
    if (isLoading || isReady) return

    isLoading = true
    error = null

    try {
      const events: FHEVMEvents = {
        onStatusChange: (status: string) => {
          console.log(`[FHEVM Provider] Status: ${status}`)
        },
        onError: (err: Error) => {
          error = err
          console.error(`[FHEVM Provider] Error: ${err.message}`)
        },
        onReady: (_instance: any) => {
          isReady = true
          isLoading = false
          console.log('[FHEVM Provider] Client is ready!')
        }
      }

      client = createFHEVMClient(config, events)
      await client.initialize()
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      isLoading = false
      throw error
    }
  }

  const reset = (): void => {
    client = null
    isReady = false
    isLoading = false
    error = null
  }

  // Auto-initialize if enabled
  if (config.autoInit !== false) {
    initialize().catch(console.error)
  }

  return {
    client,
    isReady,
    isLoading,
    error,
    initialize,
    reset
  }
}
