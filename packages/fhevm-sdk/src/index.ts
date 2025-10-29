// Main exports
export { FHEVMClient, createFHEVMClient } from "./client.js";

// Type exports
export type {
  FHEVMConfig,
  FHEVMState,
  FHEVMStatus,
  FHEVMStorage,
  EncryptionOptions,
  DecryptionOptions,
  FHEVMEvents,
  FHEVMProvider,
  MockChainConfig,
  FhevmInstance,
  FhevmInstanceConfig,
  HandleContractPair,
  DecryptedResults
} from "./types.js";

// Error exports
export {
  FHEVMError,
  FHEVMAbortError,
  FHEVMNotInitializedError,
  FHEVMEncryptionError,
  FHEVMDecryptionError
} from "./types.js";

// Storage utilities
export {
  createDefaultStorage,
  createInMemoryStorage,
  createLocalStorage
} from "./storage/index.js";

// Storage types and implementations
export * from "./storage/index.js";

// FHEVM Decryption Signature
export { FhevmDecryptionSignature } from "./FhevmDecryptionSignature.js";

// Re-export types for convenience
export * from "./types.js";
export * from "./utilities/index.js";
