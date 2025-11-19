import type { FhevmInstance } from '../../types.js';
import type { FHEVMConfig, FHEVMEvents, EncryptionOptions, DecryptionOptions } from '../../types.js';
/**
 * FHEVM Client with Real Instance - Node.js implementation
 *
 * This class wraps a real FhevmInstance from the relayer SDK
 * and provides the same interface as the core FHEVMClient.
 */
export declare class FHEVMClientWithInstance {
    private _instance;
    private _config;
    private _isInitialized;
    constructor(instance: FhevmInstance, config: FHEVMConfig, _events?: FHEVMEvents);
    /**
     * Initialize the client (already initialized with real instance)
     */
    initialize(): Promise<void>;
    /**
     * Encrypt a value using the real FhevmInstance
     */
    encrypt(value: number, options: EncryptionOptions): Promise<{
        handles: string[];
        inputProof: string;
    }>;
    /**
     * Decrypt an encrypted value using the real FhevmInstance
     */
    decrypt(options: DecryptionOptions): Promise<number>;
    /**
     * Get the FhevmInstance (for advanced usage)
     */
    getInstance(): FhevmInstance;
    /**
     * Check if the client is ready
     */
    isReady(): boolean;
    /**
     * Get the current status
     */
    getStatus(): string;
    /**
     * Get the current error (if any)
     */
    getError(): Error | null;
    /**
     * Refresh/reinitialize the client
     */
    refresh(): Promise<void>;
    /**
     * Destroy the client
     */
    destroy(): void;
    private _ensureInitialized;
}
/**
 * Create a real FHEVM client for Node.js using the relayer SDK
 *
 * This function creates an EIP-1193 compatible provider wrapper around
 * the RPC URL and initializes the FHEVM instance with proper configuration.
 *
 * @param config FHEVM configuration with RPC URL and chain ID
 * @param events Optional event handlers
 * @returns FHEVM client with real instance
 */
export declare function createRealFHEVMClientForNode(config: FHEVMConfig, events?: FHEVMEvents): Promise<FHEVMClientWithInstance>;
//# sourceMappingURL=fhevmClientWithInstance.d.ts.map