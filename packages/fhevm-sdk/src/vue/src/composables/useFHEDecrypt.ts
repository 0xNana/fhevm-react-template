import { ref, computed, type Ref } from 'vue'
import type { FhevmInstance } from "../../../index.js"
import { FhevmDecryptionSignature } from "../../../index.js"

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
    const hasInstance = Boolean(instance.value)
    const hasSigner = Boolean(ethersSigner.value)
    const hasRequests = Boolean(requests.value && requests.value.length > 0)
    const notDecrypting = !isDecrypting.value
    
    console.log('🔍 useFHEDecrypt canDecrypt check:', {
      hasInstance,
      hasSigner,
      hasRequests,
      notDecrypting,
      requestsLength: requests.value?.length,
      result: hasInstance && hasSigner && hasRequests && notDecrypting
    })
    
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
  }

  const decrypt = async (): Promise<void> => {
    console.log('🔍 decrypt() function called!')
    console.log('🔍 isDecrypting.value:', isDecrypting.value)
    console.log('🔍 instance.value:', !!instance.value)
    console.log('🔍 ethersSigner.value:', !!ethersSigner.value)
    console.log('🔍 requests.value:', requests.value)
    
    // Early return checks with proper error handling
    if (isDecrypting.value) {
      console.warn('Decryption already in progress, skipping')
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

    console.log('🔍 Proceeding with decryption...')
    console.log('🔍 thisInstance:', !!thisInstance)
    console.log('🔍 thisSigner:', !!thisSigner)
    console.log('🔍 thisRequests:', thisRequests)

    isDecrypting.value = true
    message.value = "Starting decryption process..."
    error.value = null

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

      message.value = "Generating decryption signature..."
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

      message.value = "Calling FHEVM userDecrypt..."
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

      results.value = res
      console.log('🔍 userDecrypt result:', res)
      console.log('🔍 Result type:', typeof res)
      console.log('🔍 Result keys:', res ? Object.keys(res) : 'null/undefined')
      console.log('🔍 Result values:', res ? Object.values(res) : 'null/undefined')

      message.value = "Decryption completed successfully!"
      results.value = res
      error.value = null
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      const errorCode = e instanceof Error && 'name' in e ? e.name : 'DECRYPT_ERROR'
      
      error.value = `${errorCode}: ${errorMessage}`
      message.value = "Decryption failed"
      
      console.error('FHEVM Decryption Error:', {
        error: e,
        message: errorMessage,
        code: errorCode,
        instance: !!thisInstance,
        signer: !!thisSigner,
        requests: thisRequests.length
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
