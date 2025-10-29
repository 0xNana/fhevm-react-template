import { computed } from 'vue'
import { useFHEVM as useFHEVMCore } from '@fhevm/sdk/vue'
import type { FHEVMConfig } from '@fhevm/sdk'

/**
 * Vue composable for FHEVM functionality
 * 
 * Provides reactive FHEVM client state and methods using Vue 3 Composition API.
 * This is a wrapper around the core useFHEVM composable with additional Vue-specific features.
 */
export function useFHEVM(config: FHEVMConfig) {
  const fhevm = useFHEVMCore(config)
  
  // Additional computed properties for better Vue integration
  const isConnected = computed(() => fhevm.isReady.value)
  const hasError = computed(() => fhevm.hasError.value)
  const isLoading = computed(() => fhevm.isInitializing.value)
  
  // Status messages for UI
  const statusMessage = computed(() => {
    if (fhevm.hasError.value) {
      return `Error: ${fhevm.state.value.error?.message || 'Unknown error'}`
    }
    if (fhevm.isInitializing.value) {
      return 'Initializing FHEVM client...'
    }
    if (fhevm.isReady.value) {
      return 'FHEVM client is ready!'
    }
    return 'FHEVM client is idle'
  })
  
  // Status color for UI
  const statusColor = computed(() => {
    if (fhevm.hasError.value) return 'text-red-600'
    if (fhevm.isInitializing.value) return 'text-yellow-600'
    if (fhevm.isReady.value) return 'text-green-600'
    return 'text-gray-600'
  })
  
  return {
    ...fhevm,
    isConnected,
    hasError,
    isLoading,
    statusMessage,
    statusColor
  }
}
