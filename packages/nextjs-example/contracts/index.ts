// Import ABIs
import FHECounterABI from './abis/FHECounter.json'
import FHEVotingABI from './abis/FHEVoting.json'
import FHEBankABI from './abis/FHEBank.json'

// Import addresses and types
import { CONTRACT_ADDRESSES, type ContractName } from './addresses'

// Export all contract ABIs and addresses
export { CONTRACT_ADDRESSES, type ContractName } from './addresses'

// Export ABIs
export const CONTRACT_ABIS = {
  FHECounter: FHECounterABI,
  FHEVoting: FHEVotingABI,
  FHEBank: FHEBankABI,
} as const

// Helper function to get contract config
export function getContractConfig(contractName: ContractName) {
  return {
    address: CONTRACT_ADDRESSES[contractName],
    abi: CONTRACT_ABIS[contractName].abi, 
  }
}

const createDeployedContractsStructure = () => {
  const chainIds = [31337, 11155111] // hardhat, sepolia
  const contracts: Record<number, Record<string, { address: string; abi: any[]; inheritedFunctions?: Record<string, string>; deployedOnBlock?: number }>> = {}
  
  for (const chainId of chainIds) {
    contracts[chainId] = {
      FHECounter: {
        address: CONTRACT_ADDRESSES.FHECounter,
        abi: CONTRACT_ABIS.FHECounter.abi,
        inheritedFunctions: {},
      },
      FHEVoting: {
        address: CONTRACT_ADDRESSES.FHEVoting,
        abi: CONTRACT_ABIS.FHEVoting.abi,
        inheritedFunctions: {},
      },
      FHEBank: {
        address: CONTRACT_ADDRESSES.FHEBank,
        abi: CONTRACT_ABIS.FHEBank.abi,
        inheritedFunctions: {},
      },
    }
  }
  
  return contracts
}

// Export as default for compatibility with existing imports
export default createDeployedContractsStructure()
