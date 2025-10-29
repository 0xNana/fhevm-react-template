<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Universal FHEVM SDK
            </h1>
            <span class="text-sm text-gray-500">Vue 3 Example</span>
          </div>
          <div class="flex items-center space-x-4">
            <nav class="flex space-x-8">
              <router-link
                v-for="route in routes"
                :key="route.path"
                :to="route.path"
                class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="[
                  $route.path === route.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                ]"
              >
                <span class="text-lg">{{ route.icon }}</span>
                <span>{{ route.name }}</span>
              </router-link>
            </nav>
            <!-- Wallet Connection -->
            <div class="ml-4">
              <appkit-button />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-12">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <p class="text-gray-600 mb-2">
            Built for the Zama FHEVM Bounty Program - October 2025
          </p>
          <div class="flex justify-center space-x-6 text-sm text-gray-500">
            <span class="flex items-center space-x-1">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Vue 3 + Composition API</span>
            </span>
            <span class="flex items-center space-x-1">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Universal FHEVM SDK</span>
            </span>
            <span class="flex items-center space-x-1">
              <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>TypeScript First</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { createAppKit } from '@reown/appkit/vue'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia, arbitrum, mainnet, type AppKitNetwork } from '@reown/appkit/networks'

// AppKit Configuration
const projectId = import.meta.env.VITE_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64'

const metadata = {
  name: 'Universal FHEVM SDK',
  description: 'Vue 3 Example - Confidential dApps with FHEVM',
  url: 'https://zama.ai',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Set the networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia, arbitrum, mainnet]

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

// AppKit is automatically available once created

const routes = computed(() => [
  { path: '/counter', name: 'Counter', icon: '🔢' },
  { path: '/bank', name: 'Bank', icon: '🏦' },
  { path: '/voting', name: 'Voting', icon: '🗳️' }
])
</script>
