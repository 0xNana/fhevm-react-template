import type { FhevmInstance as _FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { HandleContractPair as _HandleContractPair } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig as _FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";
import type { RelayerEncryptedInput as _RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import type { Eip1193Provider } from "ethers";
import type { FhevmDecryptionSignatureType } from "./fhevmTypes.js";
export type FhevmInstance = _FhevmInstance;
export type FhevmInstanceConfig = _FhevmInstanceConfig;
export type HandleContractPair = _HandleContractPair;
export type RelayerEncryptedInput = _RelayerEncryptedInput;
export type DecryptedResults = Record<string, number> | number;
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
export interface FHEVMStorage {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}
export interface EncryptionOptions {
    /** Public key for encryption */
    publicKey: string;
    /** Contract address (optional) */
    contractAddress?: string;
    /** Additional parameters */
    params?: Record<string, any>;
}
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
export type FHEVMStatus = "idle" | "loading" | "ready" | "error";
export interface FHEVMState {
    status: FHEVMStatus;
    instance: FhevmInstance | null;
    error: Error | null;
    isInitialized: boolean;
}
export interface FHEVMEvents {
    onStatusChange?: (status: FHEVMStatus) => void;
    onError?: (error: Error) => void;
    onReady?: (instance: FhevmInstance) => void;
}
export type FHEVMProvider = Eip1193Provider | string;
export interface MockChainConfig {
    chainId: number;
    rpcUrl: string;
    metadata?: {
        ACLAddress: `0x${string}`;
        InputVerifierAddress: `0x${string}`;
        KMSVerifierAddress: `0x${string}`;
    };
}
export declare class FHEVMError extends Error {
    code: string;
    cause?: unknown | undefined;
    constructor(message: string, code: string, cause?: unknown | undefined);
}
export declare class FHEVMAbortError extends FHEVMError {
    constructor(message?: string);
}
export declare class FHEVMNotInitializedError extends FHEVMError {
    constructor();
}
export declare class FHEVMEncryptionError extends FHEVMError {
    constructor(message: string, cause?: unknown);
}
export declare class FHEVMDecryptionError extends FHEVMError {
    constructor(message: string, cause?: unknown);
}
//# sourceMappingURL=types.d.ts.map