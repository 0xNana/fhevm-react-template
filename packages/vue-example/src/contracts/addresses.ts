// Contract addresses for deployed FHEVM contracts on Sepolia
export const CONTRACT_ADDRESSES = {
  FHECounter: import.meta.env.VITE_COUNTER_CONTRACT_ADDRESS,
  FHEVoting: import.meta.env.VITE_VOTING_CONTRACT_ADDRESS,
  FHEBank: import.meta.env.VITE_BANK_CONTRACT_ADDRESS,
} as const
