// Contract addresses for deployed FHEVM contracts on Sepolia

declare const process: {
  env: {
    COUNTER_CONTRACT_ADDRESS?: string;
    VOTING_CONTRACT_ADDRESS?: string;
    BANK_CONTRACT_ADDRESS?: string;
  };
};

export const CONTRACT_ADDRESSES = {
  FHECounter: (typeof process !== 'undefined' && process.env.COUNTER_CONTRACT_ADDRESS) ? process.env.COUNTER_CONTRACT_ADDRESS : '0xaD920A4E9ACD84aA5F094e128b0d811eDB12F57F',
  FHEVoting: (typeof process !== 'undefined' && process.env.VOTING_CONTRACT_ADDRESS) ? process.env.VOTING_CONTRACT_ADDRESS : '0x8eAf5350f6E26051f7902109BD3a8709abB6Fb14',
  FHEBank: (typeof process !== 'undefined' && process.env.BANK_CONTRACT_ADDRESS) ? process.env.BANK_CONTRACT_ADDRESS : '0xA020287B1670453919C2f49e2e8c2C09B96101B8',
} as const

export type ContractName = keyof typeof CONTRACT_ADDRESSES
