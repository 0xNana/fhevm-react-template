import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { FHEVMConfig, FHEVMState, FHEVMStatus, EncryptionOptions, DecryptionOptions, FHEVMEvents } from "./types.js";
/**
 * Universal FHEVM Client - Framework agnostic core for FHEVM operations
 *
 * This is the main client class that provides a simple, intuitive API
 * for FHEVM operations across all frameworks.
 */
export declare class FHEVMClient {
    private _state;
    private _config;
    private _events;
    private _abortController;
    constructor(config: FHEVMConfig, events?: FHEVMEvents);
    /**
     * Initialize the FHEVM client
     */
    initialize(): Promise<void>;
    /**
     * Encrypt a value using FHEVM
     */
    encrypt(value: number, options: EncryptionOptions): Promise<string>;
    /**
     * Decrypt an encrypted value
     */
    decrypt(options: DecryptionOptions): Promise<number>;
    /**
     * Get the current state of the client
     */
    getState(): FHEVMState;
    /**
     * Get the FHEVM instance (if initialized)
     */
    getInstance(): FhevmInstance | null;
    /**
     * Check if the client is ready
     */
    isReady(): boolean;
    /**
     * Get the current status
     */
    getStatus(): FHEVMStatus;
    /**
     * Get the current error (if any)
     */
    getError(): Error | null;
    /**
     * Refresh/reinitialize the client
     */
    refresh(): Promise<void>;
    /**
     * Destroy the client and cleanup resources
     */
    destroy(): void;
    private _ensureInitialized;
    private _setStatus;
    private _handleError;
    private _createMergedSignal;
}
/**
 * Create a new FHEVM client instance
 */
export declare function createFHEVMClient(config: FHEVMConfig, events?: FHEVMEvents): FHEVMClient;
//# sourceMappingURL=client.d.ts.map