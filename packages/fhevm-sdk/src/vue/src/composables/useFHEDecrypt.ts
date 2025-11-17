import { ref, computed, type Ref } from 'vue'
import type { FhevmInstance } from "../../../index.js"
import { FhevmDecryptionSignature } from "../../../index.js"
import { logger } from "../../../utilities/index.js"

export interface FHEDecryptRequest {
  handle: string
  contractAddress: `0x${string}`
}

/**
 * Vue composable for FHEVM decryption
 * 
 * Provides reactive FHEVM decryption functionality using Vue 3 Composition API.
 */
export function useFHEDecrypt(params: {
  instance: Ref<FhevmInstance | null>
  ethersSigner: Ref<any>
  fhevmDecryptionSignatureStorage: any
  requests: Ref<readonly FHEDecryptRequest[] | undefined>
}) {
  const { instance, ethersSigner, fhevmDecryptionSignatureStorage, requests } = params

  const isDecrypting = ref(false)
  const message = ref('')
  const results = ref<Record<string, string | bigint | boolean>>({})
  const error = ref<string | null>(null)

  const canDecrypt = computed(() => {
    return Boolean(
      instance.value && 
      ethersSigner.value && 
      requests.value && 
      requests.value && requests.value.length > 0 && 
      !isDecrypting.value
    )
  })

  // Generate EIP-712 signature for FHEVM decryption using SDK's loadOrSign method
  const generateDecryptionSignature = async (
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
  }

  const decrypt = async (): Promise<void> => {
    // Early return checks with proper error handling
    if (isDecrypting.value) {
      logger.warn('Decryption already in progress, skipping')
      return
    }

    if (!instance.value) {
      error.value = "FHEVM instance not available"
      message.value = "Cannot decrypt - FHEVM not initialized"
      return
    }

    if (!ethersSigner.value) {
      error.value = "Ethers signer not available"
      message.value = "Cannot decrypt - wallet not connected"
      return
    }

    if (!requests.value || requests.value.length === 0) {
      error.value = "No decryption requests available"
      message.value = "Cannot decrypt - no encrypted data to decrypt"
      return
    }

    const thisInstance = instance.value
    const thisSigner = ethersSigner.value
    const thisRequests = requests.value

    logger.debug('Starting decryption', { requestCount: thisRequests.length })

    isDecrypting.value = true
    message.value = "Starting decryption process..."
    error.value = null

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

      message.value = "Generating decryption signature..."
      const sig: any | null = await generateDecryptionSignature(
        thisInstance,
        uniqueAddresses as `0x${string}`[],
        thisSigner,
        fhevmDecryptionSignatureStorage,
      )

      if (!sig) {
        throw new Error("Failed to generate decryption signature")
      }

      message.value = "Calling FHEVM userDecrypt..."
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
      results.value = res

      message.value = "Decryption completed successfully!"
      results.value = res
      error.value = null
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      const errorCode = e instanceof Error && 'name' in e ? e.name : 'DECRYPT_ERROR'
      
      error.value = `${errorCode}: ${errorMessage}`
      message.value = "Decryption failed"
      
      logger.error('FHEVM Decryption Error', {
        message: errorMessage,
        code: errorCode,
        requestCount: thisRequests.length
      })
    } finally {
      isDecrypting.value = false
    }
  }

  // Manual reset function to clear stuck state
  const resetDecryptionState = () => {
    isDecrypting.value = false
    error.value = null
    message.value = "Ready to decrypt"
  }

  return {
    canDecrypt,
    decrypt,
    isDecrypting,
    message,
    results,
    error,
    setMessage: (msg: string) => { message.value = msg },
    setError: (err: string | null) => { error.value = err },
    resetDecryptionState
  } as const
}
