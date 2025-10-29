// Import ABIs
import FHECounterArtifact from './abis/FHECounter.json'
import FHEVotingArtifact from './abis/FHEVoting.json'
import FHEBankArtifact from './abis/FHEBank.json'

// Import addresses and types
import { CONTRACT_ADDRESSES, type ContractName } from './addresses'

// Export all contract ABIs and addresses
export { CONTRACT_ADDRESSES, type ContractName } from './addresses'

// Extract ABI arrays from Hardhat artifacts
export const CONTRACT_ABIS = {
  FHECounter: FHECounterArtifact.abi,
  FHEVoting: FHEVotingArtifact.abi,
  FHEBank: FHEBankArtifact.abi,
} as const

// Helper function to get contract config
export function getContractConfig(contractName: ContractName) {
  return {
    address: CONTRACT_ADDRESSES[contractName],
    abi: CONTRACT_ABIS[contractName],
  }
}
