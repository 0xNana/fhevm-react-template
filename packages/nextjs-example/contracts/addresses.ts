// Contract addresses for deployed FHEVM contracts
export const CONTRACT_ADDRESSES = {
  FHECounter: process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ADDRESS,
  FHEVoting: process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
  FHEBank: process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS,
} as const
