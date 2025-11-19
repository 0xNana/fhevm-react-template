<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        🔢 Counter Demo
      </h1>
      <p class="text-xl text-gray-600 mb-2">
        Using Universal FHEVM SDK with Vue 3 Composition API
      </p>
      <p class="text-sm text-gray-500">
        Encrypted counter operations with real-time status monitoring
      </p>
    </div>

    <!-- Wallet Not Connected Message -->
    <div v-if="!isConnected" class="card text-center">
      <div class="mb-4">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 text-4xl">
          ⚠️
        </span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Wallet not connected</h2>
      <p class="text-gray-600 mb-6">Connect your wallet using the button in the header to use the Enhanced FHE Counter demo.</p>
    </div>

    <!-- Main Demo -->
    <div v-if="isConnected" class="space-y-6">
      <!-- Network Status -->
      <div v-if="chainId !== 11155111" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h3 class="font-bold text-yellow-800 text-lg mb-2">⚠️ Network Warning</h3>
        <p class="text-yellow-700 mb-3">
          You're connected to Chain ID {{ chainId }}, but contracts are deployed on Sepolia (Chain ID: 11155111).
        </p>
        <p class="text-yellow-600 text-sm">
          Please switch your wallet to Sepolia testnet to use the FHEVM contracts.
        </p>
      </div>

      <!-- FHEVM Status -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">🔧 FHEVM Status</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Status</span>
              <span :class="statusColor" class="font-mono text-sm">
                {{ statusMessage }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Ready</span>
              <span :class="isConnected ? 'text-green-600' : 'text-red-600'" class="font-mono text-sm">
                {{ isConnected ? '✅ Yes' : '❌ No' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Loading</span>
              <span :class="isLoading ? 'text-yellow-600' : 'text-gray-600'" class="font-mono text-sm">
                {{ isLoading ? '⏳ Yes' : '✅ No' }}
              </span>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Chain ID</span>
              <span :class="chainId === 11155111 ? 'text-green-600' : 'text-red-600'" class="font-mono text-sm">
                {{ chainId || 'Unknown' }} {{ chainId === 11155111 ? '✅' : '❌' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Contract</span>
              <span class="font-mono text-sm">{{ counterConfig.address?.slice(0, 10) }}...</span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Count Handle</span>
              <span class="font-mono text-sm">{{ (countHandle as string)?.slice(0, 10) || 'None' }}...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Operations -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="handleIncrement"
          :disabled="!isConnected || isProcessing"
          class="btn-primary text-lg py-4"
        >
          <span v-if="isProcessing">⏳ Processing...</span>
          <span v-else>➕ Increment +1</span>
        </button>

        <button
          @click="handleDecrement"
          :disabled="!isConnected || isProcessing"
          class="btn-secondary text-lg py-4"
        >
          <span v-if="isProcessing">⏳ Processing...</span>
          <span v-else>➖ Decrement -1</span>
        </button>

      </div>

      <!-- Counter Value Display -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">🔢 Counter Value</h3>
        <div class="text-center">
          <div class="text-6xl font-bold text-blue-600 mb-4">
            {{ decryptedValue !== null ? decryptedValue : '🔒' }}
          </div>
          <p class="text-gray-600 mb-4">
            {{ decryptedValue !== null ? 'Decrypted Counter Value' : 'Encrypted Counter (Click Decrypt to reveal)' }}
          </p>
          <div class="flex justify-center space-x-4">
            <button
              @click="handleDecrypt"
              :disabled="!isConnected || isDecryptingSDK || !countHandle"
              class="btn-success"
            >
              <span v-if="isDecryptingSDK">⏳ Decrypting...</span>
              <span v-else>🔓 Decrypt Counter</span>
            </button>
            <button
              @click="resetDecryptionState"
              :disabled="!isConnected"
              class="btn-warning"
            >
              🔄 Reset Decryption
            </button>
            <button
              @click="fetchCountHandle"
              :disabled="!isConnected"
              class="btn-secondary"
            >
              🔄 Get Handle
            </button>
          </div>
        </div>
      </div>


      <!-- Results -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">📊 Results</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Counter Handle</span>
              <span class="font-mono text-sm text-blue-600">
                {{ countHandle ? countHandle.toString().slice(0, 20) + '...' : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Contract Address</span>
              <span class="font-mono text-sm text-green-600">
                {{ counterConfig.address?.slice(0, 10) }}...
              </span>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Encrypting</span>
              <span :class="isEncrypting ? 'text-yellow-600' : 'text-gray-600'" class="font-mono text-sm">
                {{ isEncrypting ? '⏳ Yes' : '✅ No' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Decrypting</span>
              <span :class="isDecryptingSDK ? 'text-yellow-600' : 'text-gray-600'" class="font-mono text-sm">
                {{ isDecryptingSDK ? '⏳ Yes' : '✅ No' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="message" class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">💬 Messages</h3>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-gray-800">{{ message }}</p>
        </div>
      </div>

      <!-- Transaction Status -->
      <div v-if="isWritePending" class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 class="font-bold text-blue-800 text-lg mb-2">⏳ Transaction Pending</h3>
        <p class="text-blue-700">Your transaction is being processed. Please wait...</p>
      </div>

      <!-- Transaction Success -->
      <div v-if="isWriteSuccess" class="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 class="font-bold text-green-800 text-lg mb-2">✅ Transaction Successful</h3>
        <p class="text-green-700">Your transaction has been confirmed on the blockchain!</p>
      </div>


      <!-- Decryption Status -->
      <div v-if="decryptionMessage || decryptionError" class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">🔓 Decryption Status</h3>
        <div class="space-y-3">
          <div v-if="decryptionMessage" class="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
            <span class="font-medium">Message</span>
            <span class="text-sm text-blue-600">{{ decryptionMessage }}</span>
          </div>
          <div v-if="decryptionError" class="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
            <span class="font-medium">Error</span>
            <span class="text-sm text-red-600">{{ decryptionError }}</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
            <span class="font-medium">Can Decrypt</span>
            <span :class="canDecrypt ? 'text-green-600' : 'text-red-600'" class="text-sm">
              {{ canDecrypt ? '✅ Yes' : '❌ No' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Errors -->
      <div v-if="hasError || encryptError || signatureError || writeError" class="bg-red-50 border border-red-200 p-4 rounded-lg">
        <h3 class="font-bold text-red-800 text-lg mb-2">❌ Errors</h3>
        <div class="space-y-2">
          <p v-if="hasError" class="text-red-700">FHEVM: {{ state.error?.message }}</p>
          <p v-if="encryptError" class="text-red-700">Encrypt: {{ encryptError.message }}</p>
          <p v-if="signatureError" class="text-red-700">Signature: {{ signatureError.message }}</p>
          <p v-if="writeError" class="text-red-700">Transaction: {{ writeError.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFHEVM, useFHEVMSignature, useFHEDecrypt, useInMemoryStorage, logger } from '@fhevm/sdk/vue'
import { useWallet } from '@/composables/useWallet'
import { getContractConfig } from '@/contracts'
import { useReadContract, useWriteContract } from '@wagmi/vue'
import { ethers } from 'ethers'

// Wallet
const { isConnected, address, chainId, connect, connectors } = useWallet()

// Create ethers signer from window.ethereum (same as contract operations use)
const ethersSigner = computed(() => {
  if (!isConnected.value || !address.value) return undefined
  
  try {
    // Use the same ethereum provider that Wagmi uses
    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = new ethers.JsonRpcSigner(provider, address.value)
    
    return signer
  } catch (error) {
    logger.error('Failed to create ethers signer', error)
    return undefined
  }
})

// Contract configuration
const counterConfig = getContractConfig('FHECounter')

// FHEVM Configuration
const fhevmConfig = {
  rpcUrl: import.meta.env.VITE_RPC_URL || `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 11155111,
  mockChains: {
    31337: "http://localhost:8545"
  }
}

// Debug info available via logger.debug if needed

// FHEVM
const { 
  state, 
  isReady: isFHEVMConnected, 
  hasError, 
  isInitializing: isLoading
} = useFHEVM(fhevmConfig)

// Computed properties for status display
const statusMessage = computed(() => {
  switch (state.value.status) {
    case 'idle': return 'Initializing...'
    case 'loading': return 'Loading FHEVM...'
    case 'ready': return 'Ready'
    case 'error': return 'Error'
    default: return 'Unknown'
  }
})

const statusColor = computed(() => {
  switch (state.value.status) {
    case 'ready': return 'text-green-600'
    case 'error': return 'text-red-600'
    case 'loading': return 'text-yellow-600'
    default: return 'text-gray-600'
  }
})

const countHandle = ref<string | null>(null)

const { data: fetchedHandle, refetch: refetchCount, error: fetchError } = useReadContract({
  address: computed(() => counterConfig.address as `0x${string}` | undefined),
  abi: counterConfig.abi as any,
  functionName: 'getCount',
  query: {
    enabled: false, 
    refetchOnWindowFocus: false,
  },
})

watch(fetchedHandle, (newHandle) => {
  if (newHandle) {
    countHandle.value = newHandle as string
  }
})

watch(fetchError, (error) => {
  if (error) {
    logger.error("Fetch error", error)
  }
})

const fetchCountHandle = async () => {
  if (!counterConfig.address || !isFHEVMConnected.value) {
    return
  }
  
  try {
    await refetchCount()
  } catch (error) {
    logger.error("Failed to fetch count handle", error)
  }
}

const { 
  writeContract: writeCounter, 
  isPending: isWritePending, 
  error: writeError,
  isSuccess: isWriteSuccess,
  reset: resetWrite
} = useWriteContract()

const { 
  generateSignature, 
  signature, 
  isSigning, 
  error: signatureError 
} = useFHEVMSignature(computed(() => state.value.instance), address)

const fhevmDecryptionSignatureStorage = useInMemoryStorage()

const requests = computed(() => {
  if (!counterConfig.address || !countHandle.value || countHandle.value === ethers.ZeroHash) return undefined
  return [{ handle: countHandle.value.toString(), contractAddress: counterConfig.address as `0x${string}` }] as const
})

const {
  canDecrypt,
  decrypt: performDecrypt,
  isDecrypting: isDecryptingSDK,
  message: decryptionMessage,
  results,
  error: decryptionError
} = useFHEDecrypt({
  instance: computed(() => state.value.instance),
  ethersSigner: computed(() => ethersSigner.value),
  fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage.storage.value,
  requests: requests
})

const resetDecryptionState = () => {
  isDecryptingSDK.value = false
  decryptionError.value = null
  decryptionMessage.value = "Ready to decrypt"
}

watch([() => state.value.instance, ethersSigner, requests, canDecrypt], () => {
  logger.debug('Dependencies check', {
    instance: !!state.value.instance,
    ethersSigner: !!ethersSigner.value,
    ethersSignerType: typeof ethersSigner.value,
    ethersSignerValue: ethersSigner.value,
    chainId: chainId.value,
    requests: requests.value,
    requestsLength: requests.value?.length,
    canDecrypt: canDecrypt.value,
    missingDependencies: {
      instance: !state.value.instance ? 'MISSING' : 'OK',
      signer: !ethersSigner.value ? 'MISSING' : 'OK', 
      requests: !requests.value || requests.value.length <= 0 ? 'MISSING' : 'OK'
    }
  })
}, { immediate: true })

const isEncrypting = ref(false)
const encryptError = ref<Error | null>(null)

const message = ref<string>("")
const isProcessing = ref(false)

const decryptedValue = computed(() => {
  if (!countHandle.value) {
    return null
  }
  
  if (countHandle.value === ethers.ZeroHash) {
    return 0
  }
  
  const handleKey = countHandle.value.toString()
  const clear = results.value?.[handleKey]
  
  if (typeof clear === "undefined") {
    return null
  }
  
  return Number(clear)
})

const isDecrypted = computed(() => {
  return Boolean(countHandle.value && decryptedValue.value !== null)
})

const handleIncrement = async () => {
  if (!isConnected.value || !counterConfig.address) return
  
  isProcessing.value = true
  message.value = "🔢 Incrementing counter..."
  
  try {
    const expectedChainId = 11155111 // Sepolia
    if (chainId.value !== expectedChainId) {
      message.value = `⚠️ Wrong network! Please switch to Sepolia (Chain ID: ${expectedChainId}). Current: ${chainId.value}`
      return
    }
    
    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    message.value = "🔐 Creating encrypted input..."
    
    let externalEuint32: string
    let inputProof: string
    
    try {
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(counterConfig.address, userAddress)
      input.add32(1) 
      const encryptedResult = await input.encrypt()
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned")
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned")
      }
      
      message.value = `🔐 Encrypted: ${encryptedResult.handles[0].toString().slice(0, 20)}...`
      
      const toHex = (data: Uint8Array) => {
        if (!data || !Array.isArray(Array.from(data))) {
          throw new Error("Invalid data for hex conversion")
        }
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      
      externalEuint32 = toHex(encryptedResult.handles[0])
      inputProof = toHex(encryptedResult.inputProof)
      
    } catch (encryptError) {
      logger.error("Encryption error", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    message.value = "📝 Signing transaction..."
    
    resetWrite()
    
    try {
      const txResult = await writeCounter({
        address: counterConfig.address as `0x${string}`,
        abi: counterConfig.abi as any,
        functionName: 'increment',
        args: [externalEuint32, inputProof], 
      })
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.value = "✅ Increment completed! Refreshing..."
      
      await fetchCountHandle()
      
    } catch (txError) {
      logger.error("Transaction error", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Increment failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error("Increment error", error)
  } finally {
    isProcessing.value = false
  }
}

const handleDecrement = async () => {
  if (!isConnected.value || !counterConfig.address) return
  
  isProcessing.value = true
  message.value = "➖ Decrementing counter..."
  
  try {
    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    message.value = "🔐 Creating encrypted input..."
    
    let externalEuint32: string
    let inputProof: string
    
    try {
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(counterConfig.address, userAddress)
      input.add32(1) 
      const encryptedResult = await input.encrypt()
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned")
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned")
      }
      
        message.value = `🔐 Encrypted: ${encryptedResult.handles[0].toString().slice(0, 20)}...`
      
      const toHex = (data: Uint8Array) => {
        if (!data || !Array.isArray(Array.from(data))) {
          throw new Error("Invalid data for hex conversion")
        }
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      
      externalEuint32 = toHex(encryptedResult.handles[0])
      inputProof = toHex(encryptedResult.inputProof)
      
    } catch (encryptError) {
      logger.error("Encryption error", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    message.value = "📝 Signing transaction..."
    
    resetWrite()
    
    try {
      const txResult = await writeCounter({
        address: counterConfig.address as `0x${string}`,
        abi: counterConfig.abi as any,
        functionName: 'decrement',
        args: [externalEuint32, inputProof], 
      })
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.value = "✅ Decrement completed! Refreshing..."
      
      await fetchCountHandle()
      
    } catch (txError) {
      logger.error("Transaction error", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Decrement failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error("Decrement error", error)
  } finally {
    isProcessing.value = false
  }
}

const handleDecrypt = async () => {
  if (!countHandle.value) {
    message.value = "⚠️ No counter data to decrypt"
    return
  }

  if (!canDecrypt.value) {
    message.value = "⚠️ Cannot decrypt - missing dependencies (signer, instance, or requests)"
    return
  }

  try {
    await performDecrypt()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (decryptedValue.value === null) {
      logger.warn("Decryption returned null", { results: results.value })
    }
    
    message.value = `✅ Decryption completed! Value: ${decryptedValue.value}`
    
  } catch (error) {
    message.value = `❌ Decryption failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error("Decryption error", error)
  }
}

onMounted(() => {
})
</script>
