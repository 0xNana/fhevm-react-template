import { useState, useCallback, useMemo } from 'react'
import type { FhevmInstance } from "../../../index.js"
import { FhevmDecryptionSignature } from "../../../index.js"

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
    const hasInstance = Boolean(instance)
    const hasSigner = Boolean(ethersSigner)
    const hasRequests = Boolean(requests && requests.length > 0)
    const notDecrypting = !isDecrypting
    
    console.log('🔍 useFHEDecrypt canDecrypt check:', {
      hasInstance,
      hasSigner,
      hasRequests,
      notDecrypting,
      requestsLength: requests?.length,
      result: hasInstance && hasSigner && hasRequests && notDecrypting
    })
    
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
      console.log('🔍 Generating decryption signature with:', {
        instance: !!instance,
        contractAddresses,
        signer: !!signer,
        storage: !!storage
      })
      
      // Use the SDK's proven loadOrSign method
      console.log('🔍 About to call FhevmDecryptionSignature.loadOrSign with:', {
        instance: !!instance,
        contractAddresses,
        signer: !!signer,
        signerType: typeof signer,
        signerMethods: signer ? Object.getOwnPropertyNames(Object.getPrototypeOf(signer)) : [],
        hasSignTypedData: signer && typeof signer.signTypedData === 'function',
        storage: !!storage
      })
      
      const signature = await FhevmDecryptionSignature.loadOrSign(
        instance,
        contractAddresses,
        signer,
        storage
      )
      
      console.log('🔍 FhevmDecryptionSignature.loadOrSign returned:', {
        signature: !!signature,
        isNull: signature === null,
        isUndefined: signature === undefined
      })

      console.log('🔍 Signature generated:', signature)

      if (!signature) {
        throw new Error("Signature generation returned null or undefined.")
      }

      console.log('🔍 Signature Details:', {
        privateKeyExists: !!signature?.privateKey,
        publicKeyExists: !!signature?.publicKey,
        signatureExists: !!signature?.signature,
        userAddress: signature?.userAddress,
        contractAddresses: signature?.contractAddresses,
        startTimestamp: signature?.startTimestamp,
        durationDays: signature?.durationDays
      })

      return signature
    } catch (error) {
      console.error('🔴 Failed to create decryption signature:', error)
      throw error  // Re-throw to be handled by `decrypt` function
    }
  }, [])

  const decrypt = useCallback(async (): Promise<void> => {
    console.log('🔍 decrypt() function called!')
    console.log('🔍 isDecrypting:', isDecrypting)
    console.log('🔍 instance:', !!instance)
    console.log('🔍 ethersSigner:', !!ethersSigner)
    console.log('🔍 requests:', requests)
    
    // Early return checks with proper error handling
    if (isDecrypting) {
      console.warn('Decryption already in progress, skipping')
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

    console.log('🔍 Proceeding with decryption...')
    console.log('🔍 thisInstance:', !!thisInstance)
    console.log('🔍 thisSigner:', !!thisSigner)
    console.log('🔍 thisRequests:', thisRequests)

    setIsDecrypting(true)
    setMessage("Starting decryption process...")
    setError(null)

    try {
      // Validate and prepare contract addresses
      const uniqueAddresses = Array.from(new Set(thisRequests.map(r => r.contractAddress)))
      console.log('🔍 Unique contract addresses:', uniqueAddresses)
      
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

      console.log('🔍 Decryption signature result:', {
        signature: !!sig,
        hasPrivateKey: !!sig?.privateKey,
        hasPublicKey: !!sig?.publicKey,
        hasSignature: !!sig?.signature,
        userAddress: sig?.userAddress,
        contractAddresses: sig?.contractAddresses
      })

      if (!sig) {
        throw new Error("Failed to generate decryption signature")
      }

      setMessage("Calling FHEVM userDecrypt...")
      const mutableReqs = thisRequests.map(r => ({ 
        handle: r.handle, 
        contractAddress: r.contractAddress 
      }))
      
      console.log('🔍 Calling userDecrypt with:', {
        mutableReqs,
        privateKey: !!sig.privateKey,
        publicKey: !!sig.publicKey,
        signature: !!sig.signature,
        contractAddresses: sig.contractAddresses,
        userAddress: sig.userAddress,
        startTimestamp: sig.startTimestamp,
        durationDays: sig.durationDays
      })
      
       console.log('🔍 Detailed signature info:', {
         privateKeyLength: sig.privateKey?.length,
         publicKeyLength: sig.publicKey?.length,
         signatureLength: sig.signature?.length,
         userAddress: sig.userAddress,
         contractAddresses: sig.contractAddresses,
         startTimestamp: sig.startTimestamp,
         durationDays: sig.durationDays
       })
       
       console.log('🔍 Authorization check:', {
         signatureUserAddress: sig.userAddress,
         signerAddress: thisSigner.address,
         addressesMatch: sig.userAddress === thisSigner.address
       })
      
      console.log('🔍 Mutable requests details:', mutableReqs.map(req => ({
        handle: req.handle,
        handleLength: req.handle.length,
        contractAddress: req.contractAddress
      })))

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
        console.error('🔴 userDecrypt failed:', userDecryptError)
        throw new Error(`userDecrypt failed: ${userDecryptError instanceof Error ? userDecryptError.message : String(userDecryptError)}`)
      }

      setResults(res)
      console.log('🔍 userDecrypt result:', res)
      console.log('🔍 Result type:', typeof res)
      console.log('🔍 Result keys:', res ? Object.keys(res) : 'null/undefined')
      console.log('🔍 Result values:', res ? Object.values(res) : 'null/undefined')

      setMessage("Decryption completed successfully!")
      setResults(res)
      setError(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      const errorCode = e instanceof Error && 'name' in e ? e.name : 'DECRYPT_ERROR'
      
      setError(new Error(`${errorCode}: ${errorMessage}`))
      setMessage("Decryption failed")
      
      console.error('FHEVM Decryption Error:', {
        error: e,
        message: errorMessage,
        code: errorCode,
        instance: !!thisInstance,
        signer: !!thisSigner,
        requests: thisRequests.length
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