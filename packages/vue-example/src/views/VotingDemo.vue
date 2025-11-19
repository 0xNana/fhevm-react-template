<template>
  <div class="max-w-6xl mx-auto space-y-8">
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

    <div v-else class="space-y-6">
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div v-if="message" class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">💬 Messages</h3>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-gray-800">{{ message }}</p>
        </div>
      </div>

      <div v-if="isWritePending" class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 class="font-bold text-blue-800 text-lg mb-2">⏳ Transaction Pending</h3>
        <p class="text-blue-700">Your transaction is being processed. Please wait...</p>
      </div>

      <div v-if="isWriteSuccess" class="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 class="font-bold text-green-800 text-lg mb-2">✅ Transaction Successful</h3>
        <p class="text-green-700">Your transaction has been confirmed on the blockchain!</p>
      </div>

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

const { isConnected, address, chainId, connect, connectors } = useWallet()

const ethersSigner = computed(() => {
  if (!isConnected.value || !address.value) return undefined
  
  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = new ethers.JsonRpcSigner(provider, address.value)
    
    return signer
  } catch (error) {
    logger.error('Failed to create ethers signer', error)
    return undefined
  }
})

const votingConfig = getContractConfig('FHEVoting')

const fhevmConfig = {
  rpcUrl: import.meta.env.VITE_RPC_URL || `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 11155111,
  mockChains: {
    31337: "http://localhost:8545"
  }
}

const { 
  state, 
  isReady: isFHEVMConnected, 
  hasError, 
  isInitializing: isLoading
} = useFHEVM(fhevmConfig)

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

const isEncrypting = ref(false)
const encryptError = ref<Error | null>(null)

const message = ref<string>("")
const isProcessing = ref(false)
const voteChoice = ref<"yes" | "no">("yes")
const sessionTitle = ref<string>("")
const sessionDescription = ref<string>("")
const sessionDuration = ref<string>("3600") // 1 hour in seconds
const sessionId = ref<string>("0")

const { data: sessionInfo, refetch: refetchSessionInfo } = useReadContract({
  address: computed(() => votingConfig.address as `0x${string}` | undefined),
  abi: votingConfig.abi as any,
  functionName: 'getVotingSessionInfo',
  args: computed(() => [BigInt(sessionId.value)]),
  query: {
    enabled: computed(() => Boolean(votingConfig.address && isFHEVMConnected.value && sessionId.value && sessionId.value !== "0")),
    refetchOnWindowFocus: false,
  },
})

const { data: hasVoted, refetch: refetchHasVoted } = useReadContract({
  address: computed(() => votingConfig.address as `0x${string}` | undefined),
  abi: votingConfig.abi as any,
  functionName: 'hasUserVoted',
  args: computed(() => [address.value!, BigInt(sessionId.value)]),
  query: {
    enabled: computed(() => Boolean(votingConfig.address && address.value && isFHEVMConnected.value && sessionId.value && sessionId.value !== "0")),
    refetchOnWindowFocus: false,
  },
})

const { data: encryptedResults, refetch: refetchEncryptedResults } = useReadContract({
  address: computed(() => votingConfig.address as `0x${string}` | undefined),
  abi: votingConfig.abi as any,
  functionName: 'getEncryptedResults',
  args: computed(() => [BigInt(sessionId.value)]),
  query: {
    enabled: false, 
    refetchOnWindowFocus: false,
  },
})

watch(() => [BigInt(sessionId.value)], () => {
}, { immediate: true })

const { data: sessionCounter, refetch: refetchSessionCounter } = useReadContract({
  address: computed(() => votingConfig.address as `0x${string}` | undefined),
  abi: votingConfig.abi as any,
  functionName: 'sessionCounter',
  query: {
    enabled: Boolean(votingConfig.address && isFHEVMConnected.value),
    refetchOnWindowFocus: false,
  },
})


const { writeContract: writeVoting, isPending: isWritePending, error: writeError, isSuccess: isWriteSuccess, reset: resetWrite } = useWriteContract()

const { 
  generateSignature, 
  signature, 
  isSigning, 
  error: signatureError 
} = useFHEVMSignature(computed(() => state.value.instance), address)

const fhevmDecryptionSignatureStorage = useInMemoryStorage()

const resultsHandles = ref<{yesVotes: string | null, noVotes: string | null, totalVotes: string | null}>({
  yesVotes: null,
  noVotes: null,
  totalVotes: null
})

watch(sessionId, async (newSessionId, oldSessionId) => {
  if (newSessionId !== oldSessionId) {
    resultsHandles.value = {
      yesVotes: null,
      noVotes: null,
      totalVotes: null
    }
    
    if (newSessionId && newSessionId !== "0") {
      try {
        await fetchResultsHandles()
      } catch (error) {
        logger.debug("Auto-fetch failed (session may not be ended yet)", error)
      }
    }
  }
}, { immediate: false })

const getLatestResultsHandles = async () => {
  try {
    if (!sessionId.value || sessionId.value === "0") {
      message.value = "⚠️ Please select a session first"
      return
    }
    
    resultsHandles.value = {
      yesVotes: null,
      noVotes: null,
      totalVotes: null
    }
    
    await fetchResultsHandles()
    message.value = `✅ Latest results handles fetched for session ${sessionId.value}!`
    
  } catch (error) {
    logger.error("Failed to get latest results handles", error)
    message.value = `❌ Failed to get latest results: ${error instanceof Error ? error.message : String(error)}`
  }
}

const forceRefreshResultsHandles = async () => {
  try {
    if (!sessionId.value || sessionId.value === "0") {
      message.value = "⚠️ Please select a session first"
      return
    }
    
    resultsHandles.value = {
      yesVotes: null,
      noVotes: null,
      totalVotes: null
    }
    
    await fetchResultsHandles()
    
    message.value = `✅ Results handles refreshed for session ${sessionId.value}!`
    
  } catch (error) {
    logger.error("Failed to force refresh results handles", error)
    message.value = `❌ Failed to refresh results: ${error instanceof Error ? error.message : String(error)}`
  }
}

const forceClearAllHandles = () => {
  resultsHandles.value = {
    yesVotes: null,
    noVotes: null,
    totalVotes: null
  }
  
  sessionId.value = "0"
  message.value = "🔄 All handles cleared - select a new session"
}

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

const decryptedResults = computed(() => {
  if (!resultsHandles.value.yesVotes || !resultsHandles.value.noVotes || !resultsHandles.value.totalVotes) {
    return null
  }
  
  const yesVotesKey = resultsHandles.value.yesVotes.toString()
  const noVotesKey = resultsHandles.value.noVotes.toString()
  const totalVotesKey = resultsHandles.value.totalVotes.toString()
  
  const yesVotes = results.value?.[yesVotesKey]
  const noVotes = results.value?.[noVotesKey]
  const totalVotes = results.value?.[totalVotesKey]
  
  if (typeof yesVotes === "undefined" || typeof noVotes === "undefined" || typeof totalVotes === "undefined") {
    return null
  }
  
  const yesVotesNum = Number(yesVotes)
  const noVotesNum = Number(noVotes)
  const totalVotesNum = Number(totalVotes)
  
  return {
    yesVotes: yesVotesNum,
    noVotes: noVotesNum,
    totalVotes: totalVotesNum
  }
})

const isDecrypted = computed(() => {
  return Boolean(resultsHandles.value.yesVotes && decryptedResults.value !== null)
})

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

    resetWrite()
    
    const txResult = await writeVoting({
      address: votingConfig.address as `0x${string}`,
      abi: votingConfig.abi as any,
      functionName: 'createVotingSession',
      args: [sessionTitle.value, sessionDescription.value, BigInt(duration)],
      gas: 3000000n, 
      gasPrice: 30000000000n, 
    })
    
    message.value = "⏳ Waiting for transaction confirmation..."
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.value = `✅ Voting session created: "${sessionTitle.value}"`
    
    await refetchSessionInfo()
    
  } catch (error) {
    message.value = `❌ Session creation failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error("Voting Session creation error", error)
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

    if (!state.value.instance) {
      throw new Error("FHEVM instance not ready")
    }
    
    message.value = "🔐 Creating encrypted vote..."
    
    let externalEuint32: string
    let inputProof: string
    
    try {
      const userAddress = address.value!
      const input = state.value.instance.createEncryptedInput(votingConfig.address, userAddress)
      
      const voteValue = voteChoice.value === "yes"
      
      const voteAsInt = voteValue ? 1 : 0
      input.add32(voteAsInt)
      
      const encryptedResult = await input.encrypt()
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned")
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned")
      }
      
      const handle = encryptedResult.handles[0]
      
      if (handle.length !== 32) {
        logger.error(`Handle length is ${handle.length}, expected 32 bytes`)
        throw new Error(`Invalid handle length: ${handle.length} bytes, expected 32 bytes for bytes32`)
      }
      
      message.value = `🔐 Encrypted vote: ${handle.toString().slice(0, 20)}...`
      
      const toHex = (data: Uint8Array) => {
        if (!data || !Array.isArray(Array.from(data))) {
          throw new Error("Invalid data for hex conversion")
        }
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      
      externalEuint32 = toHex(handle)
      inputProof = toHex(encryptedResult.inputProof)
      
    } catch (encryptError) {
      logger.error("Voting Encryption error", encryptError)
      throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`)
    }
    
    message.value = "📝 Signing transaction..."
    
    resetWrite()
    
    try {
      const sessionInfo = await refetchSessionInfo()
      
      if (!sessionInfo.data) {
        throw new Error("Session does not exist")
      }
      
      const sessionData = sessionInfo.data as any
      
      if (!sessionData[2]) { 
        throw new Error("Session is not active")
      }
      
      if (Date.now() / 1000 > Number(sessionData[3])) { 
        throw new Error("Session has expired")
      }
      
      const hasVotedResult = await refetchHasVoted()
      
      if (hasVotedResult.data) {
        throw new Error("User has already voted in this session")
      }
      
      if (externalEuint32.length !== 66) {
        throw new Error(`Invalid externalEuint32 length: ${externalEuint32.length}, expected 66 (0x + 64 hex chars)`)
      }
      
      try {
        await writeVoting({
          address: votingConfig.address as `0x${string}`,
          abi: votingConfig.abi as any,
          functionName: 'castVote',
        args: [BigInt(sessionIdNum), externalEuint32, inputProof], 
        gas: 5000000n, 
        gasPrice: 50000000000n, 
        })
      } catch (txError) {
        logger.error("Voting Transaction error", txError)
        throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
      }
      
      message.value = "⏳ Waiting for transaction confirmation..."
      
      await new Promise(resolve => setTimeout(resolve, 5000)) 
      
      await refetchHasVoted()
      
      if (isWritePending.value) {
        message.value = "⏳ Transaction still pending, waiting longer..."
        await new Promise(resolve => setTimeout(resolve, 10000)) 
        await refetchHasVoted()
      }
      
      if (hasVoted.value) {
        message.value = `✅ Voted ${voteChoice.value}! Vote recorded successfully.`
      } else {
        message.value = `⚠️ Transaction submitted but vote not recorded. This suggests a contract execution issue.`
      }
      
    await refetchHasVoted()
      
    } catch (txError) {
      logger.error("Voting Transaction error", txError)
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`)
    }
  } catch (error) {
    message.value = `❌ Vote casting failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error("Voting Vote casting error", error)
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

    resetWrite()
    
    const txResult = await writeVoting({
      address: votingConfig.address as `0x${string}`,
      abi: votingConfig.abi as any,
      functionName: 'endVotingSession',
      args: [BigInt(sessionIdNum)],
      gas: 3000000n, 
      gasPrice: 30000000000n, 
    })
    
    message.value = "⏳ Waiting for transaction confirmation..."
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.value = `✅ Voting session ${sessionIdNum} ended`
    
    await refetchSessionInfo()
    
  } catch (error) {
    message.value = `❌ Session ending failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error("Voting Session ending error", error)
  } finally {
    isProcessing.value = false
  }
}

