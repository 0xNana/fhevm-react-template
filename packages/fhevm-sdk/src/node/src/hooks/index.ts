/**
 * Wagmi-like hooks for Node.js FHEVM operations
 * 
 * This module provides React-like hooks for Node.js environments,
 * making it intuitive for web3 developers familiar with wagmi.
 */

export { useFHEVM } from './useFHEVM.js'
export { useContract } from './useContract.js'
export { useReadContract } from './useReadContract.js'
export { useWriteContract } from './useWriteContract.js'
export { useEncrypt } from './useEncrypt.js'
export { useDecrypt } from './useDecrypt.js'
export { useBatchEncrypt } from './useBatchEncrypt.js'
export { useBatchDecrypt } from './useBatchDecrypt.js'
export { useFHEVMProvider } from './useFHEVMProvider.js'

// Re-export types
export type {
  FHEVMHookConfig,
  ContractHookConfig,
  ReadContractOptions,
  WriteContractOptions,
  EncryptOptions,
  DecryptOptions,
  BatchEncryptOptions,
  BatchDecryptOptions,
  FHEVMHookResult,
  ContractHookResult,
  ReadContractResult,
  WriteContractResult,
  EncryptResult,
  DecryptResult,
  BatchEncryptResult,
  BatchDecryptResult
} from './types.js'
