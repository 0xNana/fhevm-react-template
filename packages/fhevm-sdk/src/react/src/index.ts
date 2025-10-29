// Hooks
export { useFHEVM } from "./hooks/useFHEVM.js";
export { useEncrypt } from "./hooks/useEncrypt.js";
export { useDecrypt } from "./hooks/useDecrypt.js";
export { useContract } from "./hooks/useContract.js";
export { useFHEVMSignature } from "./hooks/useFHEVMSignature.js";
export { useFHEDecrypt } from "./hooks/useFHEDecrypt.js";

// Components
export { FHEVMProvider, useFHEVMContext } from "./components/FHEVMProvider.js";
export { EncryptButton } from "./components/EncryptButton.js";
export { DecryptButton } from "./components/DecryptButton.js";

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

// Hook types
export type { UseEncryptOptions, UseEncryptReturn } from "./hooks/useEncrypt.js";
export type { UseDecryptOptions, UseDecryptReturn } from "./hooks/useDecrypt.js";
export type { UseContractOptions, UseContractReturn } from "./hooks/useContract.js";
export type { FHEDecryptRequest } from "./hooks/useFHEDecrypt.js";

// Component types
export type { FHEVMProviderProps } from "./components/FHEVMProvider.js";
export type { EncryptButtonProps } from "./components/EncryptButton.js";
export type { DecryptButtonProps } from "./components/DecryptButton.js";
export * from "./hooks/index.js";