const handleDecryptResults = async () => {
  if (!isConnected.value || !votingConfig.address) return
  
  isProcessing.value = true
  message.value = "📊 Decrypting voting results..."
  
  try {
    if (!resultsHandles.value.yesVotes || !resultsHandles.value.noVotes || !resultsHandles.value.totalVotes) {
      message.value = "⚠️ No results handles available. Please fetch results first."
      return
    }

    message.value = "🔓 Decrypting results..."
    
    if (!canDecrypt.value) {
      message.value = "⚠️ Cannot decrypt - missing dependencies (signer, instance, or requests)"
      return
    }
    
    await performDecrypt()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (decryptedResults.value === null) {
      logger.warn("Voting Decryption returned null", { results: results.value })
    }
    
    message.value = `✅ Voting results decrypted! Yes: ${decryptedResults.value?.yesVotes || 0}, No: ${decryptedResults.value?.noVotes || 0}, Total: ${decryptedResults.value?.totalVotes || 0}`
    
  } catch (error) {
    message.value = `❌ Results decryption failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error("Voting Results decryption error", error)
  } finally {
    isProcessing.value = false
  }
}

const fetchResultsHandles = async () => {
  if (!votingConfig.address || !isFHEVMConnected.value) {
    message.value = "⚠️ Missing requirements for fetching results"
    return
  }
  
  const sessionIdNum = parseInt(sessionId.value)
  if (isNaN(sessionIdNum) || sessionIdNum < 0) {
    message.value = "⚠️ Please enter a valid session ID"
    return
  }
  
  try {
    const sessionInfo = await refetchSessionInfo()
    
    if (sessionInfo.data && (sessionInfo.data as any)[2] === true) { 
      message.value = "⚠️ Session is still active - results only available after session ends"
      return
    }
    
    const result = await refetchEncryptedResults()
    
    if (result.error) {
      throw new Error(`Contract call failed: ${result.error.message || result.error}`)
    }
    
    if (!result.data) {
      throw new Error("Failed to fetch encrypted results - session may not exist or may not have ended")
    }
    
    let yesVotesHandle: string, noVotesHandle: string, totalVotesHandle: string
    
    if (result.data && typeof result.data === 'object') {
      if (Array.isArray(result.data) && result.data.length === 3) {
        [yesVotesHandle, noVotesHandle, totalVotesHandle] = result.data
      }
      else if ((result.data as any).yesVotes !== undefined) {
        ({ yesVotes: yesVotesHandle, noVotes: noVotesHandle, totalVotes: totalVotesHandle } = result.data as { yesVotes: string, noVotes: string, totalVotes: string })
      }
      else if ((result.data as any)[0] !== undefined) {
        yesVotesHandle = (result.data as any)[0]
        noVotesHandle = (result.data as any)[1] 
        totalVotesHandle = (result.data as any)[2]
      }
      else {
        throw new Error("Unknown data structure returned from getEncryptedResults")
      }
    } else {
      throw new Error("Invalid data returned from getEncryptedResults")
    }
    
    if (!yesVotesHandle || !noVotesHandle || !totalVotesHandle || 
        yesVotesHandle === ethers.ZeroHash || noVotesHandle === ethers.ZeroHash || totalVotesHandle === ethers.ZeroHash) {
      message.value = "⚠️ No votes recorded for this session yet or session has no results"
      return
    }
    
    resultsHandles.value = {
      yesVotes: yesVotesHandle as string,
      noVotes: noVotesHandle as string,
      totalVotes: totalVotesHandle as string
    }
    
    const allHandlesSame = yesVotesHandle === noVotesHandle && noVotesHandle === totalVotesHandle
    const allHandlesZero = yesVotesHandle === ethers.ZeroHash && noVotesHandle === ethers.ZeroHash && totalVotesHandle === ethers.ZeroHash
    
    if (allHandlesZero) {
      message.value = `ℹ️ Session ${sessionId.value} has no votes yet. Cast some votes first!`
    } else if (allHandlesSame) {
      logger.warn("Voting All handles are the same - this may indicate a problem with the contract call")
      message.value = `⚠️ Warning: All handles are identical for session ${sessionId.value}. This may indicate the session has no votes or the contract call failed.`
    } else {
      message.value = `✅ Results handles fetched successfully for session ${sessionId.value}!`
    }
    
  } catch (error) {
    logger.error("Failed to fetch results handles", error)
    message.value = `❌ Failed to fetch results: ${error instanceof Error ? error.message : String(error)}`
  }
}

const getLatestSessionId = async () => {
  try {
    await refetchSessionCounter()
    if (sessionCounter.value !== undefined) {
      const latestId = Number(sessionCounter.value) - 1 
      sessionId.value = latestId.toString()
      message.value = `📊 Latest session ID: ${latestId}`
      
      await refreshSessionInfo()
    }
  } catch (error) {
    logger.error("Failed to get latest session ID", error)
    message.value = "❌ Failed to get latest session ID"
  }
}

watch(sessionId, async (newSessionId, oldSessionId) => {
  if (newSessionId !== oldSessionId && newSessionId && newSessionId !== "0") {
    await refreshSessionInfo()
  }
}, { immediate: false })

const refreshSessionInfo = async () => {
  try {
    await refetchSessionInfo()
    await refetchHasVoted()
  } catch (error) {
    logger.error("Failed to refresh session info", error)
    message.value = "❌ Failed to refresh session info"
  }
}

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
}

onMounted(() => {
})
</script>
