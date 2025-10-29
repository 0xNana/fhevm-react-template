<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        🗳️ FHE Voting Demo
      </h1>
      <p class="text-xl text-gray-600 mb-2">
        Confidential voting with encrypted votes and results
      </p>
      <p class="text-sm text-gray-500">
        Vue 3 + Composition API + Universal FHEVM SDK
      </p>
    </div>

    <!-- Wallet Connection -->
    <div v-if="!isConnected" class="card text-center">
      <div class="mb-4">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-4xl">
          🗳️
        </span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Wallet not connected</h2>
      <p class="text-gray-600 mb-6">Connect your wallet to use the FHE Voting demo.</p>
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
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">🔧 Voting Status</h3>
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
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Chain ID</span>
              <span class="font-mono text-sm">{{ chainId || 'Unknown' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Session Counter</span>
              <span class="font-mono text-sm text-blue-600">
                {{ sessionCounter?.toString() || 'Loading...' }}
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

      <!-- Voting Operations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Create Session -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">📝 Create Voting Session</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                v-model="sessionTitle"
                type="text"
                class="input"
                placeholder="Enter session title"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="sessionDescription"
                class="input"
                placeholder="Enter session description"
                rows="3"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
              <input
                v-model="sessionDuration"
                type="number"
                class="input"
                placeholder="3600"
              />
            </div>
            <div class="flex space-x-2">
            <button
              @click="handleCreateSession"
              :disabled="!isConnected || isProcessing"
                class="btn-success flex-1"
            >
              <span v-if="isProcessing">⏳ Creating...</span>
              <span v-else>📝 Create Session</span>
            </button>
              <button
                @click="resetSession"
                :disabled="!isConnected"
                class="btn-warning"
              >
                🔄 Reset
            </button>
            </div>
          </div>
        </div>

        <!-- Cast Vote -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">🗳️ Cast Vote</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
              <div class="flex space-x-2">
              <input
                v-model="sessionId"
                type="number"
                  class="input flex-1"
                placeholder="0"
              />
                <button
                  @click="getLatestSessionId"
                  :disabled="!isConnected"
                  class="btn-secondary"
                >
                  🔍 Latest
                </button>
                <button
                  @click="refreshSessionInfo"
                  :disabled="!isConnected || sessionId === '0'"
                  class="btn-secondary"
                >
                  ℹ️ Info
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Vote Choice</label>
              <select
                v-model="voteChoice"
                class="input"
              >
                <option value="yes">✅ Yes</option>
                <option value="no">❌ No</option>
              </select>
            </div>
            <button
              @click="handleCastVote"
              :disabled="!isConnected || isProcessing"
              class="btn-primary w-full"
            >
              <span v-if="isProcessing">⏳ Voting...</span>
              <span v-else>🗳️ Cast Vote</span>
            </button>
          </div>
        </div>

        <!-- End Session -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">🔚 End Session</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
              <div class="flex space-x-2">
              <input
                v-model="sessionId"
                type="number"
                  class="input flex-1"
                placeholder="0"
              />
                <button
                  @click="getLatestSessionId"
                  :disabled="!isConnected"
                  class="btn-secondary"
                >
                  🔍 Latest
                </button>
                <button
                  @click="refreshSessionInfo"
                  :disabled="!isConnected || sessionId === '0'"
                  class="btn-secondary"
                >
                  ℹ️ Info
                </button>
              </div>
            </div>
            <button
              @click="handleEndSession"
              :disabled="!isConnected || isProcessing"
              class="btn-danger w-full"
            >
              <span v-if="isProcessing">⏳ Ending...</span>
              <span v-else>🔚 End Session</span>
            </button>
          </div>
        </div>

        <!-- View Results -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-900">📊 View Results</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
              <div class="flex space-x-2">
              <input
                v-model="sessionId"
                type="number"
                  class="input flex-1"
                placeholder="0"
              />
                <button
                  @click="getLatestSessionId"
                  :disabled="!isConnected"
                  class="btn-secondary"
                >
                  🔍 Latest
                </button>
                <button
                  @click="refreshSessionInfo"
                  :disabled="!isConnected || sessionId === '0'"
                  class="btn-secondary"
                >
                  ℹ️ Info
                </button>
            </div>
            </div>
            <div class="flex justify-center">
              <button
                @click="handleDecryptResults"
                :disabled="!isConnected || isProcessing || !resultsHandles.yesVotes || !checkSessionHasVotes()"
                class="btn-success"
            >
              <span v-if="isProcessing">⏳ Decrypting...</span>
                <span v-else>🔓 Decrypt Results</span>
            </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Session Info -->
      <div v-if="sessionInfo" class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">📋 Session Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Title</span>
              <span class="font-mono text-sm">{{ (sessionInfo as any)?.[0] || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Description</span>
              <span class="font-mono text-sm">{{ (sessionInfo as any)?.[1] || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Active</span>
              <span :class="(sessionInfo as any)?.[2] ? 'text-green-600' : 'text-red-600'" class="font-mono text-sm">
                {{ (sessionInfo as any)?.[2] ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">End Time</span>
              <span class="font-mono text-sm">
                {{ (sessionInfo as any)?.[3] ? new Date(Number((sessionInfo as any)[3]) * 1000).toLocaleString() : 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Has Voted</span>
              <span :class="hasVoted ? 'text-green-600' : 'text-red-600'" class="font-mono text-sm">
                {{ hasVoted ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>
        </div>
      </div>


      <!-- Results Display -->
      <div v-if="decryptedResults" class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">📊 Voting Results</h3>
        <div class="text-center">
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-green-600 mb-2">
                {{ decryptedResults.yesVotes }}
              </div>
              <div class="text-sm text-green-700">Yes Votes</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-red-600 mb-2">
                {{ decryptedResults.noVotes }}
              </div>
              <div class="text-sm text-red-700">No Votes</div>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-blue-600 mb-2">
                {{ decryptedResults.totalVotes }}
              </div>
              <div class="text-sm text-blue-700">Total Votes</div>
            </div>
          </div>
          <div class="flex justify-center space-x-4">
            <button
              @click="handleDecryptResults"
              :disabled="!isConnected || isDecryptingSDK || !resultsHandles.yesVotes"
              class="btn-success"
            >
              <span v-if="isDecryptingSDK">⏳ Decrypting...</span>
              <span v-else>🔓 Decrypt Results</span>
            </button>
            <button
              @click="resetDecryptionState"
              :disabled="!isConnected"
              class="btn-warning"
            >
              🔄 Reset Decryption
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">📊 Voting Data</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Results Handles</span>
              <span class="font-mono text-sm text-blue-600">
                {{ resultsHandles.yesVotes ? 'Yes: ' + (resultsHandles.yesVotes?.slice(0, 10) + '...') : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="font-medium">Decrypted Results</span>
              <span class="font-mono text-sm text-green-600">
                {{ decryptedResults ? `Yes: ${decryptedResults.yesVotes}, No: ${decryptedResults.noVotes}` : 'None' }}
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
    console.log('🔍 Voting ethersSigner Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(signer)))
    console.log('🔍 Voting ethersSigner has signTypedData:', typeof signer.signTypedData === 'function')
    
    return signer
  } catch (error) {
    console.error('Failed to create ethers signer:', error)
    return undefined
  }
})

// Contract configuration
const votingConfig = getContractConfig('FHEVoting')

// FHEVM Configuration
const fhevmConfig = {
  rpcUrl: import.meta.env.VITE_RPC_URL || `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 11155111,
  mockChains: {
    31337: "http://localhost:8545"
  }
}

// Add debugging for Relayer SDK loading
console.log("🔍 Voting FHEVM Config:", fhevmConfig)
console.log("🔍 Voting Window object:", typeof window !== 'undefined' ? 'available' : 'undefined')
console.log("🔍 Voting RelayerSDK in window:", typeof window !== 'undefined' && 'relayerSDK' in window ? 'available' : 'not available')

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

// State for tracking operations
const isEncrypting = ref(false)
const encryptError = ref<Error | null>(null)

// State
const message = ref<string>("")
const isProcessing = ref(false)
const voteChoice = ref<"yes" | "no">("yes")
const sessionTitle = ref<string>("")
const sessionDescription = ref<string>("")
const sessionDuration = ref<string>("3600") // 1 hour in seconds
const sessionId = ref<string>("0")

// Contract interactions - Session info and voting status
const { data: sessionInfo, refetch: refetchSessionInfo } = useReadContract({
  address: votingConfig.address,
  abi: votingConfig.abi as any,
  functionName: 'getVotingSessionInfo',
  args: computed(() => [BigInt(sessionId.value)]),
  query: {
    enabled: computed(() => Boolean(votingConfig.address && isFHEVMConnected.value && sessionId.value && sessionId.value !== "0")),
    refetchOnWindowFocus: false,
  },
})

const { data: hasVoted, refetch: refetchHasVoted } = useReadContract({
  address: votingConfig.address,
  abi: votingConfig.abi as any,
  functionName: 'hasUserVoted',
  args: computed(() => [address.value!, BigInt(sessionId.value)]),
  query: {
    enabled: computed(() => Boolean(votingConfig.address && address.value && isFHEVMConnected.value && sessionId.value && sessionId.value !== "0")),
    refetchOnWindowFocus: false,
  },
})

// For fetching encrypted results - use useReadContract since getEncryptedResults is now view
const { data: encryptedResults, refetch: refetchEncryptedResults } = useReadContract({
  address: votingConfig.address,
  abi: votingConfig.abi as any,
  functionName: 'getEncryptedResults',
  args: computed(() => [BigInt(sessionId.value)]),
  query: {
    enabled: false, // We'll call it manually
    refetchOnWindowFocus: false,
  },
})

// Watch for session ID changes and log the current args
watch(() => [BigInt(sessionId.value)], (newArgs) => {
  console.log("🔍 Voting encryptedResults args changed to:", newArgs)
}, { immediate: true })

// For getting the current session counter
const { data: sessionCounter, refetch: refetchSessionCounter } = useReadContract({
  address: votingConfig.address,
  abi: votingConfig.abi as any,
  functionName: 'sessionCounter',
  query: {
    enabled: Boolean(votingConfig.address && isFHEVMConnected.value),
    refetchOnWindowFocus: false,
  },
})


const { writeContract: writeVoting, isPending: isWritePending, error: writeError, isSuccess: isWriteSuccess, reset: resetWrite } = useWriteContract()

// FHEVM Signature generation
const { 
  generateSignature, 
  signature, 
  isSigning, 
  error: signatureError 
} = useFHEVMSignature(computed(() => state.value.instance), address)

// In-memory storage for decryption signatures
const fhevmDecryptionSignatureStorage = useInMemoryStorage()

// Results decryption - for getEncryptedResults
const resultsHandles = ref<{yesVotes: string | null, noVotes: string | null, totalVotes: string | null}>({
  yesVotes: null,
  noVotes: null,
  totalVotes: null
})

// Watch for session ID changes and reset results handles
watch(sessionId, async (newSessionId, oldSessionId) => {
  if (newSessionId !== oldSessionId) {
    console.log("🔍 Voting Session ID changed from", oldSessionId, "to", newSessionId)
    
    // Always reset handles when session ID changes
    resultsHandles.value = {
      yesVotes: null,
      noVotes: null,
      totalVotes: null
    }
    
    // Clear any existing decryption results
    console.log("🔍 Voting Cleared results handles for new session:", newSessionId)
    
    // Only auto-fetch if we have a valid session ID
    if (newSessionId && newSessionId !== "0") {
      try {
        console.log("🔍 Voting Auto-fetching results for new session:", newSessionId)
        await fetchResultsHandles()
      } catch (error) {
        console.log("🔍 Voting Auto-fetch failed (session may not be ended yet):", error)
      }
    }
  }
}, { immediate: false })

// Get latest results handles for the current session
const getLatestResultsHandles = async () => {
  try {
    console.log("🔍 Voting getLatestResultsHandles called for session:", sessionId.value)
    
    if (!sessionId.value || sessionId.value === "0") {
      message.value = "⚠️ Please select a session first"
      return
    }
    
    // Force clear existing handles first
    resultsHandles.value = {
      yesVotes: null,
      noVotes: null,
      totalVotes: null
    }
    
    console.log("🔍 Voting Cleared existing handles, fetching fresh ones...")
    await fetchResultsHandles()
    message.value = `✅ Latest results handles fetched for session ${sessionId.value}!`
    
  } catch (error) {
    console.error("Failed to get latest results handles:", error)
    message.value = `❌ Failed to get latest results: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Force refresh results handles for current session
const forceRefreshResultsHandles = async () => {
  try {
    console.log("🔍 Voting forceRefreshResultsHandles called for session:", sessionId.value)
    
    if (!sessionId.value || sessionId.value === "0") {
      message.value = "⚠️ Please select a session first"
      return
    }
    
    // Clear existing handles
    resultsHandles.value = {
      yesVotes: null,
      noVotes: null,
      totalVotes: null
    }
    
    // Force refetch with current session ID
    console.log("🔍 Voting Force refetching with session ID:", sessionId.value)
    await fetchResultsHandles()
    
    message.value = `✅ Results handles refreshed for session ${sessionId.value}!`
    
  } catch (error) {
    console.error("Failed to force refresh results handles:", error)
    message.value = `❌ Failed to refresh results: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Force clear all handles and reset state
const forceClearAllHandles = () => {
  console.log("🔍 Voting forceClearAllHandles called")
  
  // Clear all handles
  resultsHandles.value = {
    yesVotes: null,
    noVotes: null,
    totalVotes: null
  }
  
  // Reset session ID to force fresh start
  sessionId.value = "0"
  
  console.log("🔍 Voting All handles cleared and session reset")
  message.value = "🔄 All handles cleared - select a new session"
}

// Check if session has votes
const checkSessionHasVotes = () => {
  if (!resultsHandles.value.yesVotes || !resultsHandles.value.noVotes || !resultsHandles.value.totalVotes) {
    return false
  }
  
  const allZero = resultsHandles.value.yesVotes === ethers.ZeroHash && 
                  resultsHandles.value.noVotes === ethers.ZeroHash && 
                  resultsHandles.value.totalVotes === ethers.ZeroHash
  
  const allSame = resultsHandles.value.yesVotes === resultsHandles.value.noVotes && 
                  resultsHandles.value.noVotes === resultsHandles.value.totalVotes
  
  return !allZero && !allSame
}

// Decryption requests for signature-based decryption
const requests = computed(() => {
  if (!votingConfig.address || !resultsHandles.value.yesVotes || !resultsHandles.value.noVotes || !resultsHandles.value.totalVotes) return undefined
  
  const requests = []
  if (resultsHandles.value.yesVotes && resultsHandles.value.yesVotes !== ethers.ZeroHash) {
    requests.push({ handle: resultsHandles.value.yesVotes.toString(), contractAddress: votingConfig.address as `0x${string}` })
  }
  if (resultsHandles.value.noVotes && resultsHandles.value.noVotes !== ethers.ZeroHash) {
    requests.push({ handle: resultsHandles.value.noVotes.toString(), contractAddress: votingConfig.address as `0x${string}` })
  }
  if (resultsHandles.value.totalVotes && resultsHandles.value.totalVotes !== ethers.ZeroHash) {
    requests.push({ handle: resultsHandles.value.totalVotes.toString(), contractAddress: votingConfig.address as `0x${string}` })
  }
  
  return requests.length > 0 ? requests as any : undefined
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

// Extract decrypted results from results
const decryptedResults = computed(() => {
  console.log("🔍 Voting decryptedResults computed - checking...")
  console.log("🔍 Voting resultsHandles.value:", resultsHandles.value)
  console.log("🔍 Voting results.value:", results.value)
  
  if (!resultsHandles.value.yesVotes || !resultsHandles.value.noVotes || !resultsHandles.value.totalVotes) {
    console.log("🔍 Voting No results handles, returning null")
    return null
  }
  
  const yesVotesKey = resultsHandles.value.yesVotes.toString()
  const noVotesKey = resultsHandles.value.noVotes.toString()
  const totalVotesKey = resultsHandles.value.totalVotes.toString()
  
  console.log("🔍 Voting Handle keys:", { yesVotesKey, noVotesKey, totalVotesKey })
  
  const yesVotes = results.value?.[yesVotesKey]
  const noVotes = results.value?.[noVotesKey]
  const totalVotes = results.value?.[totalVotesKey]
  
  console.log("🔍 Voting Clear values from results:", { yesVotes, noVotes, totalVotes })
  
  if (typeof yesVotes === "undefined" || typeof noVotes === "undefined" || typeof totalVotes === "undefined") {
    console.log("🔍 Voting Some results are undefined, returning null")
    return null
  }
  
  const yesVotesNum = Number(yesVotes)
  const noVotesNum = Number(noVotes)
  const totalVotesNum = Number(totalVotes)
  
  console.log("🔍 Voting Converted to numbers:", { yesVotesNum, noVotesNum, totalVotesNum })
  
  return {
    yesVotes: yesVotesNum,
    noVotes: noVotesNum,
    totalVotes: totalVotesNum
  }
})

const isDecrypted = computed(() => {
  return Boolean(resultsHandles.value.yesVotes && decryptedResults.value !== null)
})

// Handlers
const handleCreateSession = async () => {
  if (!isConnected.value || !votingConfig.address) return
  
  isProcessing.value = true
  message.value = "📝 Creating voting session..."
  
  try {
    if (!sessionTitle.value.trim() || !sessionDescription.value.trim()) {
      message.value = "Please enter title and description"
      return
    }

    const duration = parseInt(sessionDuration.value)
    if (isNaN(duration) || duration <= 0) {
      message.value = "Please enter a valid duration"
      return
    }

    // Reset any previous write state
    resetWrite()
    
    // Call the contract with proper parameters
    const txResult = await writeVoting({
      address: votingConfig.address as `0x${string}`,
      abi: votingConfig.abi as any,
      functionName: 'createVotingSession',
      args: [sessionTitle.value, sessionDescription.value, BigInt(duration)],
      gas: 3000000n, // Increased gas limit for FHE operations
      gasPrice: 30000000000n, // 30 gwei for Sepolia (increased)
    })
    
    message.value = "⏳ Waiting for transaction confirmation..."
    
    // Wait for transaction to be confirmed
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.value = `✅ Voting session created: "${sessionTitle.value}"`
    console.log("🔍 Voting Session creation result:", txResult)
    
    // Refresh session info
    await refetchSessionInfo()
    
  } catch (error) {
    message.value = `❌ Session creation failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Voting Session creation error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleCastVote = async () => {
  if (!isConnected.value || !votingConfig.address) return
  
  isProcessing.value = true
  message.value = "🗳️ Casting vote..."
  
  try {
    const sessionIdNum = parseInt(sessionId.value)
    if (isNaN(sessionIdNum) || sessionIdNum < 0) {
      message.value = "Please enter a valid session ID"
      return
    }

    // 1. Ensure FHEVM instance is ready
    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    // 2. Create proper externalEuint32 with proof for FHEVoting.sol using correct FHEVM pattern
    message.value = "🔐 Creating encrypted vote..."
    
    let externalEuint32: string
    let inputProof: string
    
    try {
      // Use the correct FHEVM pattern - create encrypted input for boolean
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(votingConfig.address, userAddress)
      
      // Encrypt boolean value (true for yes, false for no)
      const voteValue = voteChoice.value === "yes"
      console.log("🔍 Voting Encrypting boolean value:", voteValue)
      
      // Use integer encryption like Bank/Counter examples (convert boolean to int)
      const voteAsInt = voteValue ? 1 : 0
      input.add32(voteAsInt)
      console.log("🔍 Voting Using add32() method (like Bank/Counter)")
      console.log("🔍 Voting Vote value being encrypted:", voteValue, "as int:", voteAsInt)
      
      const encryptedResult = await input.encrypt()
      
      console.log("🔍 Voting Encryption result:", encryptedResult)
      console.log("🔍 Voting Handles:", encryptedResult.handles)
      console.log("🔍 Voting InputProof:", encryptedResult.inputProof)
      console.log("🔍 Voting Vote value:", voteValue)
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned")
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned")
      }
      
      // Validate handle length - should be 32 bytes for bytes32
      const handle = encryptedResult.handles[0]
      console.log("🔍 Voting Handle details:")
      console.log("  - Type:", typeof handle)
      console.log("  - Length:", handle.length)
      console.log("  - Is Uint8Array:", handle instanceof Uint8Array)
      console.log("  - First 10 bytes:", Array.from(handle.slice(0, 10)))
      console.log("  - Last 10 bytes:", Array.from(handle.slice(-10)))
      console.log("  - Full handle as string:", handle.toString())
      
      if (handle.length !== 32) {
        console.error(`❌ Voting Handle length is ${handle.length}, expected 32 bytes`)
        console.error("❌ This will cause contract call to fail")
        throw new Error(`Invalid handle length: ${handle.length} bytes, expected 32 bytes for bytes32`)
      }
      
      // 3. Convert FHEVM objects to proper format
      message.value = `🔐 Encrypted vote: ${handle.toString().slice(0, 20)}...`
      
      // Convert Uint8Array to hex string for bytes32 and bytes
      const toHex = (data: Uint8Array) => {
        if (!data || !Array.isArray(Array.from(data))) {
          throw new Error("Invalid data for hex conversion")
        }
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      
      externalEuint32 = toHex(handle)
      inputProof = toHex(encryptedResult.inputProof)
      
      console.log("🔍 Voting ExternalEuint32 (length:", externalEuint32.length, "):", externalEuint32)
      console.log("🔍 Voting InputProof (length:", inputProof.length, "):", inputProof)
      
    } catch (encryptError) {
      console.error("❌ Voting Encryption error:", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    // 4. Call contract with proper hex format
    message.value = "📝 Signing transaction..."
    
    // Reset any previous write state
    resetWrite()
    
    try {
      // Check contract state before making the call
      console.log("🔍 Voting Checking contract state before call...")
      console.log("🔍 Voting Contract address:", votingConfig.address)
      console.log("🔍 Voting Contract ABI length:", votingConfig.abi?.length)
      
      // Check if session exists and is active
      console.log("🔍 Voting About to check session info...")
      const sessionInfo = await refetchSessionInfo()
      console.log("🔍 Voting Session info:", sessionInfo.data)
      console.log("🔍 Voting Session info error:", sessionInfo.error)
      
      if (!sessionInfo.data) {
        throw new Error("Session does not exist")
      }
      
      const sessionData = sessionInfo.data as any
      console.log("🔍 Voting Session data breakdown:")
      console.log("  - Title:", sessionData[0])
      console.log("  - Description:", sessionData[1])
      console.log("  - Is Active:", sessionData[2])
      console.log("  - End Time:", sessionData[3])
      console.log("  - Current Time:", Math.floor(Date.now() / 1000))
      console.log("  - Time Remaining:", Number(sessionData[3]) - Math.floor(Date.now() / 1000))
      
      if (!sessionData[2]) { // isActive
        throw new Error("Session is not active")
      }
      
      if (Date.now() / 1000 > Number(sessionData[3])) { // endTime
        throw new Error("Session has expired")
      }
      
      // Check if user has already voted
      const hasVotedResult = await refetchHasVoted()
      console.log("🔍 Voting Has voted:", hasVotedResult.data)
      
      if (hasVotedResult.data) {
        throw new Error("User has already voted in this session")
      }
      
      // Check current block timestamp
      console.log("🔍 Voting Current timestamp:", Math.floor(Date.now() / 1000))
      console.log("🔍 Voting Session end time:", Number(sessionData[3]))
      console.log("🔍 Voting Time remaining:", Number(sessionData[3]) - Math.floor(Date.now() / 1000), "seconds")
      
      // Validate parameters before contract call
      console.log("🔍 Voting Contract call parameters:")
      console.log("  - sessionId:", sessionIdNum, "(BigInt:", BigInt(sessionIdNum), ")")
      console.log("  - externalEuint32:", externalEuint32, "(length:", externalEuint32.length, ")")
      console.log("  - inputProof:", inputProof, "(length:", inputProof.length, ")")
      
      // Ensure externalEuint32 is exactly 66 characters (0x + 64 hex chars = 32 bytes)
      if (externalEuint32.length !== 66) {
        throw new Error(`Invalid externalEuint32 length: ${externalEuint32.length}, expected 66 (0x + 64 hex chars)`)
      }
      
      // Write to contract with proper hex strings
      console.log("🔍 Voting Calling contract with args:", [BigInt(sessionIdNum), externalEuint32, inputProof])
      console.log("🔍 Voting Contract address:", votingConfig.address)
      console.log("🔍 Voting Expected contract address: 0x64D0aF592CeA8DE7c67379353a0C4818dfc4e002")
      console.log("🔍 Voting Address matches:", votingConfig.address === '0x64D0aF592CeA8DE7c67379353a0C4818dfc4e002')
      console.log("🔍 Voting ABI for castVote:", votingConfig.abi?.find((item: any) => item.name === 'castVote'))
      console.log("🔍 Voting Full ABI length:", votingConfig.abi?.length)
      console.log("🔍 Voting ABI source check - looking for externalEuint32:", votingConfig.abi?.find((item: any) => item.name === 'castVote')?.inputs?.find((input: any) => input.internalType === 'externalEuint32'))
      
      // Additional debugging for transaction data
      console.log("🔍 Voting Transaction data details:")
      console.log("  - sessionId (BigInt):", BigInt(sessionIdNum))
      console.log("  - externalEuint32 (hex):", externalEuint32)
      console.log("  - externalEuint32 length:", externalEuint32.length)
      console.log("  - inputProof (hex):", inputProof)
      console.log("  - inputProof length:", inputProof.length)
      console.log("  - gas limit:", 5000000n)
      console.log("  - gas price:", 50000000000n)
      
      try {
        console.log("🔍 Voting About to call writeVoting...")
        const txResult = await writeVoting({
          address: votingConfig.address as `0x${string}`,
          abi: votingConfig.abi as any,
          functionName: 'castVote',
        args: [BigInt(sessionIdNum), externalEuint32, inputProof], // uint256 sessionId, externalEuint32 vote, bytes calldata inputProof
        gas: 5000000n, // Further increased gas limit for FHE operations
        gasPrice: 50000000000n, // 50 gwei for Sepolia (further increased)
        })
        
        console.log("🔍 Voting Transaction submitted successfully:", txResult)
        console.log("🔍 Voting Transaction result type:", typeof txResult)
        console.log("🔍 Voting Transaction result value:", txResult)
        
        console.log("✅ Voting Transaction submitted - check pending state for confirmation")
        console.log("✅ Voting Transaction should be visible on Sepolia explorer once confirmed")
      } catch (txError) {
        console.error("❌ Voting Transaction error:", txError)
        console.error("❌ Voting Error details:", {
          message: txError instanceof Error ? txError.message : String(txError),
          stack: txError instanceof Error ? txError.stack : undefined,
          name: txError instanceof Error ? txError.name : undefined
        })
        throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
      }
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      // Wait for transaction to be confirmed
      console.log("🔍 Voting Waiting for transaction confirmation...")
      await new Promise(resolve => setTimeout(resolve, 5000)) // Increased wait time
      
      // Check transaction status
      console.log("🔍 Voting Checking transaction status...")
      console.log("🔍 Voting isWritePending:", isWritePending.value)
      console.log("🔍 Voting isWriteSuccess:", isWriteSuccess.value)
      console.log("🔍 Voting writeError:", writeError.value)
      
      // Additional status checks
      console.log("🔍 Voting Additional status info:")
      console.log("  - Pending state:", isWritePending.value)
      console.log("  - Success state:", isWriteSuccess.value)
      console.log("  - Error state:", writeError.value)
      
      // Check if the transaction actually succeeded by checking the voting status
      console.log("🔍 Voting Checking if vote was recorded...")
      await refetchHasVoted()
      console.log("🔍 Voting Has voted after transaction:", hasVoted.value)
      
      // Check if transaction is still pending
      if (isWritePending.value) {
        console.log("🔍 Voting Transaction is still pending - waiting longer...")
        message.value = "⏳ Transaction still pending, waiting longer..."
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait another 10 seconds
        await refetchHasVoted()
        console.log("🔍 Voting Has voted after extended wait:", hasVoted.value)
      }
      
      if (hasVoted.value) {
        message.value = `✅ Voted ${voteChoice.value}! Vote recorded successfully.`
        console.log("🔍 Voting Transaction completed successfully - vote was recorded")
      } else {
        console.log("🔍 Voting Final status check:")
        console.log("  - isWritePending:", isWritePending.value)
        console.log("  - isWriteSuccess:", isWriteSuccess.value)
        console.log("  - writeError:", writeError.value)
        console.log("  - hasVoted:", hasVoted.value)
        message.value = `⚠️ Transaction submitted but vote not recorded. This suggests a contract execution issue.`
        console.log("🔍 Voting Transaction may have failed silently - vote not recorded")
      }
      
      // Refresh voting status
    await refetchHasVoted()
      
    } catch (txError) {
      console.error("Voting Transaction error:", txError)
      console.error("Voting Transaction error details:", {
        message: txError instanceof Error ? txError.message : String(txError),
        stack: txError instanceof Error ? txError.stack : undefined
      })
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Vote casting failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Voting Vote casting error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleEndSession = async () => {
  if (!isConnected.value || !votingConfig.address) return
  
  isProcessing.value = true
  message.value = "🔚 Ending voting session..."
  
  try {
    const sessionIdNum = parseInt(sessionId.value)
    if (isNaN(sessionIdNum) || sessionIdNum < 0) {
      message.value = "Please enter a valid session ID"
      return
    }

    // Reset any previous write state
    resetWrite()
    
    // Call the contract with proper parameters
    const txResult = await writeVoting({
      address: votingConfig.address as `0x${string}`,
      abi: votingConfig.abi as any,
      functionName: 'endVotingSession',
      args: [BigInt(sessionIdNum)],
      gas: 3000000n, // Increased gas limit for FHE operations
      gasPrice: 30000000000n, // 30 gwei for Sepolia (increased)
    })
    
    message.value = "⏳ Waiting for transaction confirmation..."
    
    // Wait for transaction to be confirmed
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.value = `✅ Voting session ${sessionIdNum} ended`
    console.log("🔍 Voting Session end result:", txResult)
    
    // Refresh session info
    await refetchSessionInfo()
    
  } catch (error) {
    message.value = `❌ Session ending failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Voting Session ending error:", error)
  } finally {
    isProcessing.value = false
  }
}

const handleDecryptResults = async () => {
  if (!isConnected.value || !votingConfig.address) return
  
  isProcessing.value = true
  message.value = "📊 Decrypting voting results..."
  
  try {
    // Check if we have results handles
    if (!resultsHandles.value.yesVotes || !resultsHandles.value.noVotes || !resultsHandles.value.totalVotes) {
      message.value = "⚠️ No results handles available. Please fetch results first."
      return
    }

    // Now decrypt the results using signature-based decryption
    message.value = "🔓 Decrypting results..."
    
    if (!canDecrypt.value) {
      message.value = "⚠️ Cannot decrypt - missing dependencies (signer, instance, or requests)"
      return
    }

    console.log("🔍 Voting Starting signature-based decryption...")
    console.log("🔍 Voting Results handles:", resultsHandles.value)
    console.log("🔍 Voting About to call performDecrypt()...")
    
    // Use the signature-based decryption
    await performDecrypt()
    console.log("🔍 Voting performDecrypt() completed!")
    
    // Wait a moment for results to be processed
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log("🔍 Voting Results after decryption:", results.value)
    console.log("🔍 Voting Decrypted results computed:", decryptedResults.value)
    
    // Check if we got valid results
    if (decryptedResults.value === null) {
      console.warn("⚠️ Voting Decryption returned null - checking results object...")
      console.log("🔍 Voting Full results object:", JSON.stringify(results.value, null, 2))
    }
    
    // The decrypted results will be available in decryptedResults and automatically displayed
    message.value = `✅ Voting results decrypted! Yes: ${decryptedResults.value?.yesVotes || 0}, No: ${decryptedResults.value?.noVotes || 0}, Total: ${decryptedResults.value?.totalVotes || 0}`
    
  } catch (error) {
    message.value = `❌ Results decryption failed: ${error instanceof Error ? error.message : String(error)}`
    console.error("Voting Results decryption error:", error)
  } finally {
    isProcessing.value = false
  }
}

// Manual function to fetch the results handles - ONLY after session has ended
const fetchResultsHandles = async () => {
  console.log("🔍 Voting fetchResultsHandles called")
  console.log("🔍 Voting votingConfig.address:", votingConfig.address)
  console.log("🔍 Voting isFHEVMConnected.value:", isFHEVMConnected.value)
  console.log("🔍 Voting sessionId.value:", sessionId.value)
  console.log("🔍 Voting Current user address:", address.value)
  
  if (!votingConfig.address || !isFHEVMConnected.value) {
    console.log("🔍 Voting Missing requirements for fetchResultsHandles")
    message.value = "⚠️ Missing requirements for fetching results"
    return
  }
  
  const sessionIdNum = parseInt(sessionId.value)
  if (isNaN(sessionIdNum) || sessionIdNum < 0) {
    message.value = "⚠️ Please enter a valid session ID"
    return
  }
  
  try {
    console.log("🔍 Voting Calling refetchEncryptedResults directly...")
    console.log("🔍 Voting Current session ID for fetch:", sessionId.value)
    console.log("🔍 Voting Session ID type:", typeof sessionId.value)
    console.log("🔍 Voting Session ID as BigInt:", BigInt(sessionId.value))
    
    // Check if session has ended first
    const sessionInfo = await refetchSessionInfo()
    console.log("🔍 Voting Session info before fetching results:", sessionInfo.data)
    
    if (sessionInfo.data && (sessionInfo.data as any)[2] === true) { // isActive is true
      message.value = "⚠️ Session is still active - results only available after session ends"
      console.log("🔍 Voting Session is still active, cannot get results yet")
      return
    }
    
    console.log("🔍 Voting Session has ended, proceeding to fetch results")
    
    // Call getEncryptedResults as a read function since it's now view
    console.log("🔍 Voting Calling refetchEncryptedResults...")
    const result = await refetchEncryptedResults()
    console.log("🔍 Voting refetchEncryptedResults result:", result)
    console.log("🔍 Voting Result data:", result.data)
    console.log("🔍 Voting Result data type:", typeof result.data)
    console.log("🔍 Voting Result error:", result.error)
    console.log("🔍 Voting Result data keys:", result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'no data or not object')
    
    if (result.error) {
      throw new Error(`Contract call failed: ${result.error.message || result.error}`)
    }
    
    if (!result.data) {
      throw new Error("Failed to fetch encrypted results - session may not exist or may not have ended")
    }
    
    // Debug the data structure
    console.log("🔍 Voting Raw result.data:", JSON.stringify(result.data, null, 2))
    
    // getEncryptedResults returns a tuple with named fields: {yesVotes, noVotes, totalVotes}
    let yesVotesHandle: string, noVotesHandle: string, totalVotesHandle: string
    
    // Try different data structures
    if (result.data && typeof result.data === 'object') {
      // Check if it's an array (tuple)
      if (Array.isArray(result.data) && result.data.length === 3) {
        [yesVotesHandle, noVotesHandle, totalVotesHandle] = result.data
        console.log("🔍 Voting Data is array, extracted:", { yesVotesHandle, noVotesHandle, totalVotesHandle })
      }
      // Check if it's an object with named fields
      else if ((result.data as any).yesVotes !== undefined) {
        ({ yesVotes: yesVotesHandle, noVotes: noVotesHandle, totalVotes: totalVotesHandle } = result.data as { yesVotes: string, noVotes: string, totalVotes: string })
        console.log("🔍 Voting Data is object with named fields, extracted:", { yesVotesHandle, noVotesHandle, totalVotesHandle })
      }
      // Check if it's an object with indexed fields
      else if ((result.data as any)[0] !== undefined) {
        yesVotesHandle = (result.data as any)[0]
        noVotesHandle = (result.data as any)[1] 
        totalVotesHandle = (result.data as any)[2]
        console.log("🔍 Voting Data is object with indexed fields, extracted:", { yesVotesHandle, noVotesHandle, totalVotesHandle })
      }
      else {
        throw new Error("Unknown data structure returned from getEncryptedResults")
      }
    } else {
      throw new Error("Invalid data returned from getEncryptedResults")
    }
    
    console.log("🔍 Voting Raw handles from contract for session", sessionId.value, ":", {
      yesVotesHandle,
      noVotesHandle, 
      totalVotesHandle
    })
    
    // Check if handles are valid (not zero hash or undefined)
    if (!yesVotesHandle || !noVotesHandle || !totalVotesHandle || 
        yesVotesHandle === ethers.ZeroHash || noVotesHandle === ethers.ZeroHash || totalVotesHandle === ethers.ZeroHash) {
      message.value = "⚠️ No votes recorded for this session yet or session has no results"
      console.log("🔍 Voting Invalid handles detected:", {
        yesVotesHandle,
        noVotesHandle,
        totalVotesHandle,
        yesVotesIsZero: yesVotesHandle === ethers.ZeroHash,
        noVotesIsZero: noVotesHandle === ethers.ZeroHash,
        totalVotesIsZero: totalVotesHandle === ethers.ZeroHash
      })
      return
    }
    
    // Store the handles for decryption
    resultsHandles.value = {
      yesVotes: yesVotesHandle as string,
      noVotes: noVotesHandle as string,
      totalVotes: totalVotesHandle as string
    }
    
    console.log("🔍 Voting Results handles stored for session", sessionId.value, ":", resultsHandles.value)
    console.log("🔍 Voting Handles belong to current user:", address.value)
    
    // Check if handles are actually different
    const allHandlesSame = yesVotesHandle === noVotesHandle && noVotesHandle === totalVotesHandle
    const allHandlesZero = yesVotesHandle === ethers.ZeroHash && noVotesHandle === ethers.ZeroHash && totalVotesHandle === ethers.ZeroHash
    
    if (allHandlesZero) {
      console.log("🔍 Voting All handles are zero hash - session has no votes yet")
      message.value = `ℹ️ Session ${sessionId.value} has no votes yet. Cast some votes first!`
    } else if (allHandlesSame) {
      console.warn("⚠️ Voting All handles are the same - this may indicate a problem with the contract call")
      message.value = `⚠️ Warning: All handles are identical for session ${sessionId.value}. This may indicate the session has no votes or the contract call failed.`
    } else {
      console.log("🔍 Voting Handles are different - session has votes")
      message.value = `✅ Results handles fetched successfully for session ${sessionId.value}!`
    }
    
  } catch (error) {
    console.error("Failed to fetch results handles:", error)
    message.value = `❌ Failed to fetch results: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Get the latest session ID
const getLatestSessionId = async () => {
  try {
    await refetchSessionCounter()
    if (sessionCounter.value !== undefined) {
      const latestId = Number(sessionCounter.value) - 1 // sessionCounter is the next ID, so latest is counter - 1
      sessionId.value = latestId.toString()
      message.value = `📊 Latest session ID: ${latestId}`
      console.log("🔍 Voting Latest session ID:", latestId)
      
      // Auto-refresh session info for the new session
      await refreshSessionInfo()
    }
  } catch (error) {
    console.error("Failed to get latest session ID:", error)
    message.value = "❌ Failed to get latest session ID"
  }
}

// Watch for session ID changes and auto-refresh session info
watch(sessionId, async (newSessionId, oldSessionId) => {
  if (newSessionId !== oldSessionId && newSessionId && newSessionId !== "0") {
    console.log("🔍 Voting Session ID changed from", oldSessionId, "to", newSessionId)
    await refreshSessionInfo()
  }
}, { immediate: false })

// Refresh session information
const refreshSessionInfo = async () => {
  try {
    console.log("🔍 Voting Refreshing session info for session:", sessionId.value)
    await refetchSessionInfo()
    await refetchHasVoted()
    console.log("🔍 Voting Session info refreshed")
  } catch (error) {
    console.error("Failed to refresh session info:", error)
    message.value = "❌ Failed to refresh session info"
  }
}

// Reset session functionality
const resetSession = () => {
  sessionId.value = "0"
  sessionTitle.value = ""
  sessionDescription.value = ""
  sessionDuration.value = "3600"
  resultsHandles.value = {
    yesVotes: null,
    noVotes: null,
    totalVotes: null
  }
  message.value = "🔄 Session reset"
  console.log("🔍 Voting Session reset - all handles cleared")
}

// Auto-initialize on mount
onMounted(() => {
  // FHEVM will auto-initialize through the composable
})
</script>
