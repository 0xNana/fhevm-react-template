<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        🏦 FHE Bank Demo
      </h1>
      <p class="text-xl text-gray-600 mb-2">
        Confidential banking with encrypted deposits, withdrawals, and transfers
      </p>
      <p class="text-sm text-gray-500">
        Vue 3 + Composition API + Universal FHEVM SDK
      </p>
    </div>

    <!-- Wallet Connection -->
    <div v-if="!isConnected" class="card text-center">
      <div class="mb-4">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-4xl">
          🏦
        </span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Wallet not connected</h2>
      <p class="text-gray-600 mb-6">Connect your wallet to use the FHE Bank demo.</p>
      <button
        v-for="connector in connectors"
        :key="connector.id"
        @click="connect(connector.id)"
        class="btn-primary mr-2"
      >
        Connect {{ connector.name }}
      </button>
    </div>

    <!-- Main Demo -->
    <div v-else class="space-y-6">
      <!-- FHEVM Status -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">🔧 Bank Status</h3>
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
              <span class="font-medium">Wallet</span>
              <span class="font-mono text-sm">{{ address?.slice(0, 10) }}...</span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Balance Handle</span>
              <span class="font-mono text-sm text-blue-600">
                {{ balanceHandle ? balanceHandle.toString().slice(0, 20) + '...' : 'None' }}
              </span>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Chain ID</span>
              <span class="font-mono text-sm">{{ chainId || 'Unknown' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Contract Address</span>
              <span class="font-mono text-sm text-green-600">
                {{ bankConfig.address?.slice(0, 10) }}...
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Decrypting</span>
              <span :class="isDecryptingSDK ? 'text-yellow-600' : 'text-gray-600'" class="font-mono text-sm">
                {{ isDecryptingSDK ? '⏳ Yes' : '✅ No' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Error</span>
              <span class="font-mono text-sm text-red-600">
                {{ hasError ? state.error?.message : 'None' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank Operations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Deposit -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">💰 Deposit</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                v-model="amount"
                type="number"
                class="input"
                placeholder="Enter amount to deposit"
              />
            </div>
            <button
              @click="handleDeposit"
              :disabled="!isConnected || isProcessing"
              class="btn-success w-full"
            >
              <span v-if="isProcessing">⏳ Processing...</span>
              <span v-else>💰 Deposit</span>
            </button>
          </div>
        </div>

        <!-- Withdraw -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">💸 Withdraw</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                v-model="amount"
                type="number"
                class="input"
                placeholder="Enter amount to withdraw"
              />
            </div>
            <button
              @click="handleWithdraw"
              :disabled="!isConnected || isProcessing"
              class="btn-danger w-full"
            >
              <span v-if="isProcessing">⏳ Processing...</span>
              <span v-else>💸 Withdraw</span>
            </button>
          </div>
        </div>

        <!-- Transfer -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">🔄 Transfer</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
              <input
                v-model="recipient"
                type="text"
                class="input"
                placeholder="0x..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                v-model="amount"
                type="number"
                class="input"
                placeholder="Enter amount to transfer"
              />
            </div>
            <button
              @click="handleTransfer"
              :disabled="!isConnected || isProcessing || !recipient"
              class="btn-primary w-full"
            >
              <span v-if="isProcessing">⏳ Processing...</span>
              <span v-else>🔄 Transfer</span>
            </button>
          </div>
        </div>

        <!-- View Balance -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">👁️ View Balance</h3>
          <div class="space-y-4">
            <p class="text-gray-600">Decrypt your encrypted balance</p>
            <button
              @click="handleDecryptBalance"
              :disabled="!isConnected || isDecryptingSDK"
              class="btn-secondary w-full"
            >
              <span v-if="isDecryptingSDK">⏳ Decrypting...</span>
              <span v-else>👁️ Decrypt Balance</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Balance Display -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">💰 Your Balance</h3>
        <div class="text-center">
          <div class="text-6xl font-bold text-blue-600 mb-4">
            {{ decryptedValue !== null ? decryptedValue : '🔒' }}
          </div>
          <p class="text-gray-600 mb-4">
            {{ decryptedValue !== null ? 'Decrypted Balance' : 'Encrypted Balance (Click Decrypt to reveal)' }}
          </p>
          <div class="flex justify-center space-x-4">
            <button
              @click="handleDecryptBalance"
              :disabled="!isConnected || isDecryptingSDK || !balanceHandle"
              class="btn-success"
            >
              <span v-if="isDecryptingSDK">⏳ Decrypting...</span>
              <span v-else>🔓 Decrypt Balance</span>
            </button>
            <button
              @click="resetDecryptionState"
              :disabled="!isConnected"
              class="btn-warning"
            >
              🔄 Reset Decryption
            </button>
            <button
              @click="fetchBalanceHandle"
              :disabled="!isConnected"
              class="btn-secondary"
            >
              🔄 Get Balance
            </button>
          </div>
        </div>
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
    console.log('🔍 Bank ethersSigner Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(signer)))
    console.log('🔍 Bank ethersSigner has signTypedData:', typeof signer.signTypedData === 'function')
    
    return signer
  } catch (error) {
    console.error('Failed to create ethers signer:', error)
    return undefined
  }
})

// Contract configuration
const bankConfig = getContractConfig('FHEBank')

// FHEVM Configuration
const fhevmConfig = {
  rpcUrl: import.meta.env.VITE_RPC_URL || `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 11155111,
  mockChains: {
    31337: "http://localhost:8545"
  }
}

// Add debugging for Relayer SDK loading
console.log("🔍 Bank FHEVM Config:", fhevmConfig)
console.log("🔍 Bank Window object:", typeof window !== 'undefined' ? 'available' : 'undefined')
console.log("🔍 Bank RelayerSDK in window:", typeof window !== 'undefined' && 'relayerSDK' in window ? 'available' : 'not available')

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

// Contract interactions - Only read balance handle after user has performed an operation
const balanceHandle = ref<string | null>(null)

// Use useReadContract but only when we explicitly want to fetch
const { data: fetchedBalance, refetch: refetchBalance, error: fetchError } = useReadContract({
  address: bankConfig.address,
  abi: bankConfig.abi as any,
  functionName: 'getEncryptedBalance',
  args: [address.value!],
  query: {
    enabled: false, // Always disabled initially
    refetchOnWindowFocus: false,
  },
})

// Debug the useReadContract state
watch([fetchedBalance, fetchError], () => {
  console.log("🔍 Bank useReadContract state:", {
    balance: fetchedBalance.value,
    error: fetchError.value,
    address: bankConfig.address,
    userAddress: address.value
  })
})

// Watch for changes in fetchedBalance and update balanceHandle
watch(fetchedBalance, (newBalance) => {
  console.log("🔍 Bank fetchedBalance watcher triggered:", newBalance)
  if (newBalance) {
    balanceHandle.value = newBalance as string
    console.log("🔍 Bank Fetched balance:", newBalance)
  }
})

// Watch for fetch errors
watch(fetchError, (error) => {
  if (error) {
    console.error("🔍 Bank Fetch error:", error)
  }
})

// Manual function to fetch the balance - ONLY after user operations
const fetchBalanceHandle = async () => {
  console.log("🔍 Bank fetchBalanceHandle called")
  console.log("🔍 Bank bankConfig.address:", bankConfig.address)
  console.log("🔍 Bank isFHEVMConnected.value:", isFHEVMConnected.value)
  console.log("🔍 Bank address.value:", address.value)
  
  if (!bankConfig.address || !isFHEVMConnected.value || !address.value) {
    console.log("🔍 Bank Missing requirements for fetchBalanceHandle")
    return
  }
  
  try {
    console.log("🔍 Bank Calling refetchBalance directly...")
    const result = await refetchBalance()
    console.log("🔍 Bank refetchBalance result:", result)
    console.log("🔍 Bank refetchBalance completed")
  } catch (error) {
    console.error("Failed to fetch balance handle:", error)
  }
}

const { 
  writeContract: writeBank, 
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
  if (!bankConfig.address || !balanceHandle.value || balanceHandle.value === ethers.ZeroHash) return undefined
  return [{ handle: balanceHandle.value.toString(), contractAddress: bankConfig.address as `0x${string}` }] as const
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
  console.log('🔍 Bank Dependencies check:', {
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
const amount = ref<string>("100")
const recipient = ref<string>("")

// Extract decrypted value from results
const decryptedValue = computed(() => {
  console.log("🔍 Bank decryptedValue computed - checking...")
  console.log("🔍 Bank balanceHandle.value:", balanceHandle.value)
  console.log("🔍 Bank results.value:", results.value)
  
  if (!balanceHandle.value) {
    console.log("🔍 Bank No balanceHandle, returning null")
    return null
  }
  
  if (balanceHandle.value === ethers.ZeroHash) {
    console.log("🔍 Bank balanceHandle is ZeroHash, returning 0")
    return 0
  }
  
  const handleKey = balanceHandle.value.toString()
  console.log("🔍 Bank Handle key:", handleKey)
  
  const clear = results.value?.[handleKey]
  console.log("🔍 Bank Clear value from results:", clear)
  console.log("🔍 Bank Clear type:", typeof clear)
  
  if (typeof clear === "undefined") {
    console.log("🔍 Bank Clear is undefined, returning null")
    return null
  }
  
  const numberValue = Number(clear)
  console.log("🔍 Bank Converted to number:", numberValue)
  return numberValue
})

const isDecrypted = computed(() => {
  return Boolean(balanceHandle.value && decryptedValue.value !== null)
})

// Core Functions - Fixed for Proper FHEVM Contract Interaction
const handleDeposit = async () => {
  if (!isConnected.value || !bankConfig.address) return
  
  isProcessing.value = true
  message.value = "💰 Depositing to bank..."
  
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
    
    // 2. Create proper externalEuint64 with proof for FHEBank.sol using correct FHEVM pattern
    message.value = "🔐 Creating encrypted input..."
    
    let externalEuint64: string
    let inputProof: string
    
    try {
      // Use the correct FHEVM pattern 
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(bankConfig.address, userAddress)
      input.add64(parseInt(amount.value)) // Deposit amount (64-bit for FHEBank)
      const encryptedResult = await input.encrypt()
      
      console.log("🔍 Bank Encryption result:", encryptedResult)
      console.log("🔍 Bank Handles:", encryptedResult.handles)
      console.log("🔍 Bank InputProof:", encryptedResult.inputProof)
      
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
      
      externalEuint64 = toHex(encryptedResult.handles[0])
      inputProof = toHex(encryptedResult.inputProof)
      
      console.log("🔍 Bank ExternalEuint64:", externalEuint64)
      console.log("🔍 Bank InputProof:", inputProof)
      
    } catch (encryptError) {
      console.error("❌ Bank Encryption error:", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    // 4. Call contract with proper hex format
    message.value = "📝 Signing transaction..."
    
    // Reset any previous write state
    resetWrite()
    
    try {
      // Write to contract with proper hex strings
      const txResult = await writeBank({
      address: bankConfig.address as `0x${string}`,
      abi: bankConfig.abi as any,
      functionName: 'deposit',
        args: [externalEuint64, inputProof], // Hex strings for externalEuint64 and bytes
      })
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.value = "✅ Deposit completed! Refreshing balance..."
      console.log("🔍 Bank Transaction result:", txResult)
      
      // Now fetch the balance after the transaction is confirmed
      await fetchBalanceHandle()
      console.log("🔍 Bank Balance after deposit:", balanceHandle.value)
      
    } catch (txError) {
      console.error("Bank Transaction error:", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Deposit failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Bank Deposit error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleWithdraw = async () => {
  if (!isConnected.value || !bankConfig.address) return
  
  isProcessing.value = true
  message.value = "💸 Withdrawing from bank..."
  
  // Clear previous decrypted value since we're making a new transaction
  // The decrypted value will be cleared automatically when the handle changes
  
  try {
    // 1. Ensure FHEVM instance is ready
    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    // 2. Create proper externalEuint64 with proof for FHEBank.sol using correct FHEVM pattern
    message.value = "🔐 Creating encrypted input..."
    
    let externalEuint64: string
    let inputProof: string
    
    try {
      // Use the correct FHEVM pattern from React example
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(bankConfig.address, userAddress)
      input.add64(parseInt(amount.value)) // Withdraw amount (64-bit for FHEBank)
      const encryptedResult = await input.encrypt()
      
      console.log("🔍 Bank Encryption result:", encryptedResult)
      console.log("🔍 Bank Handles:", encryptedResult.handles)
      console.log("🔍 Bank InputProof:", encryptedResult.inputProof)
      
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
      
      externalEuint64 = toHex(encryptedResult.handles[0])
      inputProof = toHex(encryptedResult.inputProof)
      
      console.log("🔍 Bank ExternalEuint64:", externalEuint64)
      console.log("🔍 Bank InputProof:", inputProof)
      
    } catch (encryptError) {
      console.error("❌ Bank Encryption error:", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    // 4. Call contract with proper hex format
    message.value = "📝 Signing transaction..."
    
    // Reset any previous write state
    resetWrite()
    
    try {
      // Write to contract with proper hex strings
      const txResult = await writeBank({
      address: bankConfig.address as `0x${string}`,
      abi: bankConfig.abi as any,
      functionName: 'withdraw',
        args: [externalEuint64, inputProof], // Hex strings for externalEuint64 and bytes
      })
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.value = "✅ Withdrawal completed! Refreshing balance..."
      console.log("🔍 Bank Transaction result:", txResult)
      
      // Now fetch the balance after the transaction is confirmed
      await fetchBalanceHandle()
      console.log("🔍 Bank Balance after withdrawal:", balanceHandle.value)
      
    } catch (txError) {
      console.error("Bank Transaction error:", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Withdrawal failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Bank Withdrawal error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleTransfer = async () => {
  if (!isConnected.value || !recipient.value || !bankConfig.address) return
  
  isProcessing.value = true
  message.value = "🔄 Transferring funds..."
  
  // Clear previous decrypted value since we're making a new transaction
  // The decrypted value will be cleared automatically when the handle changes
  
  try {
    const amountNum = parseInt(amount.value)
    if (isNaN(amountNum) || amountNum <= 0) {
      message.value = "Please enter a valid amount"
      return
    }

    if (!recipient.value.startsWith("0x") || recipient.value.length !== 42) {
      message.value = "Please enter a valid recipient address"
      return
    }

    // 1. Ensure FHEVM instance is ready
    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    // 2. Create proper externalEuint64 with proof for FHEBank.sol using correct FHEVM pattern
    message.value = "🔐 Creating encrypted input..."
    
    let externalEuint64: string
    let inputProof: string
    
    try {
      // Use the correct FHEVM pattern from React example
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(bankConfig.address, userAddress)
      input.add64(parseInt(amount.value)) // Transfer amount (64-bit for FHEBank)
      const encryptedResult = await input.encrypt()
      
      console.log("🔍 Bank Encryption result:", encryptedResult)
      console.log("🔍 Bank Handles:", encryptedResult.handles)
      console.log("🔍 Bank InputProof:", encryptedResult.inputProof)
      
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
      
      externalEuint64 = toHex(encryptedResult.handles[0])
      inputProof = toHex(encryptedResult.inputProof)
      
      console.log("🔍 Bank ExternalEuint64:", externalEuint64)
      console.log("🔍 Bank InputProof:", inputProof)
      
    } catch (encryptError) {
      console.error("❌ Bank Encryption error:", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    // 4. Call contract with proper hex format
    message.value = "📝 Signing transaction..."
    
    // Reset any previous write state
    resetWrite()
    
    try {
      // Write to contract with proper hex strings
      const txResult = await writeBank({
      address: bankConfig.address as `0x${string}`,
      abi: bankConfig.abi as any,
      functionName: 'transfer',
        args: [recipient.value, externalEuint64, inputProof], 
      })
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.value = "✅ Transfer completed! Refreshing balance..."
      console.log("🔍 Bank Transaction result:", txResult)
      
      // Now fetch the balance after the transaction is confirmed
      await fetchBalanceHandle()
      console.log("🔍 Bank Balance after transfer:", balanceHandle.value)
      
    } catch (txError) {
      console.error("Bank Transaction error:", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Transfer failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Bank Transfer error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleDecryptBalance = async () => {
  if (!balanceHandle.value) {
    message.value = "⚠️ No balance data to decrypt"
    return
  }

  console.log("🔍 Bank canDecrypt.value:", canDecrypt.value)
  console.log("🔍 Bank canDecrypt type:", typeof canDecrypt.value)
  
  if (!canDecrypt.value) {
    message.value = "⚠️ Cannot decrypt - missing dependencies (signer, instance, or requests)"
    return
  }

  try {
    console.log("🔍 Bank Starting signature-based decryption...")
    console.log("🔍 Bank Balance Handle:", balanceHandle.value)
    console.log("🔍 Bank Balance Handle type:", typeof balanceHandle.value)
    console.log("🔍 Bank Balance Handle toString():", balanceHandle.value?.toString())
    console.log("🔍 Bank Contract address:", bankConfig.address)
    console.log("🔍 Bank Current user address:", address.value)
    console.log("🔍 Bank Current results before decryption:", results.value)
    console.log("🔍 Bank About to call performDecrypt()...")
    console.log("🔍 Bank performDecrypt function:", typeof performDecrypt)
    console.log("🔍 Bank performDecrypt function exists:", !!performDecrypt)
    
    // Use the signature-based decryption
    console.log("🔍 Bank Calling performDecrypt now...")
    await performDecrypt()
    console.log("🔍 Bank performDecrypt() completed!")
    
    // Wait a moment for results to be processed
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log("🔍 Bank Results after decryption:", results.value)
    console.log("🔍 Bank Decrypted value computed:", decryptedValue.value)
    console.log("🔍 Bank Handle key for lookup:", balanceHandle.value.toString())
    
    // Check if we got a valid result
    if (decryptedValue.value === null) {
      console.warn("⚠️ Bank Decryption returned null - checking results object...")
      console.log("🔍 Bank Full results object:", JSON.stringify(results.value, null, 2))
      
      // Try to find the result by handle
      const handleKey = balanceHandle.value.toString()
      const result = results.value?.[handleKey]
      console.log("🔍 Bank Direct lookup result:", result)
      console.log("🔍 Bank Result type:", typeof result)
      console.log("🔍 Bank Result value:", result)
    }
    
    // The decrypted value will be available in results and automatically displayed
    message.value = `✅ Balance decryption completed! Value: ${decryptedValue.value}`
    
  } catch (error) {
    message.value = `❌ Balance decryption failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Bank Decryption error:", error)
  }
}

// Auto-initialize on mount
onMounted(() => {
  // FHEVM will auto-initialize through the composable
})
</script>
