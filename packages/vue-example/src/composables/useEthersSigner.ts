import { computed, ref } from 'vue'
import { useAccount } from '@wagmi/vue'
import { ethers } from 'ethers'

/**
 * Vue composable for getting ethers signer from wagmi
 * Based on the React useWagmiEthers hook
 */
export function useEthersSigner() {
  const { address, isConnected, chain } = useAccount()
  
  // We need to get the wallet client, but since useWalletClient is not available in @wagmi/vue,
  // we'll use a different approach with the global window.ethereum
  const walletClient = ref<any>(null)

  // Try to get the wallet client from window.ethereum
  const getWalletClient = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum
    }
    return null
  }

  const ethersProvider = computed(() => {
    const client = getWalletClient()
    if (!client) return undefined

    const eip1193Provider = {
      request: async (args: any) => {
        return await client.request(args)
      },
      on: () => {
        console.log("Provider events not fully implemented for wagmi")
      },
      removeListener: () => {
        console.log("Provider removeListener not fully implemented for wagmi")
      },
    } as ethers.Eip1193Provider

    return new ethers.BrowserProvider(eip1193Provider)
  })

  const ethersSigner = computed(() => {
    if (!ethersProvider.value || !address.value) return undefined
    return new ethers.JsonRpcSigner(ethersProvider.value, address.value)
  })

  return {
    ethersSigner,
    ethersProvider,
    chainId: computed(() => chain.value?.id),
    isConnected,
    address
  }
}
