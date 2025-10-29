import { computed, ref, type Ref } from 'vue'

// Conditional ethers import
let ethers: any
try {
  ethers = require('ethers')
} catch (error) {
  console.warn('ethers not available, useEthersSigner will return undefined values')
  ethers = null
}

export interface UseEthersSignerOptions {
  address?: Ref<string | undefined>
  isConnected?: Ref<boolean>
  chainId?: Ref<number | undefined>
  walletClient?: Ref<any>
}

/**
 * Vue composable for getting ethers signer
 * Can work with or without @wagmi/vue
 */
export function useEthersSigner(options?: UseEthersSignerOptions) {
  // Check if ethers is available
  if (!ethers) {
    console.warn('ethers not available, useEthersSigner will return undefined values')
    return {
      ethersSigner: ref(undefined),
      ethersProvider: ref(undefined),
      chainId: ref(undefined),
      isConnected: ref(false),
      address: ref(undefined)
    }
  }

  // If no options provided, try to get wallet state from AppKit
  if (!options) {
    try {
      // AppKit provides wallet connection through window.ethereum
      // We need to get the connected account info
      const getWalletInfo = async () => {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
            const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
            return {
              address: accounts[0] || undefined,
              isConnected: accounts.length > 0,
              chainId: parseInt(chainId, 16)
            }
          } catch (error) {
            console.warn('Failed to get wallet info from AppKit:', error)
            return { address: undefined, isConnected: false, chainId: undefined }
          }
        }
        return { address: undefined, isConnected: false, chainId: undefined }
      }

      // Create reactive refs for wallet state
      const address = ref<string | undefined>(undefined)
      const isConnected = ref(false)
      const chainId = ref<number | undefined>(undefined)

      // Update wallet state with a small delay to avoid conflicts
      setTimeout(() => {
        getWalletInfo().then(info => {
          address.value = info.address
          isConnected.value = info.isConnected
          chainId.value = info.chainId
        })
      }, 100)

      // Listen for account changes (with error handling)
      try {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          (window as any).ethereum.on('accountsChanged', () => {
            getWalletInfo().then(info => {
              address.value = info.address
              isConnected.value = info.isConnected
            })
          })

          (window as any).ethereum.on('chainChanged', () => {
            getWalletInfo().then(info => {
              chainId.value = info.chainId
            })
          })
        }
      } catch (error) {
        console.warn('Could not set up ethereum event listeners:', error)
      }

      options = {
        address,
        isConnected,
        chainId
      }
      
      console.log('🔍 useEthersSigner: Using AppKit wallet connection', {
        hasEthereum: !!(typeof window !== 'undefined' && (window as any).ethereum),
        address: address.value,
        isConnected: isConnected.value,
        chainId: chainId.value
      })
    } catch (error) {
      console.warn('AppKit wallet not available, useEthersSigner requires manual options', error)
      return {
        ethersSigner: ref(undefined),
        ethersProvider: ref(undefined),
        chainId: ref(undefined),
        isConnected: ref(false),
        address: ref(undefined)
      }
    }
  }

  const { address = ref(undefined), isConnected = ref(false), chainId = ref(undefined), walletClient = ref(undefined) } = options
  
  console.log('🔍 useEthersSigner: Options received:', {
    address: address.value,
    isConnected: isConnected.value,
    chainId: chainId.value,
    walletClient: walletClient.value
  })

  const ethersProvider = computed(() => {
    // Try to get the ethereum provider safely
    let client: any = null
    
    try {
      if (typeof window !== 'undefined') {
        // Try multiple ways to get the ethereum provider
        client = (window as any).ethereum || 
                 (window as any).web3?.currentProvider ||
                 (window as any).Web3?.currentProvider
      }
    } catch (error) {
      console.warn('Error accessing window.ethereum:', error)
    }
    
    if (!client) {
      console.warn('No ethereum provider found')
      return undefined
    }

    try {
      const eip1193Provider = {
        request: async (args: any) => {
          return await client.request(args)
        },
        on: () => {
          console.log("Provider events not fully implemented")
        },
        removeListener: () => {
          console.log("Provider removeListener not fully implemented")
        },
      } as any

      return new ethers.BrowserProvider(eip1193Provider)
    } catch (error) {
      console.error('Failed to create ethers provider:', error)
      return undefined
    }
  })

  const ethersSigner = computed(() => {
    console.log('🔍 useEthersSigner debug:', {
      hasProvider: !!ethersProvider.value,
      hasAddress: !!address.value,
      address: address.value,
      provider: ethersProvider.value,
      isConnected: isConnected.value,
      chainId: chainId.value
    })
    
    if (!ethersProvider.value || !address.value) {
      console.warn('Missing provider or address for ethers signer', {
        hasProvider: !!ethersProvider.value,
        hasAddress: !!address.value,
        address: address.value
      })
      return undefined
    }
    
    try {
      const signer = new ethers.JsonRpcSigner(ethersProvider.value, address.value)
      console.log('✅ Ethers signer created successfully')
      return signer
    } catch (error) {
      console.error('Failed to create ethers signer:', error)
      return undefined
    }
  })

  return {
    ethersSigner,
    ethersProvider,
    chainId,
    isConnected,
    address
  }
}
