// Composables
export { useFHEVM } from "./composables/useFHEVM.js";
export { useEncryption } from "./composables/useEncryption.js";
export { useDecryption } from "./composables/useDecryption.js";
export { useEthersSigner } from "./composables/useEthersSigner.js";
export { useFHEVMSignature } from "./composables/useFHEVMSignature.js";
export { useFHEDecrypt } from "./composables/useFHEDecrypt.js";
export { useInMemoryStorage } from "./composables/useInMemoryStorage.js";

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
  FHEVMDecryptionError,
  FhevmDecryptionSignature
} from "../../index.js";

// Composable types
export type { UseEncryptionOptions } from "./composables/useEncryption.js";
export type { UseDecryptionOptions } from "./composables/useDecryption.js";
export type { UseEthersSignerOptions } from "./composables/useEthersSigner.js";
