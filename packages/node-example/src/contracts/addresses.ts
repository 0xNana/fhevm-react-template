// Contract addresses for deployed FHEVM contracts on Sepolia

declare const process: {
  env: {
    COUNTER_CONTRACT_ADDRESS?: string;
    VOTING_CONTRACT_ADDRESS?: string;
    BANK_CONTRACT_ADDRESS?: string;
  };
};

export const CONTRACT_ADDRESSES = {
  FHECounter: process.env.COUNTER_CONTRACT_ADDRESS,
  FHEVoting: process.env.VOTING_CONTRACT_ADDRESS,
  FHEBank: process.env.BANK_CONTRACT_ADDRESS
} as const
