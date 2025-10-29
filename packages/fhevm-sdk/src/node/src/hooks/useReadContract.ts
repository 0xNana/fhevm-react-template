import type { ReadContractOptions, ReadContractResult } from './types.js'

/**
 * Read contract hook for Node.js
 * 
 * Provides a React-like hook interface for reading from contracts.
 * Similar to wagmi's useReadContract but for Node.js environments.
 */
export function useReadContract<T = any>(
  contract: any,
  options: ReadContractOptions
): ReadContractResult<T> {
  let data: T | undefined = undefined
  let isLoading = false
  let error: Error | null = null
  let isStale = false
  let lastFetchTime: number | null = null

  const refetch = async (): Promise<T | undefined> => {
    if (!contract || !contract[options.functionName]) {
      error = new Error(`Contract or function ${options.functionName} not available`)
      return undefined
    }

    isLoading = true
    error = null
    isStale = false

    try {
      const result = await contract[options.functionName](...(options.args || []))
      data = result
      lastFetchTime = Date.now()
      isLoading = false
      return result
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      isLoading = false
      return undefined
    }
  }

  // Auto-fetch if not cached or cache is disabled
  if (!data && !isLoading && (!options.cache || !lastFetchTime)) {
    refetch().catch(console.error)
  }

  // Check if data is stale
  if (lastFetchTime && options.cacheTime) {
    const now = Date.now()
    isStale = now - lastFetchTime > options.cacheTime
  }

  return {
    data,
    isLoading,
    error,
    refetch,
    isStale,
    lastFetchTime
  }
}
