import type { FhevmInstance as _FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { HandleContractPair as _HandleContractPair } from "@zama-fhe/relayer-sdk/bundle";
import type { DecryptedResults as _DecryptedResults } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig as _FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";
import type { Eip1193Provider } from "ethers";
import type { FhevmDecryptionSignatureType } from "./fhevmTypes.js";

// Re-export FHEVM types
export type FhevmInstance = _FhevmInstance;
export type FhevmInstanceConfig = _FhevmInstanceConfig;
export type HandleContractPair = _HandleContractPair;
export type DecryptedResults = _DecryptedResults;

// Core SDK Configuration
export interface FHEVMConfig {
  /** RPC URL for the blockchain network */
  rpcUrl: string;
  /** Chain ID for the network */
  chainId: number;
  /** Optional mock chains for local development */
  mockChains?: Record<number, string>;
  /** Optional storage for decryption signatures */
  storage?: FHEVMStorage;
  /** Optional abort signal for cancellation */
  signal?: AbortSignal;
}

// Storage interface for decryption signatures
export interface FHEVMStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Encryption options
export interface EncryptionOptions {
  /** Public key for encryption */
  publicKey: string;
  /** Contract address (optional) */
  contractAddress?: string;
  /** Additional parameters */
  params?: Record<string, any>;
}

// Decryption options
export interface DecryptionOptions {
  /** Encrypted handle to decrypt */
  handle: string;
  /** Contract address */
  contractAddress: string;
  /** User signature for userDecrypt */
  signature?: string | FhevmDecryptionSignatureType;
  /** Use public decryption (no signature required) */
  usePublicDecrypt?: boolean;
}

// Client status
export type FHEVMStatus = 
  | "idle"
  | "loading"
  | "ready"
  | "error";

// Client state
export interface FHEVMState {
  status: FHEVMStatus;
  instance: FhevmInstance | null;
  error: Error | null;
  isInitialized: boolean;
}

// Event handlers
export interface FHEVMEvents {
  onStatusChange?: (status: FHEVMStatus) => void;
  onError?: (error: Error) => void;
  onReady?: (instance: FhevmInstance) => void;
}

// Provider types
export type FHEVMProvider = Eip1193Provider | string;

// Mock chain configuration
export interface MockChainConfig {
  chainId: number;
  rpcUrl: string;
  metadata?: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}

// Error types
export class FHEVMError extends Error {
  constructor(
    message: string,
    public code: string,
    public override cause?: unknown
  ) {
    super(message);
    this.name = "FHEVMError";
  }
}

export class FHEVMAbortError extends FHEVMError {
  constructor(message = "FHEVM operation was cancelled") {
    super(message, "ABORTED");
    this.name = "FHEVMAbortError";
  }
}

export class FHEVMNotInitializedError extends FHEVMError {
  constructor() {
    super("FHEVM client is not initialized", "NOT_INITIALIZED");
    this.name = "FHEVMNotInitializedError";
  }
}

export class FHEVMEncryptionError extends FHEVMError {
  constructor(message: string, cause?: unknown) {
    super(message, "ENCRYPTION_FAILED", cause);
    this.name = "FHEVMEncryptionError";
  }
}

export class FHEVMDecryptionError extends FHEVMError {
  constructor(message: string, cause?: unknown) {
    super(message, "DECRYPTION_FAILED", cause);
    this.name = "FHEVMDecryptionError";
  }
}
