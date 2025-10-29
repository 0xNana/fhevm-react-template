import { useAccount, useConnect, useDisconnect, useChainId } from '@wagmi/vue'
import { computed } from 'vue'

/**
 * Vue composable for wallet functionality
 * 
 * Provides reactive wallet state and methods using Vue 3 Composition API.
 */
export function useWallet() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  // Computed properties
  const isConnecting = computed(() => isPending.value)
  const currentConnector = computed(() => connector.value)
  const currentChainId = computed(() => chainId.value)

  // Wallet actions - use wagmi connect (AppKit handles the UI via web component)
  const connectWallet = async (connectorId?: string) => {
    try {
      const targetConnector = connectorId 
        ? connectors.find((c: any) => c.id === connectorId)
        : connectors[0]
      
      if (targetConnector) {
        await connect({ connector: targetConnector })
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    }
  }

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const displayAddress = computed(() => 
    address.value ? formatAddress(address.value) : ''
  )

  return {
    // State
    address,
    isConnected,
    isConnecting,
    connector: currentConnector,
    chainId: currentChainId,
    displayAddress,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    
    // Utilities
    formatAddress,
    connectors: computed(() => connectors)
  }
}