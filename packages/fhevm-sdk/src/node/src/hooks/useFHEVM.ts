import { createFHEVMClient } from '../../../client.js'
import type { FHEVMEvents } from '../../../types.js'
import type { FHEVMHookConfig, FHEVMHookResult } from './types.js'

/**
 * Core FHEVM hook for Node.js
 * 
 * Provides a React-like hook interface for FHEVM operations in Node.js.
 * This is the foundation for all other hooks.
 */
export function useFHEVM(config: FHEVMHookConfig): FHEVMHookResult {
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
          console.log(`[FHEVM Hook] Status: ${status}`)
        },
        onError: (err: Error) => {
          error = err
          console.error(`[FHEVM Hook] Error: ${err.message}`)
        },
        onReady: (_instance: any) => {
          isReady = true
          isLoading = false
          console.log('[FHEVM Hook] Client is ready!')
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
