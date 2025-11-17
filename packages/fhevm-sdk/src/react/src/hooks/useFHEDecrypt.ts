import { useState, useCallback, useMemo } from 'react'
import type { FhevmInstance } from "../../../index.js"
import { FhevmDecryptionSignature } from "../../../index.js"
import { logger } from "../../../utilities/index.js"

export interface FHEDecryptRequest {
  handle: string
  contractAddress: `0x${string}`
}

/**
 * React hook for FHEVM signature-based decryption
 * 
 * Provides decryption functionality using EIP-712 signatures for user-specific decryption.
 * This matches the Vue implementation's advanced signature-based decryption capabilities.
 */
export function useFHEDecrypt(params: {
  instance: FhevmInstance | null
  ethersSigner: any
  fhevmDecryptionSignatureStorage: any
  requests: readonly FHEDecryptRequest[] | undefined
}) {
  const { instance, ethersSigner, fhevmDecryptionSignatureStorage, requests } = params

  const [isDecrypting, setIsDecrypting] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<Record<string, any>>({})
  const [error, setError] = useState<Error | null>(null)

  // Computed properties
  const hasDecryptedValue = useMemo(() => Object.keys(results).length > 0, [results])
  const hasError = useMemo(() => error !== null, [error])

  const canDecrypt = useMemo(() => {
    return Boolean(
      instance && 
      ethersSigner && 
      requests && 
      requests.length > 0 && 
      !isDecrypting
    )
  }, [instance, ethersSigner, requests, isDecrypting])

  // Generate EIP-712 signature for FHEVM decryption using SDK's loadOrSign method
  const generateDecryptionSignature = useCallback(async (
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    signer: any,
    storage: any
  ): Promise<any | null> => {
    try {
      logger.debug('Generating decryption signature', { contractAddresses })
      
      const signature = await FhevmDecryptionSignature.loadOrSign(
        instance,
        contractAddresses,
        signer,
        storage
      )

      if (!signature) {
        throw new Error("Signature generation returned null or undefined.")
      }

      logger.debug('Decryption signature generated', {
        userAddress: signature?.userAddress,
        contractAddresses: signature?.contractAddresses
      })

      return signature
    } catch (error) {
      logger.error('Failed to create decryption signature', error)
      throw error  // Re-throw to be handled by `decrypt` function
    }
  }, [])

  const decrypt = useCallback(async (): Promise<void> => {
    // Early return checks with proper error handling
    if (isDecrypting) {
      logger.warn('Decryption already in progress, skipping')
      return
    }

    if (!instance) {
      setError(new Error("FHEVM instance not available"))
      setMessage("Cannot decrypt - FHEVM not initialized")
      return
    }

    if (!ethersSigner) {
      setError(new Error("Ethers signer not available"))
      setMessage("Cannot decrypt - wallet not connected")
      return
    }

    if (!requests || requests.length === 0) {
      setError(new Error("No decryption requests available"))
      setMessage("Cannot decrypt - no encrypted data to decrypt")
      return
    }

    const thisInstance = instance
    const thisSigner = ethersSigner
    const thisRequests = requests

    logger.debug('Starting decryption', { requestCount: thisRequests.length })

    setIsDecrypting(true)
    setMessage("Starting decryption process...")
    setError(null)

    try {
      // Validate and prepare contract addresses
      const uniqueAddresses = Array.from(new Set(thisRequests.map(r => r.contractAddress)))
      logger.debug('Contract addresses for decryption', { uniqueAddresses })
      
      if (uniqueAddresses.length === 0) {
        throw new Error("No valid contract addresses found")
      }
      
      // Validate each contract address format
      for (const address of uniqueAddresses) {
        if (!address || !address.startsWith('0x') || address.length !== 42) {
          throw new Error(`Invalid contract address format: ${address}`)
        }
      }

      setMessage("Generating decryption signature...")
      const sig: any | null = await generateDecryptionSignature(
        thisInstance,
        uniqueAddresses as `0x${string}`[],
        thisSigner,
        fhevmDecryptionSignatureStorage,
      )

      if (!sig) {
        throw new Error("Failed to generate decryption signature")
      }

      setMessage("Calling FHEVM userDecrypt...")
      const mutableReqs = thisRequests.map(r => ({ 
        handle: r.handle, 
        contractAddress: r.contractAddress 
      }))
      
      logger.debug('Calling userDecrypt', {
        requestCount: mutableReqs.length,
        userAddress: sig.userAddress,
        contractAddresses: sig.contractAddresses
      })

      let res
      try {
        res = await thisInstance.userDecrypt(
          mutableReqs,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays,
        )
      } catch (userDecryptError) {
        const errorMessage = userDecryptError instanceof Error ? userDecryptError.message : String(userDecryptError)
        logger.error('userDecrypt failed', userDecryptError)
        
        // Check if this is an authorization error
        if (errorMessage.includes('not authorized') || errorMessage.includes('not authorized to user decrypt')) {
          const helpfulMessage = `Authorization required: You must call the contract method (e.g., getEncryptedResults or getCurrentVoteCounts) as a WRITE transaction first to authorize yourself for decryption. The contract will call FHE.allow() to grant you permission. Error: ${errorMessage}`
          throw new Error(helpfulMessage)
        }
        
        throw new Error(`userDecrypt failed: ${errorMessage}`)
      }

      logger.debug('Decryption successful', { resultCount: res ? Object.keys(res).length : 0 })
      setResults(res)

      setMessage("Decryption completed successfully!")
      setResults(res)
      setError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      const errorCode = e instanceof Error && 'name' in e ? e.name : 'DECRYPT_ERROR'
      
      setError(new Error(`${errorCode}: ${errorMessage}`))
      setMessage("Decryption failed")
      
      logger.error('FHEVM Decryption Error', {
        message: errorMessage,
        code: errorCode,
        requestCount: thisRequests.length
      })
    } finally {
      setIsDecrypting(false)
    }
  }, [instance, ethersSigner, requests, isDecrypting, fhevmDecryptionSignatureStorage, generateDecryptionSignature])

  /**
   * Decrypt using EIP-712 signature (legacy method for backward compatibility)
   * Note: This requires a signature to be provided externally
   */
  const decryptWithSignature = useCallback(async (
    handle: string,
    contractAddress: string,
    signature?: string
  ): Promise<any> => {
    if (!instance) {
      const err = new Error("FHEVM instance not available")
      setError(err)
      throw err
    }

    if (!signature) {
      const err = new Error("Signature required for user decryption")
      setError(err)
      throw err
    }

    setIsDecrypting(true)
    setError(null)

    try {
      // Perform decryption with signature using userDecrypt
      const result = await instance.userDecrypt(
        [{ handle, contractAddress }],
        '', // privateKey
        '', // publicKey
        signature,
        [contractAddress],
        '', // userAddress
        0, // startTimestamp
        0  // durationDays
      )

      setResults({ [handle]: result })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      throw errorObj
    } finally {
      setIsDecrypting(false)
    }
  }, [instance])

  /**
   * Decrypt using public decryption (no signature required)
   */
  const decryptPublic = useCallback(async (
    handle: string,
    _contractAddress: string
  ): Promise<any> => {
    if (!instance) {
      const err = new Error("FHEVM instance not available")
      setError(err)
      throw err
    }

    setIsDecrypting(true)
    setError(null)

    try {
      // Perform public decryption using publicDecrypt
      const result = await instance.publicDecrypt([handle])

      setResults({ [handle]: result })
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      throw errorObj
    } finally {
      setIsDecrypting(false)
    }
  }, [instance])

  /**
   * Reset decryption state
   */
  const reset = useCallback(() => {
    setResults({})
    setError(null)
    setIsDecrypting(false)
    setMessage('')
  }, [])

  return {
    // State
    results,
    isDecrypting,
    error,
    hasDecryptedValue,
    hasError,
    message,
    canDecrypt,
    
    // Actions
    decrypt,
    decryptWithSignature,
    decryptPublic,
    reset
  }
}