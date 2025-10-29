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
import { useFHEVM, useFHEVMSignature, useFHEDecrypt, useInMemoryStorage } from '@fhevm/sdk/vue'
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
    
    // Log signer methods for debugging
    console.log('🔍 ethersSigner Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(signer)))
    console.log('🔍 ethersSigner has signTypedData:', typeof signer.signTypedData === 'function')
    
    return signer
  } catch (error) {
    console.error('Failed to create ethers signer:', error)
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

// Add debugging for Relayer SDK loading
console.log("🔍 FHEVM Config:", fhevmConfig)
console.log("🔍 Window object:", typeof window !== 'undefined' ? 'available' : 'undefined')
console.log("🔍 RelayerSDK in window:", typeof window !== 'undefined' && 'relayerSDK' in window ? 'available' : 'not available')

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

// Contract interactions - Only read count handle after user has performed an operation
const countHandle = ref<string | null>(null)

// Use useReadContract but only when we explicitly want to fetch
const { data: fetchedHandle, refetch: refetchCount, error: fetchError } = useReadContract({
  address: counterConfig.address,
  abi: counterConfig.abi as any,
  functionName: 'getCount',
  query: {
    enabled: false, // Always disabled initially
    refetchOnWindowFocus: false,
  },
})

// Debug the useReadContract state
watch([fetchedHandle, fetchError], () => {
  console.log("🔍 useReadContract state:", {
    handle: fetchedHandle.value,
    error: fetchError.value,
    address: counterConfig.address
  })
})

// Watch for changes in fetchedHandle and update countHandle
watch(fetchedHandle, (newHandle) => {
  console.log("🔍 fetchedHandle watcher triggered:", newHandle)
  if (newHandle) {
    countHandle.value = newHandle as string
    console.log("🔍 Fetched handle:", newHandle)
  }
})

// Watch for fetch errors
watch(fetchError, (error) => {
  if (error) {
    console.error("🔍 Fetch error:", error)
  }
})

// Manual function to fetch the handle - ONLY after user operations
const fetchCountHandle = async () => {
  console.log("🔍 fetchCountHandle called")
  console.log("🔍 counterConfig.address:", counterConfig.address)
  console.log("🔍 isFHEVMConnected.value:", isFHEVMConnected.value)
  
  if (!counterConfig.address || !isFHEVMConnected.value) {
    console.log("🔍 Missing requirements for fetchCountHandle")
    return
  }
  
  try {
    console.log("🔍 Calling refetchCount directly...")
    const result = await refetchCount()
    console.log("🔍 refetchCount result:", result)
    console.log("🔍 refetchCount completed")
  } catch (error) {
    console.error("Failed to fetch count handle:", error)
  }
}

const { 
  writeContract: writeCounter, 
  isPending: isWritePending, 
  error: writeError,
  isSuccess: isWriteSuccess,
  reset: resetWrite
} = useWriteContract()

// FHEVM Signature generation
const { 
  generateSignature, 
  signature, 
  isSigning, 
  error: signatureError 
} = useFHEVMSignature(computed(() => state.value.instance), address)

// In-memory storage for decryption signatures
const fhevmDecryptionSignatureStorage = useInMemoryStorage()

// Decryption requests for signature-based decryption
const requests = computed(() => {
  if (!counterConfig.address || !countHandle.value || countHandle.value === ethers.ZeroHash) return undefined
  return [{ handle: countHandle.value.toString(), contractAddress: counterConfig.address as `0x${string}` }] as const
})

// FHEVM Decryption using signature-based approach
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

// Manual reset function for now (until TypeScript recognizes the updated return type)
const resetDecryptionState = () => {
  // Reset the decryption state manually
  isDecryptingSDK.value = false
  decryptionError.value = null
  decryptionMessage.value = "Ready to decrypt"
}

// Debug dependencies - watch for changes
watch([() => state.value.instance, ethersSigner, requests, canDecrypt], () => {
  console.log('🔍 Dependencies check:', {
    instance: !!state.value.instance,
    ethersSigner: !!ethersSigner.value,
    ethersSignerType: typeof ethersSigner.value,
    ethersSignerValue: ethersSigner.value,
    chainId: chainId.value,
    requests: requests.value,
    requestsLength: requests.value?.length,
    canDecrypt: canDecrypt.value,
    // Check each dependency individually
    missingDependencies: {
      instance: !state.value.instance ? 'MISSING' : 'OK',
      signer: !ethersSigner.value ? 'MISSING' : 'OK', 
      requests: !requests.value || requests.value.length <= 0 ? 'MISSING' : 'OK'
    }
  })
}, { immediate: true })

// State for tracking operations
const isEncrypting = ref(false)
const encryptError = ref<Error | null>(null)

// State
const message = ref<string>("")
const isProcessing = ref(false)

// Extract decrypted value from results
const decryptedValue = computed(() => {
  console.log("🔍 decryptedValue computed - checking...")
  console.log("🔍 countHandle.value:", countHandle.value)
  console.log("🔍 results.value:", results.value)
  
  if (!countHandle.value) {
    console.log("🔍 No countHandle, returning null")
    return null
  }
  
  if (countHandle.value === ethers.ZeroHash) {
    console.log("🔍 countHandle is ZeroHash, returning 0")
    return 0
  }
  
  const handleKey = countHandle.value.toString()
  console.log("🔍 Handle key:", handleKey)
  
  const clear = results.value?.[handleKey]
  console.log("🔍 Clear value from results:", clear)
  console.log("🔍 Clear type:", typeof clear)
  
  if (typeof clear === "undefined") {
    console.log("🔍 Clear is undefined, returning null")
    return null
  }
  
  const numberValue = Number(clear)
  console.log("🔍 Converted to number:", numberValue)
  return numberValue
})

const isDecrypted = computed(() => {
  return Boolean(countHandle.value && decryptedValue.value !== null)
})

// Core Functions - Fixed for Proper FHEVM Contract Interaction
const handleIncrement = async () => {
  if (!isConnected.value || !counterConfig.address) return
  
  isProcessing.value = true
  message.value = "🔢 Incrementing counter..."
  
  // Clear previous decrypted value since we're making a new transaction
  // The decrypted value will be cleared automatically when the handle changes
  
  try {
    // 0. Check network first
    const expectedChainId = 11155111 // Sepolia
    if (chainId.value !== expectedChainId) {
      message.value = `⚠️ Wrong network! Please switch to Sepolia (Chain ID: ${expectedChainId}). Current: ${chainId.value}`
      return
    }
    
    // 1. Ensure FHEVM instance is ready
    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    // 2. Create proper externalEuint32 with proof for FHECounter.sol using correct FHEVM pattern
    message.value = "🔐 Creating encrypted input..."
    
    let externalEuint32: string
    let inputProof: string
    
    try {
      // Use the correct FHEVM pattern from React example
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(counterConfig.address, userAddress)
      input.add32(1) // Increment by 1
      const encryptedResult = await input.encrypt()
      
      console.log("🔍 Encryption result:", encryptedResult)
      console.log("🔍 Handles:", encryptedResult.handles)
      console.log("🔍 InputProof:", encryptedResult.inputProof)
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned")
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned")
      }
      
      // 3. Convert FHEVM objects to proper format using buildParamsFromAbi logic
      message.value = `🔐 Encrypted: ${encryptedResult.handles[0].toString().slice(0, 20)}...`
      
      // Convert Uint8Array to hex string for bytes32 and bytes
      const toHex = (data: Uint8Array) => {
        if (!data || !Array.isArray(Array.from(data))) {
          throw new Error("Invalid data for hex conversion")
        }
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      
      externalEuint32 = toHex(encryptedResult.handles[0])
      inputProof = toHex(encryptedResult.inputProof)
      
      console.log("🔍 ExternalEuint32:", externalEuint32)
      console.log("🔍 InputProof:", inputProof)
      
    } catch (encryptError) {
      console.error("❌ Encryption error:", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    // 4. Call contract with proper hex format
    message.value = "📝 Signing transaction..."
    
    // Reset any previous write state
    resetWrite()
    
    try {
      // Write to contract with proper hex strings
      const txResult = await writeCounter({
        address: counterConfig.address as `0x${string}`,
        abi: counterConfig.abi as any,
        functionName: 'increment',
        args: [externalEuint32, inputProof], // Hex strings for bytes32 and bytes
      })
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.value = "✅ Increment completed! Refreshing..."
      console.log("🔍 Transaction result:", txResult)
      
      // Now fetch the handle after the transaction is confirmed
      await fetchCountHandle()
      console.log("🔍 Handle after increment:", countHandle.value)
      
    } catch (txError) {
      console.error("Transaction error:", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Increment failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Increment error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleDecrement = async () => {
  if (!isConnected.value || !counterConfig.address) return
  
  isProcessing.value = true
  message.value = "➖ Decrementing counter..."
  
  // Clear previous decrypted value since we're making a new transaction
  // The decrypted value will be cleared automatically when the handle changes
  
  try {
    // 1. Ensure FHEVM instance is ready
    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    // 2. Create proper externalEuint32 with proof for FHECounter.sol using correct FHEVM pattern
    message.value = "🔐 Creating encrypted input..."
    
    let externalEuint32: string
    let inputProof: string
    
    try {
      // Use the correct FHEVM pattern from React example
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(counterConfig.address, userAddress)
      input.add32(1) // Decrement by 1 (contract will subtract this value)
      const encryptedResult = await input.encrypt()
      
      console.log("🔍 Encryption result:", encryptedResult)
      console.log("🔍 Handles:", encryptedResult.handles)
      console.log("🔍 InputProof:", encryptedResult.inputProof)
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned")
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned")
      }
      
      // 3. Convert FHEVM objects to proper format using buildParamsFromAbi logic
      message.value = `🔐 Encrypted: ${encryptedResult.handles[0].toString().slice(0, 20)}...`
      
      // Convert Uint8Array to hex string for bytes32 and bytes
      const toHex = (data: Uint8Array) => {
        if (!data || !Array.isArray(Array.from(data))) {
          throw new Error("Invalid data for hex conversion")
        }
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      
      externalEuint32 = toHex(encryptedResult.handles[0])
      inputProof = toHex(encryptedResult.inputProof)
      
      console.log("🔍 ExternalEuint32:", externalEuint32)
      console.log("🔍 InputProof:", inputProof)
      
    } catch (encryptError) {
      console.error("❌ Encryption error:", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    // 4. Call contract with proper hex format
    message.value = "📝 Signing transaction..."
    
    // Reset any previous write state
    resetWrite()
    
    try {
      // Write to contract with proper hex strings
      const txResult = await writeCounter({
        address: counterConfig.address as `0x${string}`,
        abi: counterConfig.abi as any,
        functionName: 'decrement',
        args: [externalEuint32, inputProof], // Hex strings for bytes32 and bytes
      })
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.value = "✅ Decrement completed! Refreshing..."
      console.log("🔍 Transaction result:", txResult)
      
      // Now fetch the handle after the transaction is confirmed
      await fetchCountHandle()
      console.log("🔍 Handle after decrement:", countHandle.value)
      
    } catch (txError) {
      console.error("Transaction error:", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Decrement failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Decrement error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleDecrypt = async () => {
  if (!countHandle.value) {
    message.value = "⚠️ No counter data to decrypt"
    return
  }

  console.log("🔍 canDecrypt.value:", canDecrypt.value)
  console.log("🔍 canDecrypt type:", typeof canDecrypt.value)
  
  if (!canDecrypt.value) {
    message.value = "⚠️ Cannot decrypt - missing dependencies (signer, instance, or requests)"
    return
  }

  try {
    console.log("🔍 Starting signature-based decryption...")
    console.log("🔍 Handle:", countHandle.value)
    console.log("🔍 Handle type:", typeof countHandle.value)
    console.log("🔍 Handle toString():", countHandle.value?.toString())
    console.log("🔍 Contract address:", counterConfig.address)
    console.log("🔍 Current user address:", address.value)
    console.log("🔍 Current results before decryption:", results.value)
    console.log("🔍 About to call performDecrypt()...")
    console.log("🔍 performDecrypt function:", typeof performDecrypt)
    console.log("🔍 performDecrypt function exists:", !!performDecrypt)
    
    // Use the signature-based decryption
    console.log("🔍 Calling performDecrypt now...")
    await performDecrypt()
    console.log("🔍 performDecrypt() completed!")
    
    // Wait a moment for results to be processed
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log("🔍 Results after decryption:", results.value)
    console.log("🔍 Decrypted value computed:", decryptedValue.value)
    console.log("🔍 Handle key for lookup:", countHandle.value.toString())
    
    // Check if we got a valid result
    if (decryptedValue.value === null) {
      console.warn("⚠️ Decryption returned null - checking results object...")
      console.log("🔍 Full results object:", JSON.stringify(results.value, null, 2))
      
      // Try to find the result by handle
      const handleKey = countHandle.value.toString()
      const result = results.value?.[handleKey]
      console.log("🔍 Direct lookup result:", result)
      console.log("🔍 Result type:", typeof result)
      console.log("🔍 Result value:", result)
    }
    
    // The decrypted value will be available in results and automatically displayed
    message.value = `✅ Decryption completed! Value: ${decryptedValue.value}`
    
  } catch (error) {
    message.value = `❌ Decryption failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Decryption error:", error)
  }
}

// Auto-initialize on mount
onMounted(() => {
  // FHEVM will auto-initialize through the composable
})
</script>
