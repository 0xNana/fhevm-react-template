import { ref, computed, type Ref } from 'vue'
import type { FhevmInstance } from "../../../index.js"

/**
 * Vue composable for FHEVM EIP-712 signature generation
 * 
 * Provides reactive signature generation for FHEVM write functions.
 */
export function useFHEVMSignature(
  instance: Ref<FhevmInstance | null>,
  userAddress: Ref<string | undefined>
) {
  const isSigning = ref(false)
  const signature = ref<string | null>(null)
  const error = ref<Error | null>(null)

  // Computed properties
  const hasSignature = computed(() => signature.value !== null)
  const hasError = computed(() => error.value !== null)

  /**
   * Generate EIP-712 signature for FHEVM write functions
   * This is a placeholder implementation - the actual signature generation
   * is handled by the wallet provider during transaction signing
   */
  const generateSignature = async (_contractAddress: string): Promise<string> => {
    if (!instance.value) {
      const err = new Error("FHEVM instance not available")
      error.value = err
      throw err
    }

    if (!userAddress.value) {
      const err = new Error("User address not available")
      error.value = err
      throw err
    }

    isSigning.value = true
    error.value = null

    try {
      // Generate real EIP-712 signature for FHEVM decryption
      if (!instance.value) {
        throw new Error("FHEVM instance not available")
      }

      // Create the EIP-712 domain and types for FHEVM decryption
      const domain = {
        name: 'FHEVM',
        version: '1',
        chainId: 11155111, // Sepolia
        verifyingContract: _contractAddress
      }

      const types = {
        Reencrypt: [
          { name: 'publicKey', type: 'bytes' },
          { name: 'ciphertext', type: 'bytes' }
        ]
      }

      // Generate a keypair for decryption
      const keypair = instance.value.generateKeypair()
      
      const message = {
        publicKey: keypair.publicKey,
        ciphertext: '0x' // Empty ciphertext for decryption request
      }

      // Request signature from wallet
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum
        
        const sig = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [userAddress.value, JSON.stringify({
            domain,
            types,
            primaryType: 'Reencrypt',
            message
          })]
        })
        
        signature.value = sig
        return sig
      } else {
        throw new Error("Wallet not available for signature generation")
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      throw errorObj
    } finally {
      isSigning.value = false
    }
  }

  /**
   * Reset signature state
   */
  const reset = () => {
    signature.value = null
    error.value = null
    isSigning.value = false
  }

  return {
    // State
    signature: computed(() => signature.value),
    isSigning: computed(() => isSigning.value),
    error: computed(() => error.value),
    hasSignature,
    hasError,
    
    // Actions
    generateSignature,
    reset
  }
}
