// Utilities
export {
  createFHEVMClientForNode,
  encryptValue,
  decryptValue,
  batchEncrypt,
  batchDecrypt,
  userDecryptWithSignature,
  publicDecrypt,
  batchUserDecryptWithSignatures,
  batchPublicDecrypt
} from "./utilities.js";

// Real FHEVM Client
export {
  createRealFHEVMClientForNode,
  FHEVMClientWithInstance
} from "./fhevmClientWithInstance.js";


// Hooks (Wagmi-like structure)
export * from "./hooks/index.js";

// Re-export core types and utilities
export type {
  FHEVMConfig,
  FHEVMState,
  FHEVMStatus,
  FHEVMStorage,
  EncryptionOptions,
  DecryptionOptions,
  FHEVMEvents,
  FhevmInstance,
  FhevmInstanceConfig
} from "../../index.js";

export {
  createFHEVMClient,
  createDefaultStorage,
  createInMemoryStorage,
  createLocalStorage,
  FHEVMError,
  FHEVMAbortError,
  FHEVMNotInitializedError,
  FHEVMEncryptionError,
  FHEVMDecryptionError
} from "../../index.js";
