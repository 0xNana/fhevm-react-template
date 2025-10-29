import { useState, useCallback, useMemo } from 'react'
import type { FhevmInstance } from "../../../index.js"

/**
 * React hook for FHEVM EIP-712 signature generation
 * 
 * Provides signature generation for FHEVM write functions with proper error handling.
 */
export function useFHEVMSignature(
  instance: FhevmInstance | null,
  userAddress: string | undefined
) {
  const [isSigning, setIsSigning] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Computed properties
  const hasSignature = useMemo(() => signature !== null, [signature])
  const hasError = useMemo(() => error !== null, [error])

  /**
   * Generate EIP-712 signature for FHEVM write functions
   */
  const generateSignature = useCallback(async (contractAddress: string): Promise<string> => {
    if (!instance) {
      const err = new Error("FHEVM instance not available")
      setError(err)
      throw err
    }

    if (!userAddress) {
      const err = new Error("User address not available")
      setError(err)
      throw err
    }

    setIsSigning(true)
    setError(null)

    try {
      // Generate real EIP-712 signature for FHEVM decryption
      if (!instance) {
        throw new Error("FHEVM instance not available")
      }

      // Create the EIP-712 domain and types for FHEVM decryption
      const domain = {
        name: 'FHEVM',
        version: '1',
        chainId: 11155111, // Sepolia
        verifyingContract: contractAddress
      }

      const types = {
        Reencrypt: [
          { name: 'publicKey', type: 'bytes' },
          { name: 'ciphertext', type: 'bytes' }
        ]
      }

      // Generate a keypair for decryption
      const keypair = instance.generateKeypair()
      
      const message = {
        publicKey: keypair.publicKey,
        ciphertext: '0x' // Empty ciphertext for decryption request
      }

      // Request signature from wallet
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum
        
        const sig = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [userAddress, JSON.stringify({
            domain,
            types,
            primaryType: 'Reencrypt',
            message
          })]
        })
        
        setSignature(sig)
        return sig
      } else {
        throw new Error("Wallet not available for signature generation")
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      throw errorObj
    } finally {
      setIsSigning(false)
    }
  }, [instance, userAddress])

  /**
   * Reset signature state
   */
  const reset = useCallback(() => {
    setSignature(null)
    setError(null)
    setIsSigning(false)
  }, [])

  return {
    // State
    signature,
    isSigning,
    error,
    hasSignature,
    hasError,
    
    // Actions
    generateSignature,
    reset
  }
}
